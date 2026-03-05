import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as oracledb from 'oracledb';

@Injectable()
export class TramiteService implements OnModuleInit{
  private readonly logger = new Logger(TramiteService.name);

  onModuleInit() {
    // Activamos el modo ligero (Thin Mode) explícitamente si es necesario
    // En oracledb 6.0+ ya viene por defecto.
  }

  async obtenerExpediente(numero: string) {
    let connection;

    try {
      connection = await oracledb.getConnection({
        user: process.env.TRAMITE_DB_USER,
        password: process.env.TRAMITE_DB_PASS,
        connectString: process.env.TRAMITE_DB_CONN_STR,
      });

      // Tu consulta SQL para Oracle 12c
      const sql = `
        SELECT TRAM_VC_NUMERO, EXP_CODCON, EXP_NOMREC 
        FROM SM_TRAMITE 
        WHERE EXP_CODCON LIKE :num
      `;

      const result = await connection.execute(
        sql, 
        { num: numero }, // Binding por seguridad contra SQL Injection
        { outFormat: oracledb.OUT_FORMAT_OBJECT } // Para recibir un JSON limpio
      );

      return result.rows;

    } catch (err) {
      this.logger.error('Error consultando Oracle 12c:', err.message);
      throw err;
    } finally {
      if (connection) {
        try {
          await connection.close(); // Cerramos siempre para liberar memoria
        } catch (err) {
          this.logger.error('Error cerrando conexión:', err.message);
        }
      }
    }
  }
}
