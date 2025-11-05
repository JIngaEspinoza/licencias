import ChartCard from '../components/ChartCard'
import { Link } from 'react-router-dom'

export default function Dashboard() {
    return (
        <div className="space-y-4">
            {/* Resúmenes */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                    { label: 'Licencias hoy', value: 5 },
                    { label: 'Pendientes', value: 12 },
                    { label: 'Aprobadas', value: 82 },
                    { label: 'Rechazadas', value: 7 }
                ].map((k) => (
                    <div key={k.label} className="bg-white border rounded-xl p-4">
                        <p className="text-sm text-gray-500">{k.label}</p>
                        <p className="text-2xl font-semibold">{k.value}</p>
                    </div>
                ))}
            </div>

            {/* Chart */}
            <ChartCard />

            {/* Atajos */}
            <div className="grid gap-4 sm:grid-cols-2">
                <Link to="/licencias" className="block bg-white border rounded-xl p-4 hover:bg-gray-50">
                    <h3 className="font-medium">Ir a Licencias</h3>
                    <p className="text-sm text-gray-600">Gestión de expedientes, estados y fechas</p>
                </Link>
            </div>
        </div>
    )
}