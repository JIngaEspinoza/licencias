import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../types/components/ui/card";

interface SeccionCardProps {
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string; // Por si quieres añadir estilos extra desde fuera
}

export const SeccionCard: React.FC<SeccionCardProps> = ({ 
  title, 
  disabled, 
  children,
  className = "" 
}) => {
  return (
    <Card className={`rounded-2xl border bg-white/70 shadow-sm transition-opacity ${disabled ? "opacity-50 pointer-events-none" : ""} ${className}`}>
      <CardHeader className="pb-3 px-5 pt-5">
        <CardTitle className="font-semibold text-base uppercase tracking-tight text-slate-700">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-3">
        {children}
      </CardContent>
    </Card>
  );
};