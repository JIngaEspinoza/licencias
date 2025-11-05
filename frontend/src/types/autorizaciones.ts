export type VistaDTO = {
  nombre: string;
  items: {
    key: string;
    titulo: string;
    vigencia?: string | null;
    presentacion?: string | null;
    tarifa?: string | null;
    nota?: string | null;
    base?: string | null;
    requisitos: string[];
  }[];
};