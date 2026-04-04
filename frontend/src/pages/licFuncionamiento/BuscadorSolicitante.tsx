import React, { memo, useState, useEffect, useRef } from 'react';

const inputStyle = "w-full h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-50 outline-none transition-all placeholder:text-slate-400 uppercase";

export const BuscadorSolicitante = memo(({ 
  setValue, 
  getValues, 
  onSearch, 
  setShowSuggestions,
  defaultValue = "" 
}: any) => {
  const [localValue, setLocalValue] = useState(defaultValue);
  //const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sincronización: Si el padre cambia el valor (ej. al seleccionar o limpiar), el hijo actualiza su vista
  useEffect(() => {
    setLocalValue(defaultValue);
  }, [defaultValue]);

  return (
    <input 
      className={inputStyle}
      placeholder="Escriba el nombre o RUC del solicitante"
      autoComplete="off"
      value={localValue}
      onFocus={() => {
        setShowSuggestions(true);
        // Si hay texto, disparamos onSearch para que el useEffect del padre se ejecute
        if (localValue) onSearch(localValue);
      }}
      onChange={(e) => {
        const val = e.target.value;
        setLocalValue(val);

        // Limpieza inmediata si se borra todo
        if (val.trim() === "") {
          setValue("id_persona", null);
          setValue("nombre_razon_social", "");
          onSearch(""); // Esto hará que el useEffect del padre limpie la lista
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
          setValue("nombre_razon_social", val);
          onSearch(val);
        }, 500);

        setShowSuggestions(true);
      }}
    />
  );
});