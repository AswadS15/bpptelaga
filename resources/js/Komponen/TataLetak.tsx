import { Link, usePage } from '@inertiajs/react'
import { ReactNode, useEffect, useState } from 'react'
import Icon from './Icon'
import GambarIkon from './GambarIkon'
import { ThemeProvider, useTheme } from './ThemeProvider'
import { cn } from '@/lib/utils'

const LOGO_SRC: string | undefined = undefined

function LayoutInner({ children }: { children: ReactNode }) {
  const { url } = usePage()
  const { theme, toggleTheme } = useTheme()
  const [modeIkon, setModeIkon] = useState(false)
  const [mobileTerbuka, setMobileTerbuka] = useState(false)

  const navigasi = [
    { nama: 'Beranda', path: '/beranda', icon: 'dashboard' },
    { nama: 'Peta', path: '/peta', icon: 'map' },
    { nama: 'Data Petani', path: '/data-petani', icon: 'person' },
    { nama: 'Data Lahan', path: '/data-lahan', icon: 'landscape' },
    { nama: 'Kelompok Tani', path: '/data-kelompok-tani', icon: 'groups' },
    { nama: 'Komoditas', path: '/data-komoditas', icon: 'eco' },
    { nama: 'Bantuan', path: '/data-bantuan', icon: 'help' },
    { nama: 'Laporan', path: '/laporan', icon: 'assessment' },
  ]

  // Tutup drawer mobile setiap kali berpindah halaman
  useEffect(() => {
    setMobileTerbuka(false)
  }, [url])

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Backdrop mobile */}
      {mobileTerbuka && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileTerbuka(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-sidebar py-4 px-2 transition-all duration-300 lg:static lg:z-auto',
          modeIkon ? 'w-64 lg:w-20' : 'w-64',
          mobileTerbuka ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Header / Branding */}
        <div className="mb-8 flex min-h-[40px] items-center gap-3 px-2">
          {/* Logo — pada mode ikon (desktop) berfungsi sebagai trigger expand saat hover */}
          <button
            type="button"
            onClick={() => modeIkon && setModeIkon(false)}
            title={modeIkon ? 'Perluas sidebar' : undefined}
            className={cn(
              'group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/20',
              modeIkon ? 'lg:mx-auto lg:cursor-pointer' : 'cursor-default'
            )}
          >
            <GambarIkon
              src={LOGO_SRC}
              ikon="eco"
              size={20}
              className={cn('text-primary-foreground', modeIkon && 'lg:transition-opacity lg:group-hover:opacity-0')}
            />
            {modeIkon && (
              <Icon
                name="menu"
                size={20}
                className="absolute text-primary-foreground opacity-0 transition-opacity lg:group-hover:opacity-100"
              />
            )}
          </button>

          {/* Teks branding — disembunyikan pada mode ikon (desktop) */}
          <div className={cn('min-w-0 flex-1', modeIkon && 'lg:hidden')}>
            <h1 className="truncate text-xl font-bold tracking-tight text-primary">AgriGIS</h1>
            <p className="mt-0.5 text-[11px] leading-none text-outline">BPP Telaga</p>
          </div>

          {/* Trigger ciutkan (desktop) — hanya tampil saat expanded */}
          <button
            type="button"
            onClick={() => setModeIkon(true)}
            title="Ciutkan sidebar"
            className={cn(
              'hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
              !modeIkon && 'lg:flex'
            )}
          >
            <Icon name="menu_open" size={20} />
          </button>

          {/* Trigger tutup (mobile) */}
          <button
            type="button"
            onClick={() => setMobileTerbuka(false)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto">
          {navigasi.map((item) => {
            const aktif = url.startsWith(item.path)
            return (
              <Link
                key={item.path}
                href={item.path}
                title={modeIkon ? item.nama : undefined}
                className={cn(
                  'flex items-center border-l-2 py-2.5 text-sm transition-colors',
                  modeIkon ? 'px-4 lg:justify-center lg:px-0' : 'px-4',
                  aktif
                    ? 'border-primary bg-primary/5 font-bold text-primary'
                    : 'border-transparent font-medium text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon name={item.icon} size={20} className={cn(modeIkon ? 'mr-4 lg:mr-0' : 'mr-4')} />
                <span className={cn(modeIkon && 'lg:hidden')}>{item.nama}</span>
              </Link>
            )
          })}
        </nav>

        {/* Bottom section */}
        <div className="mt-auto border-t border-border pt-4">
          <div className={cn('mb-4 rounded-lg bg-primary/5 p-4', modeIkon && 'lg:hidden')}>
            <p className="mb-1 text-xs font-semibold text-primary">Akses Publik</p>
            <p className="text-xs font-medium leading-snug text-muted-foreground">WebGIS BPP Kec. Telaga, Gorontalo</p>
          </div>
          <Link
            href="/login"
            title={modeIkon ? 'Logout' : undefined}
            className={cn(
              'flex items-center rounded-lg py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
              modeIkon ? 'px-4 lg:justify-center lg:px-0' : 'px-4'
            )}
          >
            <Icon name="logout" size={20} className={cn(modeIkon ? 'mr-4 lg:mr-0' : 'mr-4')} />
            <span className={cn(modeIkon && 'lg:hidden')}>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card/50 px-4 backdrop-blur-sm sm:px-8">
          <div className="flex items-center gap-2">
            {/* Trigger mobile — terpisah dari trigger desktop */}
            <button
              type="button"
              onClick={() => setMobileTerbuka(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
              title="Buka menu"
            >
              <Icon name="menu" size={20} />
            </button>
            <h2 className="text-lg font-semibold text-foreground">
              {navigasi.find(n => url.startsWith(n.path))?.nama || 'Sistem Informasi Geografis'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Icon name="light_mode" size={18} /> : <Icon name="dark_mode" size={18} />}
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground">
              <Icon name="notifications" size={18} />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-foreground">
              <Icon name="settings" size={18} />
            </button>
            <div className="ml-1 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20">
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
