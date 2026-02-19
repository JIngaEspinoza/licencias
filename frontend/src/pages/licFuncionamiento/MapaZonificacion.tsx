import React, { memo, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, GeoJSON } from 'react-leaflet';
import { LocateFixed } from 'lucide-react';

// Componente para mover la vista (lo que ya tenías)
const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center);
  return null;
};

const colors = {
    'RDM': '#FABF8F',
    'RDA': '#996633',
    'CV': '#FFBEBE',
    'CZ': '#FF0000',
    'CM': '#A50021',
    'I1': '#F1C5FF',
    'I2': '#DB69FF',
    'ZRP': '#73FF31',
};

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export const MapaZonificacion = memo(({ 
  position, 
  setPosition, 
  datosGeoJSON, 
  lineaMapa, 
  eventHandlers, 
  
  markerRef,
   // Pasa tu objeto de colores como prop
}) => {

  // 1. Memorizamos el estilo para que no se recalcule al escribir en el form
  const geojsonStyle = useMemo(() => (feature) => {
    const zona = feature.properties.layer?.trim();
    const colorPrincipal = colors[zona] || 'gray';
    console.log(zona);
    return {
      fill: true,
      fillColor: colorPrincipal,
      color: colorPrincipal,
      weight: 0.5,
      opacity: 0.8,
      fillOpacity: 0.6,
    };
  });

  return (
    <div className="relative w-full h-72 rounded-xl border-2 border-slate-200 bg-slate-100 overflow-hidden shadow-sm z-0">
      <MapContainer 
        className="h-full w-full"
        center={position} 
        zoom={14} 
        minZoom={12}
        maxZoom={18}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <ChangeView center={position} />
        
        <Marker 
          draggable={true} 
          eventHandlers={eventHandlers} 
          position={position} 
          icon={customIcon} 
          ref={markerRef}
        />

        {/* 2. GeoJSON memorizado dentro del render de Leaflet */}
        <GeoJSON data={datosGeoJSON} style={geojsonStyle} />
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
  // 3. ESTA ES LA MAGIA: Solo re-renderiza el mapa si la posición o los datos cambian
  // Si el usuario escribe en un input del form, nextProps.position será igual a prevProps.position
  // y el mapa NO se tocará.
  return (
    prevProps.position === nextProps.position &&
    prevProps.datosGeoJSON === nextProps.datosGeoJSON
  );
});

export default MapaZonificacion;