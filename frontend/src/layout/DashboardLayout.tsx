import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; 
import Header from '../components/Header';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Función para alternar (abrir/cerrar)
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      <Sidebar 
        open={sidebarOpen} 
        onClose={closeSidebar} 
      />

      {/* CAMBIO CLAVE:
          Usamos un template literal para que el padding sea 64 o 0.
          Añadimos 'transition-all duration-300' para que el movimiento sea suave.
      */}
      <div className={`
        flex-1 flex flex-col min-w-0 transition-all duration-300
        ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'}
      `}>
        
        {/* Usamos toggleSidebar para que el mismo botón abra y cierre */}
        <Header onToggleSidebar={toggleSidebar} />

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
}