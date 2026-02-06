import ChartCard from '../components/ChartCard'
import { PlusCircle, Search, FileText, CheckCircle, Clock, FileCheck, Users, ArrowUpRight } from 'lucide-react'

export default function Dashboard() {
    return (
        <div className="p-6 space-y-6 bg-slate-50"> {/* Quitamos min-h-screen aquí si el Layout ya lo tiene */}
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Panel de Control</h1>
                    <p className="text-slate-500 text-sm">Gestión de Licencias de San Miguel</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all shadow-sm">
                        <Search size={18} />
                        Buscar
                    </button>
                    <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                        <PlusCircle size={18} />
                        Nueva Licencia
                    </button>
                </div>
            </div>

            {/* KPIs - Movidos aquí para consistencia visual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Licencias" value="1,284" icon={FileCheck} color="text-blue-600" bg="bg-blue-50" trend="+12%" />
                <StatCard title="Personas" value="850" icon={Users} color="text-purple-600" bg="bg-purple-50" trend="+5%" />
                <StatCard title="Pendientes" value="43" icon={Clock} color="text-amber-600" bg="bg-amber-50" trend="Alerta" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2">
                    <ChartCard />
                </div>

                {/* Actividad Reciente */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Actividad Reciente</h3>
                    <div className="space-y-5">
                        <RecentItem title="Licencia #4502" desc="Aprobada por Juan Pérez" time="10 min" icon={<CheckCircle className="text-green-500" size={16} />} />
                        <RecentItem title="Nueva Solicitud" desc="Restaurante 'El Sabor'" time="1 h" icon={<FileText className="text-blue-500" size={16} />} />
                        <RecentItem title="Pendiente Pago" desc="Bodega Don Luis" time="3 h" icon={<Clock className="text-amber-500" size={16} />} />
                    </div>
                    <button className="w-full mt-6 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-blue-600 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all">
                        Ver Historial
                    </button>
                </div>
            </div>
        </div>
    )
}

function StatCard({ title, value, icon: Icon, color, bg, trend }: any) {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
                <div className={`${bg} ${color} p-2.5 rounded-xl`}>
                    <Icon size={22} />
                </div>
                <span className="text-green-600 flex items-center text-xs font-bold bg-green-50 px-2 py-1 rounded-lg">
                    <ArrowUpRight size={14} className="mr-0.5" /> {trend}
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