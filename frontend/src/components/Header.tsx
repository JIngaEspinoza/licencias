import UserMenu from './UserMenu'

export default function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
    return (
        <header className="sticky top-0 z-20 bg-white border-b">
            <div className="h-16 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <button onClick={onToggleSidebar} className="h-9 w-9 grid place-items-center border rounded-lg lg:hidden">☰</button>
                    <h1 className="text-base font-semibold">Licencia de Funcionamiento</h1>
                </div>
                <UserMenu />
            </div>
        </header>
    )
}