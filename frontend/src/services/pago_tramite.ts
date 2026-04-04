import { http } from "../lib/http";
export type Pagos = {
  id_pago: number;
  id_expediente: number;
  concepto: string;
  nro_recibo: string;
  fecha_pago: string | Date;
  monto: number; 
}

export type ExpedienteCreate = Omit<Pagos, "id_expediente">;
export type ExpedienteUpdate = Partial<ExpedienteCreate>;
const BASE_PATH = "/pago-tramite";

export const pago_tramiteApi = {

  getDetallePago: async (id: number) => {
    return http<Pagos>(`${BASE_PATH}/${id}/pago`); 
  },

  generaPago: (payload: any) =>
    http<any>(`${BASE_PATH}/generar-pago`,{
      method: "POST",
      body: JSON.stringify(payload)
    }),

}