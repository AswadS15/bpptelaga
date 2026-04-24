import { Link, usePage } from '@inertiajs/react'
import { LayoutDashboard, Map as MapIcon, Users, Tractor, UsersRound, Sprout, HandCoins, FileText, LogOut, Sun, Moon, Bell, Settings } from 'lucide-react'
import { ReactNode } from 'react'
import { ThemeProvider, useTheme } from './ThemeProvider'

function LayoutInner({ children }: { children: ReactNode }) {
  const { url } = usePage()
  const { theme, toggleTheme } = useTheme()

  const navigasi = [
    { nama: 'Beranda', path: '/beranda', icon: LayoutDashboard },
    { nama: 'Peta', path: '/peta', icon: MapIcon },
    { nama: 'Data Petani', path: '/data-petani', icon: Users },
    { nama: 'Data Lahan', path: '/data-lahan', icon: Tractor },
    { nama: 'Kelompok Tani', path: '/data-kelompok-tani', icon: UsersRound },
    { nama: 'Komoditas', path: '/data-komoditas', icon: Sprout },
    { nama: 'Bantuan', path: '/data-bantuan', icon: HandCoins },
    { nama: 'Laporan', path: '/laporan', icon: FileText },
  ]

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Sidebar */}
      <aside className="w-64 flex flex-col border-r border-border/50 bg-[hsl(var(--sidebar))]">
        {/* Branding */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sprout size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">AgriGIS</h1>
              <p className="text-[11px] text-muted-foreground leading-none">Precision Agriculture</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 mt-2 overflow-y-auto">
          {navigasi.map((item) => {
            const Icon = item.icon
            const aktif = url.startsWith(item.path)
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  aktif
                    ? 'sidebar-active-gradient text-white shadow-lg shadow-violet-500/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon size={18} />
                {item.nama}
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 mt-auto">
          <div className="rounded-xl bg-gradient-to-br from-violet-600/10 to-purple-600/10 dark:from-violet-600/20 dark:to-purple-600/20 border border-violet-500/10 dark:border-violet-500/20 p-4 mb-3">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
                <MapIcon size={18} className="text-white" />
              </div>
            </div>
            <p className="text-xs text-center font-semibold text-foreground">WebGIS BPP</p>
            <p className="text-[10px] text-center text-muted-foreground mt-0.5">Kec. Telaga, Gorontalo</p>
          </div>
          <Link href="/login" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all duration-200">
            <LogOut size={18} />
            Keluar
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-8 bg-card/50 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {navigasi.find(n => url.startsWith(n.path))?.nama || 'Sistem Informasi Geografis'}
          </h2>
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
              <Bell size={18} />
            </button>
            <button className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
              <Settings size={18} />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold ml-1 shadow-lg shadow-violet-500/20">
              A
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function TataLetak({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <LayoutInner>{children}</LayoutInner>
    </ThemeProvider>
  )
}
