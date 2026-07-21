import { Link } from '@inertiajs/react'
import Icon from '@/Komponen/Icon'
import TataLetak from '@/Komponen/TataLetak'
import PetaMini, { LahanMini } from '@/Komponen/PetaMini'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts'

interface Props {
    statistik: {
        total_petani: number
        total_lahan: number
        total_luas_lahan: number
        total_kelompok_tani: number
        total_komoditas: number
        total_bantuan: number
        total_penerima_bantuan: number
    }
    aktivitasTerbaru: { id_petani: number; nama: string; created_at: string }[]
    charts: {
        luasPerKomoditas: { name: string; value: number }[]
        petaniPerDesa: { name: string; value: number }[]
    }
    petaLahan: LahanMini[]
}

const COLORS = ['#2e7d32', '#4caf50', '#81c784', '#689f38', '#aed581', '#c0ca33', '#7cb342']
const BAR_COLORS = ['#1b6d24', '#2e7d32', '#4caf50', '#81c784', '#a3f69c', '#c8e6c9']

const AVATAR_TONES = [
    'bg-primary/10 text-primary',
    'bg-secondary/10 text-secondary',
    'bg-accent text-accent-foreground',
]

export default function Beranda({ statistik, aktivitasTerbaru, charts, petaLahan }: Props) {
    const kartuStatistik = [
        { title: 'Total Petani', value: statistik.total_petani.toLocaleString('id-ID'), icon: 'person', tone: 'bg-primary/10 text-primary', trend: '12%' },
        { title: 'Total Lahan', value: statistik.total_lahan.toLocaleString('id-ID'), icon: 'landscape', tone: 'bg-secondary/10 text-secondary', suffix: `${statistik.total_luas_lahan} Ha` },
        { title: 'Kelompok Tani', value: statistik.total_kelompok_tani.toLocaleString('id-ID'), icon: 'groups', tone: 'bg-accent text-accent-foreground' },
        { title: 'Komoditas', value: statistik.total_komoditas.toLocaleString('id-ID'), icon: 'eco', tone: 'bg-primary/10 text-primary' },
        { title: 'Jenis Bantuan', value: statistik.total_bantuan.toLocaleString('id-ID'), icon: 'help', tone: 'bg-secondary/10 text-secondary' },
        { title: 'Penerima Bantuan', value: statistik.total_penerima_bantuan.toLocaleString('id-ID'), icon: 'assessment', tone: 'bg-accent text-accent-foreground' },
    ]

    const totalPetaniDesa = charts.petaniPerDesa.reduce((acc, d) => acc + Number(d.value), 0)

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">Selamat datang kembali!</span>
                <h1 className="text-3xl font-bold tracking-tight text-foreground mt-1">Dashboard BPP Telaga</h1>
            </div>

            {/* Stat Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {kartuStatistik.map((stat, index) => (
                    <div
                        key={index}
                        className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
                    >
                        <div className="mb-4 flex items-start justify-between">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.tone}`}>
                                <Icon name={stat.icon} size={20} />
                            </div>
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">Aktif</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                        <div className="mt-0.5 flex items-baseline gap-1.5">
                            <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                            {stat.trend && (
                                <span className="flex items-center gap-[2px] text-xs font-semibold text-primary">
                                    <Icon name="trending_up" size={14} /> {stat.trend}
                                </span>
                            )}
                            {stat.suffix && (
                                <span className="text-xs text-muted-foreground">{stat.suffix}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bento Layout */}
            <div className="grid grid-cols-12 gap-6">
                {/* Charts Column */}
                <div className="col-span-12 space-y-6 lg:col-span-8">
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Bar Chart: Luas Lahan per Komoditas */}
                        <div className="rounded-xl border border-border bg-card p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h4 className="text-base font-semibold text-foreground">Luas Lahan per Komoditas (Ha)</h4>
                                <Icon name="more_vert" size={20} className="cursor-pointer text-outline" />
                            </div>
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.luasPerKomoditas}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                        <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                        <YAxis fontSize={11} tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
                                        <Tooltip
                                            cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }}
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: '1px solid hsl(var(--border))',
                                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                                                backgroundColor: 'hsl(var(--card))',
                                                color: 'hsl(var(--foreground))',
                                            }}
                                        />
                                        <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={48}>
                                            {charts.luasPerKomoditas.map((_, index) => (
                                                <Cell key={`bar-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Donut Chart: Distribusi Petani per Desa */}
                        <div className="rounded-xl border border-border bg-card p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <h4 className="text-base font-semibold text-foreground">Distribusi Petani per Desa</h4>
                                <Icon name="more_vert" size={20} className="cursor-pointer text-outline" />
                            </div>
                            <div className="relative h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={charts.petaniPerDesa}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={64}
                                            outerRadius={84}
                                            paddingAngle={3}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {charts.petaniPerDesa.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: '1px solid hsl(var(--border))',
                                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                                                backgroundColor: 'hsl(var(--card))',
                                                color: 'hsl(var(--foreground))',
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-xl font-bold text-foreground">{totalPetaniDesa.toLocaleString('id-ID')}</span>
                                    <span className="text-xs text-outline">Total</span>
                                </div>
                            </div>
                            <div className="mt-4 space-y-1.5">
                                {charts.petaniPerDesa.map((desa, index) => {
                                    const persen = totalPetaniDesa > 0 ? Math.round((Number(desa.value) / totalPetaniDesa) * 100) : 0
                                    return (
                                        <div key={desa.name} className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                                                <span>{desa.name}</span>
                                            </div>
                                            <span className="font-bold">{persen}%</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Map CTA */}
                    <div className="overflow-hidden rounded-xl border border-border bg-card p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h4 className="text-base font-semibold text-foreground">Peta Sebaran Lahan Komoditas</h4>
                                <p className="text-sm text-outline">Visualisasi spasial data lahan di wilayah BPP Telaga.</p>
                            </div>
                            <Link
                                href="/peta"
                                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                <Icon name="map" size={18} /> Buka Peta Penuh
                            </Link>
                        </div>
                        <div className="relative h-80 overflow-hidden rounded-lg border border-border">
                            {petaLahan && petaLahan.length > 0 ? (
                                <PetaMini lahan={petaLahan} />
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/20 via-accent to-secondary/20 text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-card/70 backdrop-blur-sm">
                                        <Icon name="map" size={28} className="text-primary" />
                                    </div>
                                    <p className="text-sm font-semibold text-foreground">Belum ada data lahan untuk ditampilkan</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Recent Activity */}
                <div className="col-span-12 lg:col-span-4">
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <h4 className="text-base font-semibold text-foreground">Petani Terbaru</h4>
                            <Link href="/data-petani" className="text-sm font-semibold text-primary hover:underline">Lihat Semua</Link>
                        </div>

                        {aktivitasTerbaru.length === 0 ? (
                            <p className="py-6 text-center text-sm text-muted-foreground">Belum ada data petani.</p>
                        ) : (
                            <div className="space-y-5">
                                {aktivitasTerbaru.map((p, index) => (
                                    <div key={p.id_petani} className="group flex cursor-pointer items-center gap-4">
                                        <div className={`flex h-12 w-12 items-center justify-center rounded-full text-base font-bold ${AVATAR_TONES[index % AVATAR_TONES.length]}`}>
                                            {p.nama.split(' ').map((n) => n.charAt(0)).slice(0, 2).join('').toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h5 className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">{p.nama}</h5>
                                            <p className="text-sm text-outline">Anggota baru terdaftar</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(p.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                            {index === 0 && <span className="text-xs font-semibold text-primary">Baru</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="mt-6 border-t border-border pt-6">
                            <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-outline">Informasi Bantuan Terkini</h4>
                            <div className="rounded-lg border border-border bg-background p-4">
                                <div className="flex items-start gap-3">
                                    <Icon name="campaign" size={20} className="mt-0.5 text-primary" />
                                    <div>
                                        <p className="font-semibold text-foreground">Penyaluran Benih Unggul</p>
                                        <p className="mt-1 text-sm text-muted-foreground">Target: Desa Telaga &amp; Luhu. Status: Berlangsung.</p>
                                        <div className="mt-2 h-1 w-full rounded-full bg-surface-container">
                                            <div className="h-1 w-[65%] rounded-full bg-primary"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

Beranda.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
