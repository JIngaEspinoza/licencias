import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ReniecResponse } from './interfaces/reniec-response.interfaces';
import { firstValueFrom } from 'rxjs';
import oracledb from 'oracledb';
import { data } from 'framer-motion/client';

@Injectable()
export class PideService {
  private readonly logger = new Logger(PideService.name);

  constructor(private readonly httpService: HttpService) {}

  async consultarDni(dniInput: string) {
    const dniLimpio = dniInput.trim();

    // 1. VALIDACIÓN: 8 (DNI) o 9 (CE) dígitos
    if (!/^[0-9]{8,9}$/.test(dniLimpio)) {
      return { success: false, message: 'El documento debe tener 8 o 9 dígitos numéricos.' };
    }

    let connection;
    try {
      connection = await oracledb.getConnection({
        user: process.env.SAMNET_DB_USER,
        password: process.env.SAMNET_DB_PASS,
        connectString: process.env.SAMNET_DB_CONN_STR,
      });

      // 2. BUSCAR EN BD LOCAL (Ahorro de consultas)
      const sqlBusqueda = `SELECT DNI,NOMBRE, APATERNO, AMATERNO, DIRECCION, ESTADO_CIVIL, RESTRICCION FROM SMIGUEL.USUARIO_RENIEC WHERE DNI = :dni`;
      const resultLocal: any = await connection.execute(sqlBusqueda, { dni: dniLimpio }, { outFormat: oracledb.OUT_FORMAT_OBJECT });

      if (resultLocal.rows.length > 0) {
        this.logger.log(`DNI ${dniLimpio} servido desde Cache Local.`);
        return { success: true, source: 'local', data: resultLocal.rows[0] };
      }

      // 3. SI NO EXISTE, CONSULTAR PIDE EXTERNO
      let dataPide = await this.ejecutarConsultaExterna(dniLimpio);
      if (dataPide?.coResultado === 'ERROR_ESTRUCTURADO') {
        return { success: false, message: dataPide.mensaje };
      }

      if (dataPide?.coResultado === '1002') {
        this.logger.warn('Credencial 1002 detectada. Intentando auto-actualización...');
        const actualizo = await this.actualizarClave();
        if (actualizo) {
          await this.ejecutarConsultaExterna(dniLimpio);
        }
        return { success: false, message: 'Error de credenciales (1002). Se intentó actualizar, por favor reintente la búsqueda.' };
      }
      
      // 5. VALIDAR SI OBTUVIMOS DATOS DE PIDE
      if (dataPide && dataPide.coResultado === '0000') {
        const persona = dataPide.datosPersona;
        // 6. INSERTAR EN BD LOCAL PARA LA PRÓXIMA VEZ
        const sqlInsert = `
          INSERT INTO SMIGUEL.USUARIO_RENIEC (DNI, NOMBRE, APATERNO, AMATERNO, DIRECCION, ESTADO_CIVIL, RESTRICCION, FECHA_REGISTRO, FECHA_ACTUALIZA)
          VALUES (:dni, :nom, :pat, :mat, :dir, :estcivil, :restric, SYSDATE, SYSDATE)
        `;
        await connection.execute(sqlInsert, {
          dni: dniLimpio,
          nom: persona.prenombres,
          pat: persona.apPrimer,
          mat: persona.apSegundo,
          dir: persona.direccion,
          estcivil: persona.estadoCivil,
          restric: persona.restriccion
        });
        await connection.commit();

        return { success: true, source: 'pide', data: dataPide };
      }

      return { success: false, message: dataPide?.deResultado || 'No se encontraron datos válidos.' };

    } catch (error) {
      this.logger.error(`Error en flujo DNI: ${error.message}`);
      throw new InternalServerErrorException('Error procesando la consulta de identidad.');
    } finally {
      if (connection) await connection.close();
    }
  }

