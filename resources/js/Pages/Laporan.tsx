import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { FileSpreadsheet, Download, Users, LandPlot } from 'lucide-react'
import TataLetak from '@/Komponen/TataLetak'

export default function Laporan() {
    const daftarLaporan = [
        {
            title: 'Data Master Petani',
            description: 'Ekspor seluruh data profil petani terdaftar dalam format CSV.',
            icon: Users,
            color: 'bg-blue-100 text-blue-600',
            route: '/laporan/ekspor-petani'
        },
        {
            title: 'Data Inventaris Lahan',
            description: 'Ekspor data kepemilikan lahan, luas, dan komoditas dalam format CSV.',
            icon: LandPlot,
            color: 'bg-green-100 text-green-600',
            route: '/laporan/ekspor-lahan'
        },
    ]

    return (
        <div className="space-y-6">
            <div className="max-w-2xl">
                <h1 className="text-2xl font-bold text-slate-800">Pusat Laporan & Ekspor Data</h1>
                <p className="text-slate-500 mt-2">
                    Gunakan halaman ini untuk mengunduh data sistem dalam format Excel/CSV untuk keperluan administrasi dan pelaporan offline.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {daftarLaporan.map((item, index) => {
                    const Icon = item.icon
                    return (
                        <Card key={index} className="hover:shadow-md transition-shadow border-t-4 border-t-primary">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className={`p-3 rounded-lg ${item.color}`}>
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{item.title}</CardTitle>
                                    <CardDescription className="mt-1">{item.description}</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Button 
                                    className="w-full gap-2" 
                                    variant="outline"
                                    onClick={() => window.location.href = item.route}
                                >
                                    <Download size={18} /> Unduh CSV
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            <Card className="bg-amber-50 border-amber-200">
                <CardHeader>
                    <CardTitle className="text-amber-800 text-sm font-semibold flex items-center gap-2">
                        <FileSpreadsheet size={16} /> Tips Penggunaan
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-amber-700 text-xs space-y-2">
                    <p>• File CSV dapat dibuka langsung menggunakan Microsoft Excel, Google Sheets, atau LibreOffice Calc.</p>
                    <p>• Pastikan data sudah diperbarui di halaman masing-masing sebelum melakukan ekspor.</p>
                    <p>• Jika terjadi kesalahan karakter saat membuka di Excel, gunakan fitur "Import Data from Text/CSV" dan pilih Encoding UTF-8.</p>
                </CardContent>
            </Card>
        </div>
    )
}

Laporan.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
