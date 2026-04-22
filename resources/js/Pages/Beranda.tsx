import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Users, Tractor, Sprout, HandCoins, UsersRound, Map as MapIcon } from 'lucide-react'
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
    Legend
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

const COLORS = ['#2563eb', '#ef4444', '#f59e0b', '#84cc16', '#f97316', '#8b5cf6', '#ec4899']

export default function Beranda({ statistik, aktivitasTerbaru, charts }: Props) {
    const kartuStatistik = [
        { title: 'Total Petani', value: statistik.total_petani, icon: Users, color: 'text-blue-600' },
        { title: 'Total Lahan', value: `${statistik.total_lahan} (${statistik.total_luas_lahan} Ha)`, icon: Tractor, color: 'text-green-600' },
        { title: 'Kelompok Tani', value: statistik.total_kelompok_tani, icon: UsersRound, color: 'text-indigo-600' },
        { title: 'Komoditas', value: statistik.total_komoditas, icon: Sprout, color: 'text-amber-600' },
        { title: 'Jenis Bantuan', value: statistik.total_bantuan, icon: HandCoins, color: 'text-purple-600' },
        { title: 'Penerima Bantuan', value: statistik.total_penerima_bantuan, icon: MapIcon, color: 'text-rose-600' },
    ]

    return (
        <div className="space-y-6">
            {/* Kartu Statistik Utama */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {kartuStatistik.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <Card key={index} className="shadow-sm border-l-4" style={{ borderColor: stat.color.replace('text-', '') }}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.title}</CardTitle>
                                <Icon className={`h-5 w-5 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stat.value}</div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Bar Chart: Luas Lahan per Komoditas */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <Sprout size={18} className="text-green-600" />
                            Luas Lahan per Komoditas (Ha)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={charts.luasPerKomoditas}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} />
                                <YAxis fontSize={12} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" fill="#124170" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Pie Chart: Distribusi Petani per Desa */}
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                            <MapIcon size={18} className="text-blue-600" />
                            Distribusi Petani per Desa
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={charts.petaniPerDesa}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {charts.petaniPerDesa.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} fontSize={12} />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Aktivitas Terbaru */}
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Petani Terbaru Terdaftar</CardTitle>
                </CardHeader>
                <CardContent>
                    {aktivitasTerbaru.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-4">Belum ada data petani.</p>
                    ) : (
                        <div className="relative">
                            <div className="absolute top-0 left-4 w-0.5 h-full bg-slate-100" />
                            <ul className="space-y-6 relative">
                                {aktivitasTerbaru.map((p) => (
                                    <li key={p.id_petani} className="flex items-center gap-6 pl-2">
                                        <div className="w-4 h-4 rounded-full bg-secondary ring-4 ring-white z-10"></div>
                                        <div className="flex-1 flex items-center justify-between">
                                            <div>
                                                <p className="font-semibold text-slate-800">{p.nama}</p>
                                                <p className="text-xs text-slate-500">Mendaftar sebagai anggota baru</p>
                                            </div>
                                            <span className="text-slate-400 text-xs font-medium">
                                                {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

Beranda.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