  private async ejecutarConsultaExterna(dni: string) {
    const url = `${process.env.PIDE_URL_CONSULTADNI}?out=json`;
    /*this.logger.debug(`URL DETECTADA: '${url}'`);*/

    const body = {
      PIDE: {
        nuDniConsulta: dni,
        nuDniUsuario: process.env.PIDE_USUARIO_RENIEC?.trim(),
        nuRucUsuario: process.env.PIDE_RUCMUNI?.trim(),
        password: process.env.PIDE_CLAVE_RENIEC?.trim(),
      }
    };

    const config = {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    };

    try {
      const resp = await firstValueFrom(this.httpService.post(url, body, config));
      const data = resp.data;

      // --- 1. CASO DE ERROR ESTRUCTURADO EN "Respuesta" (Laravel logic) ---
      if (data.Respuesta) {
        const errorMsg = data.Respuesta.Error || 'Error desconocido';
        const option1 = data.Respuesta.Opcion_1 || '';
        const option2 = data.Respuesta.Opcion_2 || '';
        const fullError = `${errorMsg} ${option1} ${option2}`.trim();
        
        // Lanzamos un error interno para que lo capture el bloque try/catch del método principal
        throw new Error(`PIDE_ERROR_RESPUESTA: ${fullError}`);
      }

      // --- 2. VALIDAR EXISTENCIA DE "consultarResponse" ---
      if (!data.consultarResponse) {
        throw new Error('PIDE_ERROR_FORMATO: El servicio no devolvió consultarResponse.');
      }

      // --- 3. MANEJO DE ARRAY O OBJETO (Equivalente al foreach + break de Laravel) ---
      // PIDE a veces devuelve un array de un objeto o el objeto directo
      let item;
      if (Array.isArray(data.consultarResponse)) {
        item = data.consultarResponse[0];
      } else {
        item = data.consultarResponse;
      }

      //console.log(item)

      // --- 4. VALIDAR coResultado (Dentro del return o del item directamente) ---
      // Dependiendo de la versión de la PIDE, el coResultado puede estar en diferentes niveles
      const resultado = item?.return || item;

      if (!resultado || !resultado.coResultado) {
        throw new Error('PIDE_ERROR_INCOMPLETO: Respuesta incompleta del servicio RENIEC.');
      }

      console.log(resultado)

      return resultado;

    } catch (e) {
      // Si el error fue lanzado por nosotros arriba, lo propagamos
      if (e.message.includes('PIDE_ERROR')) {
        return { coResultado: 'ERROR_ESTRUCTURADO', mensaje: e.message.split(': ')[1] };
      }
      // Error de red o tiempo de espera
      this.logger.error(`Falla de conexión PIDE: ${e.message}`);
      return null;
    }
  }

  private async actualizarClave(): Promise<boolean> {
    const url = `${process.env.PIDE_URL_ACTUALIZA_DNI}?out=json`;
    const body = {
      PIDE: {
        credencialAnterior: process.env.PIDE_CLAVE_RENIEC,
        credencialNueva: process.env.PIDE_CLAVE_RENIEC,
        nuDni: process.env.PIDE_USUARIO_RENIEC,
        nuRuc: process.env.PIDE_RUCMUNI,
      }
    };

    const config = {
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
    };

    try {
      const resp = await firstValueFrom(this.httpService.post(url, body, config));
      const coResultado = resp.data?.actualizarcredencialResponse?.return?.coResultado;
      return coResultado === '0000';
    } catch (e) {
      this.logger.error('Fallo crítico al actualizar credencial PIDE');
      return false;
    }
  }

  async consultarCE(numCE: string) {
    const ceLimpio = numCE.trim();

    // 1. Ejecutar consulta externa
    const dataPide = await this.ejecutarConsultaCarnetExtranjeria(ceLimpio);

    // 2. Manejo de error si no hay respuesta
    if (!dataPide) {
      return { success: false, message: 'No se pudo conectar con el servicio de Migraciones.' };
    }

    // 3. Validar código de respuesta (0000 es éxito)
    const codRespuesta = String(dataPide.codRespuesta || '');
    
    if (codRespuesta === '0000') {
      return {
        success: true,
        source: 'pide',
        data: {
          codRespuesta: dataPide.codRespuesta,
          desRespuesta: dataPide.desRespuesta,
          datosPersonales: dataPide.datosPersonales
        }
      };
    } else {
      return {
        success: false,
        message: dataPide.desRespuesta || 'Error en la consulta de Migraciones.',
        codRespuesta: codRespuesta
      };
    }
  }

  private async ejecutarConsultaCarnetExtranjeria(numCE: string) {
    const url = `${process.env.PIDE_URL_CONSULTAEXT}?out=json`;

    console.log(url)
    
    const body = {
      PIDE: {
        username: process.env.PIDE_EXT_DNIADMIN?.trim(),
        password: process.env.PIDE_EXT_PASSWORD?.trim(),
        ip: process.env.PIDE_EXT_IP?.trim(),
        nivelacceso: process.env.PIDE_EXT_NIVELACCESO,
        docconsulta: numCE
      }
    };

    const config = {
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      timeout: 10000
    };

    try {
      const resp = await firstValueFrom(this.httpService.post(url, body, config));
      let data = resp.data;
      return data?.jsonObject || data;

    } catch (e) {
      this.logger.error(`Error Migraciones CEE: ${e.message}`);
      return null;
    }
  }

}
