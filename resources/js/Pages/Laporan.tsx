import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table'
import Icon from '@/Komponen/Icon'
import TataLetak from '@/Komponen/TataLetak'

interface RiwayatEkspor {
    id: number
    nama_file: string
    jenis: string
    waktu: string
    ukuran: string
}

interface Statistik {
    total_petani: number
    total_lahan: number
    update_terakhir_petani: string | null
    update_terakhir_lahan: string | null
}

interface Props {
    riwayatEkspor: RiwayatEkspor[]
    statistik: Statistik
}

function waktuRelatif(iso: string | null): string {
    if (!iso) return 'Belum ada data'

    const sekarang = new Date()
    const waktu = new Date(iso)
    const selisihMs = sekarang.getTime() - waktu.getTime()
    const selisihJam = Math.floor(selisihMs / (1000 * 60 * 60))
    const selisihMenit = Math.floor(selisihMs / (1000 * 60))

    if (selisihMs < 0) return 'Baru saja'
    if (selisihMenit < 60) return `${selisihMenit} menit lalu`
    if (selisihJam < 24) return `${selisihJam} jam lalu`

    const hariIni = new Date(sekarang.getFullYear(), sekarang.getMonth(), sekarang.getDate())
    const kemarin = new Date(hariIni.getTime() - 86400000)
    const tglWaktu = new Date(waktu.getFullYear(), waktu.getMonth(), waktu.getDate())

    if (tglWaktu.getTime() === hariIni.getTime()) return 'Hari ini'
    if (tglWaktu.getTime() === kemarin.getTime()) return 'Kemarin'

    const selisihHari = Math.floor(selisihMs / (1000 * 60 * 60 * 24))
    return `${selisihHari} hari lalu`
}

export default function Laporan({ riwayatEkspor, statistik }: Props) {
    const daftarLaporan = [
        {
            title: 'Data Master Petani',
            description:
                'Daftar lengkap seluruh petani terdaftar di wilayah BPP Telaga, mencakup informasi demografis, kepemilikan aset, dan status keanggotaan kelompok tani.',
            icon: 'groups',
            route: '/laporan/ekspor-petani',
            updateTerakhir: statistik.update_terakhir_petani,
        },
        {
            title: 'Data Inventaris Lahan',
            description:
                'Data spasial dan tabular seluruh lahan pertanian yang telah dipetakan, termasuk komoditas tanam, luas area, dan titik koordinat poligon GIS.',
            icon: 'landscape',
            route: '/laporan/ekspor-lahan',
            updateTerakhir: statistik.update_terakhir_lahan,
        },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="max-w-2xl">
                <h1 className="text-[32px] font-bold leading-10 -tracking-[0.02em] text-foreground">
                    Pusat Laporan & Ekspor Data
                </h1>
                <p className="mt-2 text-base leading-6 text-muted-foreground">
                    Gunakan halaman ini untuk mengunduh data sistem dalam format Excel/CSV untuk
                    keperluan analisis luring.
                </p>
            </div>

            {/* Report Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                {daftarLaporan.map((item, index) => (
                    <Card key={index} className="relative overflow-hidden">
                        <CardHeader className="flex flex-row items-start gap-4 pb-3">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <Icon name={item.icon} size={24} className="text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-lg font-semibold leading-6 text-foreground">
                                        {item.title}
                                    </CardTitle>
                                    <span className="inline-flex shrink-0 items-center rounded-full bg-warning/15 px-2.5 py-0.5 text-[11px] font-medium leading-4 text-warning dark:bg-warning/25 dark:text-warning">
                                        Update: {waktuRelatif(item.updateTerakhir)}
                                    </span>
                                </div>
                                <p className="mt-1.5 text-sm leading-5 text-muted-foreground">
                                    {item.description}
                                </p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Button
                                className="w-full gap-2"
                                variant="outline"
                                onClick={() => window.open(item.route, '_self')}
                            >
                                <Icon name="download" size={18} />
                                Unduh CSV
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Tips Card */}
            <Card className="border-warning/30 bg-warning/8 dark:border-warning/25 dark:bg-warning/15">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-warning dark:text-warning">
                        <Icon name="lightbulb" size={18} />
                        Tips Penggunaan
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 text-xs leading-5 text-warning/90 dark:text-warning/90">
                    <p>
                        Jika file CSV tidak terbaca dengan benar di Excel, pastikan Anda
                        menggunakan mode &lsquo;Import Data&rsquo; dengan encoding UTF-8 untuk
                        menjaga format karakter tetap konsisten dan mencegah data sel yang
                        berantakan.
                    </p>
                </CardContent>
            </Card>

            {/* Export History */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold leading-7 text-foreground">
                    Riwayat Ekspor Terakhir
                </h2>

                {riwayatEkspor.length > 0 ? (
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">Nama File</TableHead>
                                    <TableHead className="w-[25%]">Waktu</TableHead>
                                    <TableHead className="w-[15%]">Ukuran</TableHead>
                                    <TableHead className="w-[20%] text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {riwayatEkspor.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium text-foreground">
                                            <div className="flex items-center gap-2">
                                                <Icon
                                                    name="description"
                                                    size={16}
                                                    className="shrink-0 text-muted-foreground"
                                                />
                                                <span className="truncate">{item.nama_file}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {item.waktu}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {item.ukuran}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="link"
                                                size="sm"
                                                className="h-auto p-0 text-primary"
                                                onClick={() =>
                                                    window.open(
                                                        item.jenis === 'petani'
                                                            ? '/laporan/ekspor-petani'
                                                            : '/laporan/ekspor-lahan',
                                                        '_self',
                                                    )
                                                }
                                            >
                                                Re-download
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <Icon
                                name="file_download"
                                size={40}
                                className="mb-3 text-muted-foreground/50"
                            />
                            <p className="text-sm font-medium text-muted-foreground">
                                Belum ada riwayat ekspor
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground/70">
                                Gunakan tombol di atas untuk mengekspor data, riwayat akan muncul
                                di sini.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}

Laporan.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
