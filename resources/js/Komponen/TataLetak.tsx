import { Link, usePage } from '@inertiajs/react'
import { LayoutDashboard, Map as MapIcon, Users, Tractor, UsersRound, Sprout, HandCoins, LogOut } from 'lucide-react'
import { ReactNode } from 'react'

export default function TataLetak({ children }: { children: ReactNode }) {
  const { url } = usePage()

  const navigasi = [
    { nama: 'Beranda', path: '/beranda', icon: LayoutDashboard },
    { nama: 'Peta', path: '/peta', icon: MapIcon },
    { nama: 'Data Petani', path: '/data-petani', icon: Users },
    { nama: 'Data Lahan', path: '/data-lahan', icon: Tractor },
    { nama: 'Kelompok Tani', path: '/data-kelompok-tani', icon: UsersRound },
    { nama: 'Komoditas', path: '/data-komoditas', icon: Sprout },
    { nama: 'Bantuan', path: '/data-bantuan', icon: HandCoins },
    { nama: 'Laporan', path: '/laporan', icon: LayoutDashboard },
  ]

  return (
    <div className="flex h-screen w-full bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-primary-foreground flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold">WebGIS BPP</h1>
          <p className="text-sm opacity-80 mt-1">Kec. Telaga</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navigasi.map((item) => {
            const Icon = item.icon
            const aktif = url.startsWith(item.path)
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${aktif ? 'bg-secondary text-secondary-foreground font-medium' : 'hover:bg-primary-foreground/10'}`}
              >
                <Icon size={20} />
                {item.nama}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-primary-foreground/20">
          <Link href="/login" className="flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-primary-foreground/10 rounded-md transition-colors">
            <LogOut size={20} />
            Keluar
          </Link>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">
            {navigasi.find(n => url.startsWith(n.path))?.nama || 'Sistem Informasi Geografis'}
          </h2>
        </header>
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
