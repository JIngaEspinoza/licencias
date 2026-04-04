import { BadRequestException, Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import * as oracledb from 'oracledb';

@Injectable()
export class RecibosService implements OnModuleInit {
  private readonly logger = new Logger(RecibosService.name);

  onModuleInit() {}

  async buscarRecibos(nrorecibo: string) {
    const nroLimpio = nrorecibo?.trim();
    const formatoValido = /^\d+-\d+$/.test(nroLimpio);

    if (!formatoValido) {
      throw new BadRequestException({
        success: false,
        message: 'Formato inválido. Use: Correlativo-Año (Ej: 000456-2026)',
      });
    }

    let connection;
    const [reciboPart, annoPart] = nroLimpio.split('-');
    const parametros = {
      annorecibo: String(annoPart),
      nrorecibo: parseInt(reciboPart, 10)
    };

    try {
      connection = await oracledb.getConnection({
        user: process.env.SAMNET_DB_USER,
        password: process.env.SAMNET_DB_PASS,
        connectString: process.env.SAMNET_DB_CONN_STR,
      });

      const sql = `
        SELECT a.codcontribuyente,
          b.titulo,
          a.anno_recibo,
          LPAD(TO_CHAR(a.sec_recibo), 6, '0') as nrorecibo,
          a.codinterno,
          TO_DATE(a.fecha_generacion, 'YYYYMMDD') as fecha_pago,
          TO_CHAR(TO_DATE(a.horageneracion, 'HH24MISS'), 'HH24:MI:SS') as hora_pago,
          a.USUARIO
        FROM recibo a
        INNER JOIN contribuyente b ON a.codcontribuyente = b.codcontribuyente
        WHERE a.anno_recibo = :annorecibo 
          AND a.sec_recibo = :nrorecibo
      `;

      const result = await connection.execute(
        sql,
        parametros,
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      // Si no hay filas, retornamos un mensaje amigable para la pantalla
      if (!result.rows || result.rows.length === 0) {
        return {
          success: false,
          message: `No se encontró ningún recibo con el número ${nroLimpio}`,
          data: []
        };
      }

      // Éxito: Retornamos los datos y un mensaje opcional
      return {
        success: true,
        message: 'Recibo encontrado correctamente',
        data: result.rows
      };

    } catch (err) {
      this.logger.error('Error en el buscador de Oracle:', err.message);
      throw new InternalServerErrorException({
        success: false,
        message: 'Error interno en el servidor de base de datos',
        error: err.message
      });
    } finally {
      if (connection) {
        try { await connection.close(); } 
        catch (err) { this.logger.error('Error cerrando conexión:', err.message); }
      }
    }
  }
}
