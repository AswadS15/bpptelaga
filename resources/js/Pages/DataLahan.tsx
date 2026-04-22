import { useState, useMemo } from 'react'
import { router } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/Components/ui/dialog'
import { Plus, Trash2, MapPin, Search, LandPlot } from 'lucide-react'
import TataLetak from '@/Komponen/TataLetak'

interface LahanType {
  id_lahan: number
  id_petani: number
  luas: number
  koordinat: any
  petani: { id_petani: number; nama: string }
  komoditas: { id_komoditas: number; nama_komoditas: string }[]
}

interface Props {
  daftarLahan: LahanType[]
  daftarPetani: { id_petani: number; nama: string }[]
  daftarKomoditas: { id_komoditas: number; nama_komoditas: string }[]
}

export default function DataLahan({ daftarLahan, daftarPetani, daftarKomoditas }: Props) {
  const [dialogBuka, setDialogBuka] = useState(false)
  const [form, setForm] = useState({ id_petani: '', luas: '', komoditas: [] as number[] })
  const [searchTerm, setSearchTerm] = useState('')

  // Client-side filtering
  const filteredLahan = useMemo(() => {
    return daftarLahan.filter(l => 
      l.petani?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.komoditas.some(k => k.nama_komoditas.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [daftarLahan, searchTerm])

  const bukaDialogTambah = () => {
    setForm({ id_petani: '', luas: '', komoditas: [] })
    setDialogBuka(true)
  }

  const simpan = () => {
    router.post('/data-lahan', {
      id_petani: Number(form.id_petani),
      luas: Number(form.luas),
      komoditas: form.komoditas,
    }, { onSuccess: () => setDialogBuka(false) })
  }

  const hapusLahan = (id: number) => {
    if (confirm('Yakin ingin menghapus data lahan ini?')) {
      router.delete(`/data-lahan/${id}`)
    }
  }

  const toggleKomoditas = (id: number) => {
    setForm(prev => ({
      ...prev,
      komoditas: prev.komoditas.includes(id)
        ? prev.komoditas.filter(k => k !== id)
        : [...prev.komoditas, id]
    }))
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800">Inventaris Lahan Pertanian</CardTitle>
            <p className="text-sm text-slate-500">Monitoring luas dan komoditas lahan di wilayah BPP Telaga</p>
          </div>
          <Button onClick={bukaDialogTambah} className="bg-primary hover:bg-primary/90 flex gap-2">
            <LandPlot size={18} /> Tambah Lahan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Cari pemilik atau komoditas..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-slate-500">
              Menampilkan <strong>{filteredLahan.length}</strong> dari {daftarLahan.length} lahan
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-semibold">Nama Pemilik</TableHead>
                  <TableHead className="font-semibold">Komoditas</TableHead>
                  <TableHead className="font-semibold text-center">Luas (Ha)</TableHead>
                  <TableHead className="font-semibold">Status Spasial</TableHead>
                  <TableHead className="text-right font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLahan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-400 py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={40} className="opacity-20" />
                        <p>Tidak ada data lahan yang ditemukan.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLahan.map((l) => (
                    <TableRow key={l.id_lahan} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-medium text-slate-900">{l.petani?.nama || '-'}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {l.komoditas.length > 0 ? (
                            l.komoditas.map(k => (
                              <span key={k.id_komoditas} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                                {k.nama_komoditas}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400 text-xs italic">Belum ditentukan</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-slate-700">{l.luas}</TableCell>
                      <TableCell>
                        {l.koordinat ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                            Terpetakan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                            Non-Spasial
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => hapusLahan(l.id_lahan)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        <Dialog open={dialogBuka} onOpenChange={setDialogBuka}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Tambah Data Lahan</DialogTitle>
              <DialogDescription>
                Masukkan informasi kepemilikan dan karakteristik lahan baru.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pemilik" className="text-right">Pemilik</Label>
                <select id="pemilik" className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={form.id_petani} onChange={e => setForm({...form, id_petani: e.target.value})}>
                  <option value="">-- Pilih Petani --</option>
                  {daftarPetani.map(p => <option key={p.id_petani} value={p.id_petani}>{p.nama}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="luas" className="text-right">Luas (Ha)</Label>
                <Input id="luas" type="number" step="0.01" className="col-span-3" value={form.luas} onChange={e => setForm({...form, luas: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">Komoditas</Label>
                <div className="col-span-3 flex flex-wrap gap-2 pt-1">
                  {daftarKomoditas.map(k => (
                    <button
                      key={k.id_komoditas}
                      type="button"
                      onClick={() => toggleKomoditas(k.id_komoditas)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                        form.komoditas.includes(k.id_komoditas) 
                        ? 'bg-primary text-white border-primary shadow-sm' 
                        : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {k.nama_komoditas}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogBuka(false)}>Batal</Button>
              <Button onClick={simpan} className="bg-primary">Simpan Lahan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}

DataLahan.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
