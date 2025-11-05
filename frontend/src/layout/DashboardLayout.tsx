import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { Outlet } from 'react-router-dom'

export default function DashboardLayout() {
    const [open, setOpen] = useState(false)
        return (
        <div className="min-h-screen bg-gray-50">
            <Sidebar open={open} />
            <div className="lg:pl-64">
                <Header onToggleSidebar={() => setOpen(!open)} />
                <main className="w-full max-w-none px-4 md:px-6 lg:px-8 py-4">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}