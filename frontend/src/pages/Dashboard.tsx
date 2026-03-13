import { useEffect, useState } from 'react';
import ChartCard from '../components/ChartCard'
import { PlusCircle, Search, FileText, CheckCircle, Clock, FileCheck, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'; // Opcional: npm install date-fns
import { es } from 'date-fns/locale';
import { http } from "../lib/http";

export default function Dashboard() {
    const [stats, setStats] = useState({ totalLicencias: 0, totalPersonas: 0, totalPendientes: 0, tendenciaLicencias: 0, tendenciaPersonas: 0, statusPendientes: 0 });
    const [loading, setLoading] = useState(true);
    const API_URL = import.meta.env.VITE_API_URL;
    const [actividades, setActividades] = useState([]);
    const [chartData, setChartData] = useState([]);

    /*useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await http<any>(`/expedientes/stats/dashboard`, { 
                    auth: true 
                });
                
                console.log(data)
                setStats(data);
            } catch (error) {
                console.error("Error cargando KPIs", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    useEffect(() => {
        const fetchActividad = async () => {
            try {
                const data = await http<any>(`/expedientes/stats/recent`, { auth: true });              
                setActividades(data);
            } catch (error) {
                console.error("Error en actividad reciente", error);
            }
        };
        fetchActividad();
    }, []);

    useEffect(() => {
        const fetchChart = async () => {
            const data = await http<any>(`/expedientes/stats/chart`, { auth: true });
            setChartData(data);
        };
        fetchChart();
    }, []);*/

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const [stats, actividad, chart] = await Promise.all([
                    http<any>(`/expedientes/stats/dashboard`, { auth: true }),
                    http<any>(`/expedientes/stats/recent`, { auth: true }),
                    http<any>(`/expedientes/stats/chart`, { auth: true })
                ]);

                // Actualizamos los estados con los resultados
                setStats(stats);
                setActividades(actividad);
                setChartData(chart);
                
            } catch (error) {
                console.error("Error cargando datos del dashboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) return <div className="p-6 text-slate-500">Cargando panel...</div>;

    return (
        <div className="p-6 space-y-6 bg-slate-50"> {/* Quitamos min-h-screen aquí si el Layout ya lo tiene */}
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Panel de Control</h1>
                    <p className="text-slate-500 text-sm">Gestión de Licencias de San Miguel</p>
                </div>
                {/* <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all shadow-sm">
                        <Search size={18} />
                        Buscar
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                        <PlusCircle size={18} />
                        Nueva Licencia
                    </button>
                </div> */}
            </div>

            {/* KPIs - Movidos aquí para consistencia visual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Licencias" value={(stats?.totalLicencias ?? 0).toLocaleString()} icon={FileCheck} color="text-blue-600" bg="bg-blue-50" trend={stats.tendenciaLicencias} />
                <StatCard title="Solicitantes" value={(stats?.totalPersonas ?? 0).toLocaleString()} icon={Users} color="text-purple-600" bg="bg-purple-50" trend={stats.tendenciaPersonas} />
                <StatCard title="Pendientes" value={(stats?.totalPendientes ?? 0).toLocaleString()} icon={Clock} color="text-amber-600" bg="bg-amber-50" trend={stats.statusPendientes} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2">
                    <ChartCard data={chartData}/>
                </div>

                {/* Actividad Reciente */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Actividad Reciente</h3>
                    <div className="space-y-5">
                        {actividades.length > 0 ? (
                            actividades.map((item: any) => (
                                <RecentItem 
                                    key={item.id}
                                    title={item.title}
                                    desc={item.desc}
                                    // Si no usas date-fns, puedes mostrar la fecha corta
                                    time={new Date(item.time).toLocaleDateString()} 
                                    icon={<FileCheck className="text-blue-500" size={16} />} 
                                />
                            ))
                        ) : (
                            <p className="text-xs text-slate-400">No hay actividad reciente.</p>
                        )}
                    </div>
                    {/* <button className="w-full mt-6 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-blue-600 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all">
                        Ver Historial Completo
                    </button> */}
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, color, bg, trend }: any) {
  // Lógica para detectar si la tendencia es negativa o positiva
  const isNegative = trend?.toString().startsWith('-');
  const isNeutral = trend === 'Alerta' || trend === '0%';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div className={`${bg} ${color} p-2.5 rounded-xl`}>
          <Icon size={22} />
        </div>
        
        {/* Badge de tendencia dinámico */}
        <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-lg ${
          isNegative 
            ? 'bg-red-50 text-red-600' 
            : isNeutral 
              ? 'bg-amber-50 text-amber-600' 
              : 'bg-green-50 text-green-600'
        }`}>
          {isNegative ? (
            <ArrowDownRight size={14} className="mr-0.5" />
          ) : !isNeutral ? (
            <ArrowUpRight size={14} className="mr-0.5" />
          ) : null}
          {trend}
        </span>
      </div>

      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );
}

  function RecentItem({ title, desc, time, icon }: any) {
      return (
          <div className="flex items-start gap-3">
              <div className="mt-0.5 p-1.5 bg-slate-50 rounded-lg">{icon}</div>
              <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate">{title}</p>
                  <p className="text-xs text-slate-500 truncate">{desc}</p>
              </div>
              <span className="text-[10px] font-bold text-slate-400">{time}</span>
          </div>
      )
  }