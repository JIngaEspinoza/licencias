import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as oracledb from 'oracledb';

@Injectable()
export class TramiteService implements OnModuleInit{
  private readonly logger = new Logger(TramiteService.name);

  onModuleInit() {
    // Activamos el modo ligero (Thin Mode) explícitamente si es necesario
    // En oracledb 6.0+ ya viene por defecto.
  }

  async buscarExpedientes(terminoBusqueda: string) {
    let connection;

    try {
      connection = await oracledb.getConnection({
        user: process.env.TRAMITE_DB_USER,
        password: process.env.TRAMITE_DB_PASS,
        connectString: process.env.TRAMITE_DB_CONN_STR,
      });

      // 1. Usamos LIKE para que el usuario pueda buscar por partes del número
      // 2. Mapeamos los nombres a algo más legible para tu Frontend (alias)
      const sql = `
        SELECT 
          T.TRAM_IN_CODIGO as id,
          T.TRAM_VC_NUMERO as numero,
          TU.TUPA_VC_DESCRIPCION as procedimiento,
          T.TRAM_DA_DOCUMENTO as fecha_documento
        FROM TRAMITE T
        JOIN TRAMITE_EXTERNO TE ON T.TRAM_IN_CODIGO = TE.TRAM_IN_CODIGO
        JOIN ORG O ON T.ORG_IN_DIRIGIDO = O.ORGA_IN_CODIGO
        JOIN TUPA TU ON TE.TUPA_IN_CODIGO = TU.TUPA_IN_CODIGO
        WHERE T.ORG_IN_DIRIGIDO IN (53, 214)
        AND UPPER(T.TRAM_VC_NUMERO) LIKE UPPER(:termino)
        ORDER BY T.TRAM_DA_DOCUMENTO DESC
        FETCH FIRST 20 ROWS ONLY
      `;

      const result = await connection.execute(
        sql, 
        { termino: `%${terminoBusqueda}%` }, // Concatenamos los comodines de Oracle
        { outFormat: oracledb.OUT_FORMAT_OBJECT } 
      );

      console.log(result.rows);

      // Retornamos todos los registros encontrados para que el usuario elija
      return result.rows;

    } catch (err) {
      this.logger.error('Error en el buscador de Oracle:', err.message);
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (err) {
          this.logger.error('Error cerrando conexión:', err.message);
        }
      }
    }
  }
}
