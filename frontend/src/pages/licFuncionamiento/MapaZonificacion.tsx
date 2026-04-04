import React, { memo, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, GeoJSON, Popup } from 'react-leaflet';
import { LocateFixed } from 'lucide-react';
// @ts-ignore - Soluciona el error TS7016 de falta de tipos en el servidor
import L from 'leaflet';

interface MapaZonificacionProps {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  datosGeoJSON: any;
  lineaMapa: any;
  eventHandlers: any;
  iconMaker: string;
  markerRef: React.RefObject<L.Marker | null>;
}

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  // @ts-ignore
  map.setView(center);
  return null;
};

const colors: Record<string, string> = {
    'RDM': '#FABF8F',
    'RDA': '#996633',
    'CV': '#FFBEBE',
    'CZ': '#FF0000',
    'CM': '#A50021',
    'I1': '#F1C5FF',
    'I2': '#DB69FF',
    'ZRP': '#73FF31',
};

const iconoAzul = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconoVerde = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export const MapaZonificacion = memo(({ 
  position, 
  setPosition, 
  datosGeoJSON, 
  lineaMapa, 
  eventHandlers, 
  iconMaker,
  markerRef,
}: MapaZonificacionProps) => {

  const geojsonStyle = useMemo(() => (feature: any) => {
    const zona = feature.properties.layer?.trim();
    const colorPrincipal = colors[zona] || 'gray';
    return {
      fill: true,
      fillColor: colorPrincipal,
      color: colorPrincipal,
      weight: 0.5,
      opacity: 0.8,
      fillOpacity: 0.6,
    };
  }, []);

  return (
    <div className="relative w-full h-72 rounded-xl border-2 border-slate-200 bg-slate-100 overflow-hidden shadow-sm z-0">
      <MapContainer 
        className="h-full w-full"
        // @ts-ignore
        center={position} 
        zoom={14} 
        minZoom={12}
        maxZoom={18}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        
        {/* @ts-ignore */}
        <ChangeView center={position} />
        
        <Marker 
          // @ts-ignore - Soluciona error de 'draggable' no existente
          draggable={true}
          // @ts-ignore
          eventHandlers={eventHandlers}
          // @ts-ignore
          position={position}
          icon={iconMaker === 'busqueda' ? iconoVerde : iconoAzul} 
          ref={markerRef}
        >
          <Popup>
            {iconMaker === 'busqueda' 
              ? "📍 Dirección encontrada mediante búsqueda" 
              : "🖐️ Ubicación ajustada manualmente"}
          </Popup>
        </Marker>

        {/* @ts-ignore - Soluciona error de 'style' no existente en GeoJSON */}
        <GeoJSON data={datosGeoJSON} style={geojsonStyle} />
        
        {/* @ts-ignore - Soluciona error de 'style' no existente en GeoJSON */}
        <GeoJSON data={lineaMapa} style={{ color: '#0f766e', weight: 2 }} />
      </MapContainer>

      <button 
        type="button"
        onClick={() => setPosition([-12.075, -77.085])}
        className="absolute bottom-4 right-4 bg-white p-2 rounded-full shadow-lg border border-slate-200 text-slate-600 hover:text-[#0f766e] transition-colors z-[1000]"
      >
        <LocateFixed size={20} />
      </button>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.position === nextProps.position &&
    prevProps.datosGeoJSON === nextProps.datosGeoJSON
  );
});

export default MapaZonificacion;