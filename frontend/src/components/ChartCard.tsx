import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp } from 'lucide-react';

const data = [
    { name: 'Ene', licencias: 12 }, { name: 'Feb', licencias: 18 },
    { name: 'Mar', licencias: 9 }, { name: 'Abr', licencias: 22 },
    { name: 'May', licencias: 17 }, { name: 'Jun', licencias: 25 }
];

export default function ChartCard() {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Rendimiento de Emisiones</h3>
                    <p className="text-sm text-slate-500">Comparativa mensual de licencias</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold">
                    <TrendingUp size={14} />
                    <span>+24%</span>
                </div>
            </div>

            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorLic" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="licencias" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorLic)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}