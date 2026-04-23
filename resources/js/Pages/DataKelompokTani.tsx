import { useState, useMemo } from 'react'
import { router } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/Components/ui/dialog'
import { Plus, Edit, Trash2, Search, UsersRound } from 'lucide-react'
import TataLetak from '@/Komponen/TataLetak'

interface KelompokTaniType {
  id_kelompok: number
  nama_kelompok: string
  desa: string
  petani: { id_petani: number; nama: string }[]
}

interface Props {
  daftarKelompokTani: KelompokTaniType[]
  daftarPetani: { id_petani: number; nama: string }[]
}

export default function DataKelompokTani({ daftarKelompokTani, daftarPetani }: Props) {
  const [dialogBuka, setDialogBuka] = useState(false)
  const [modeEdit, setModeEdit] = useState(false)
  const [idEdit, setIdEdit] = useState<number | null>(null)
  const [form, setForm] = useState({ nama_kelompok: '', desa: '', anggota: [] as number[] })
  const [searchTerm, setSearchTerm] = useState('')

  const filteredKelompok = useMemo(() => {
    return daftarKelompokTani.filter(k => 
      k.nama_kelompok.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.desa.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [daftarKelompokTani, searchTerm])

  const bukaDialogTambah = () => {
    setModeEdit(false)
    setIdEdit(null)
    setForm({ nama_kelompok: '', desa: '', anggota: [] })
    setDialogBuka(true)
  }

  const bukaDialogEdit = (kelompok: KelompokTaniType) => {
    setModeEdit(true)
    setIdEdit(kelompok.id_kelompok)
    setForm({
      nama_kelompok: kelompok.nama_kelompok,
      desa: kelompok.desa,
      anggota: kelompok.petani.map(p => p.id_petani),
    })
    setDialogBuka(true)
  }

  const simpan = () => {
    if (modeEdit && idEdit) {
      router.put(`/data-kelompok-tani/${idEdit}`, form, { onSuccess: () => setDialogBuka(false) })
    } else {
      router.post('/data-kelompok-tani', form, { onSuccess: () => setDialogBuka(false) })
    }
  }

  const hapus = (id: number) => {
    if (confirm('Yakin ingin menghapus kelompok tani ini?')) {
      router.delete(`/data-kelompok-tani/${id}`)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800">Daftar Kelompok Tani</CardTitle>
            <p className="text-sm text-slate-500">Kelola kelompok tani dan keanggotaan di wilayah BPP Telaga</p>
          </div>
          <Button onClick={bukaDialogTambah} className="bg-primary hover:bg-primary/90 flex gap-2">
            <Plus size={18} /> Tambah Kelompok
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Cari nama kelompok atau desa..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-semibold text-slate-700">Nama Kelompok</TableHead>
                  <TableHead className="font-semibold text-slate-700">Desa</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Jumlah Anggota</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKelompok.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-slate-400 py-12">
                      <div className="flex flex-col items-center gap-2">
                        <UsersRound size={40} className="opacity-20" />
                        <p>Belum ada data kelompok tani.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKelompok.map((k) => (
                    <TableRow key={k.id_kelompok} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-semibold text-slate-900">{k.nama_kelompok}</TableCell>
                      <TableCell className="text-slate-600">{k.desa}</TableCell>
                      <TableCell className="text-center">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                          {k.petani.length} Orang
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => bukaDialogEdit(k)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => hapus(k.id_kelompok)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                            <Trash2 size={16} />
                          </Button>
                        </div>
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
              <DialogTitle className="text-xl">{modeEdit ? 'Ubah Kelompok Tani' : 'Buat Kelompok Baru'}</DialogTitle>
              <DialogDescription>
                Atur identitas kelompok tani dan pilih desa operasional.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nama" className="text-right">Nama Kelompok</Label>
                <Input id="nama" className="col-span-3" value={form.nama_kelompok} onChange={e => setForm({...form, nama_kelompok: e.target.value})} placeholder="Contoh: Tani Makmur" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="desa" className="text-right">Desa</Label>
                <Input id="desa" className="col-span-3" value={form.desa} onChange={e => setForm({...form, desa: e.target.value})} placeholder="Contoh: Desa Luhu" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogBuka(false)}>Batal</Button>
              <Button onClick={simpan} className="bg-primary">{modeEdit ? 'Simpan Perubahan' : 'Tambah Kelompok'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}

DataKelompokTani.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
