import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar'; 
import Header from '../components/Header';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* SIDEBAR: Se mantiene fixed pero ahora el contenido lo respeta */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={closeSidebar} 
      />

      {/* CONTENEDOR PRINCIPAL: 
          Añadimos lg:pl-64 para que en escritorio el contenido no sea tapado por el menú */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        
        {/* HEADER: Ahora se verá completo desde el borde del Sidebar */}
        <Header onToggleSidebar={openSidebar} />

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>

      </div>
    </div>
  );
}