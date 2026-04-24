import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Users, Tractor, Sprout, HandCoins, UsersRound, Map as MapIcon, TrendingUp } from 'lucide-react'
import TataLetak from '@/Komponen/TataLetak'
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
    Legend,
    AreaChart,
    Area
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
}

const COLORS = ['#8b5cf6', '#ec4899', '#22d3ee', '#f59e0b', '#34d399', '#f97316', '#3b82f6']

export default function Beranda({ statistik, aktivitasTerbaru, charts }: Props) {
    const kartuStatistik = [
        { title: 'Total Petani', value: statistik.total_petani, icon: Users, gradient: 'gradient-pink' },
        { title: 'Total Lahan', value: `${statistik.total_lahan} (${statistik.total_luas_lahan} Ha)`, icon: Tractor, gradient: 'gradient-cyan' },
        { title: 'Kelompok Tani', value: statistik.total_kelompok_tani, icon: UsersRound, gradient: 'gradient-purple' },
        { title: 'Komoditas', value: statistik.total_komoditas, icon: Sprout, gradient: 'gradient-green' },
        { title: 'Jenis Bantuan', value: statistik.total_bantuan, icon: HandCoins, gradient: 'gradient-pink' },
        { title: 'Penerima Bantuan', value: statistik.total_penerima_bantuan, icon: MapIcon, gradient: 'gradient-cyan' },
    ]

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div>
                <p className="text-sm text-muted-foreground">Selamat datang kembali!</p>
                <h1 className="text-2xl font-bold text-foreground mt-1">Dashboard BPP Telaga</h1>
            </div>

            {/* Kartu Statistik Utama */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {kartuStatistik.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card key={index} className="glass-card overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.title}</p>
                                        <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                                    </div>
                                    <div className={`w-12 h-12 rounded-2xl ${stat.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 mt-3">
                                    <TrendingUp size={12} className="text-emerald-400" />
                                    <span className="text-[11px] text-emerald-400 font-medium">Aktif</span>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Bar Chart: Luas Lahan per Komoditas */}
                <Card className="glass-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                            <Sprout size={16} className="text-emerald-400" />
                            Luas Lahan per Komoditas (Ha)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.luasPerKomoditas}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(258, 20%, 20%)" />
                                <XAxis dataKey="name" fontSize={11} tick={{ fill: 'hsl(258, 10%, 55%)' }} />
                                <YAxis fontSize={11} tick={{ fill: 'hsl(258, 10%, 55%)' }} />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: '1px solid rgba(139, 92, 246, 0.2)',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                        backgroundColor: 'hsl(258, 30%, 12%)',
                                        color: '#e2e8f0',
                                    }}
                                />
                                <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#6d28d9" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Pie Chart: Distribusi Petani per Desa */}
                <Card className="glass-card">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                            <MapIcon size={16} className="text-cyan-400" />
                            Distribusi Petani per Desa
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[280px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={charts.petaniPerDesa}
                                    cx="50%"
                                    cy="45%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={4}
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
                                        border: '1px solid rgba(139, 92, 246, 0.2)',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                                        backgroundColor: 'hsl(258, 30%, 12%)',
                                        color: '#e2e8f0',
                                    }}
                                />
                                <Legend verticalAlign="bottom" height={36} formatter={(value: string) => <span className="text-xs text-muted-foreground">{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Aktivitas Terbaru */}
            <Card className="glass-card">
                <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold text-foreground">Petani Terbaru Terdaftar</CardTitle>
                </CardHeader>
                <CardContent>
                    {aktivitasTerbaru.length === 0 ? (
                        <p className="text-muted-foreground text-sm text-center py-6">Belum ada data petani.</p>
                    ) : (
                        <div className="space-y-3">
                            {aktivitasTerbaru.map((p) => (
                                <div key={p.id_petani} className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent/50 transition-colors">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        {p.nama.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm text-foreground truncate">{p.nama}</p>
                                        <p className="text-xs text-muted-foreground">Mendaftar sebagai anggota baru</p>
                                    </div>
                                    <span className="text-muted-foreground text-xs font-medium shrink-0">
                                        {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

Beranda.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
