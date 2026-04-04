// src/leaflet-fix.d.ts
import * as L from 'leaflet';

declare module 'leaflet' {
  // 1. Exportamos el objeto principal por defecto (L)
  export default L;

  // 2. Mapeamos DragEndEvent al tipo interno que sí existe en Leaflet
  // Esto permite que tu "import { DragEndEvent }" funcione
  export type DragEndEvent = L.LeafletEvent;

  // 3. Re-exportamos todo lo demás del espacio de nombres original
  export * from 'leaflet';
}