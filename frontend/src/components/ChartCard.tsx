import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const data = [
    { name: 'Ene', licencias: 12 },
    { name: 'Feb', licencias: 18 },
    { name: 'Mar', licencias: 9 },
    { name: 'Abr', licencias: 22 },
    { name: 'May', licencias: 17 },
    { name: 'Jun', licencias: 25 }
]

export default function ChartCard() {
    return (
        <div className="bg-white border rounded-xl p-4">
            <h3 className="font-medium mb-2">Licencias emitidas (últimos 6 meses)</h3>
            <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="licencias" stroke="#0f766e" strokeWidth={2} dot={false} />
                </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}