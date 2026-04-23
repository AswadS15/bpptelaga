import { useState, useMemo } from 'react'
import { router } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/Components/ui/dialog'
import { Plus, Edit, Trash2, Sprout, Search } from 'lucide-react'
import TataLetak from '@/Komponen/TataLetak'

interface KomoditasType {
  id_komoditas: number
  nama_komoditas: string
  lahan_count: number
}

interface Props {
  daftarKomoditas: KomoditasType[]
}

export default function DataKomoditas({ daftarKomoditas }: Props) {
  const [dialogBuka, setDialogBuka] = useState(false)
  const [modeEdit, setModeEdit] = useState(false)
  const [idEdit, setIdEdit] = useState<number | null>(null)
  const [form, setForm] = useState({ nama_komoditas: '' })
  const [searchTerm, setSearchTerm] = useState('')

  const filteredKomoditas = useMemo(() => {
    return daftarKomoditas.filter(k => 
      k.nama_komoditas.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [daftarKomoditas, searchTerm])

  const bukaDialogTambah = () => {
    setModeEdit(false)
    setIdEdit(null)
    setForm({ nama_komoditas: '' })
    setDialogBuka(true)
  }

  const bukaDialogEdit = (k: KomoditasType) => {
    setModeEdit(true)
    setIdEdit(k.id_komoditas)
    setForm({ nama_komoditas: k.nama_komoditas })
    setDialogBuka(true)
  }

  const simpan = () => {
    if (modeEdit && idEdit) {
      router.put(`/data-komoditas/${idEdit}`, form, { onSuccess: () => setDialogBuka(false) })
    } else {
      router.post('/data-komoditas', form, { onSuccess: () => setDialogBuka(false) })
    }
  }

  const hapus = (id: number) => {
    if (confirm('Yakin ingin menghapus komoditas ini?')) {
      router.delete(`/data-komoditas/${id}`)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800">Master Komoditas</CardTitle>
            <p className="text-sm text-slate-500">Kelola jenis tanaman dan komoditas pertanian unggulan</p>
          </div>
          <Button onClick={bukaDialogTambah} className="bg-primary hover:bg-primary/90 flex gap-2">
            <Plus size={18} /> Tambah Komoditas
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Cari nama komoditas..." 
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
                  <TableHead className="font-semibold text-slate-700">Nama Komoditas</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Utilisasi Lahan</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKomoditas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-slate-400 py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Sprout size={40} className="opacity-20" />
                        <p>Belum ada data komoditas.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredKomoditas.map((k) => (
                    <TableRow key={k.id_komoditas} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-semibold text-slate-900">{k.nama_komoditas}</TableCell>
                      <TableCell className="text-center">
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                          {k.lahan_count} Lahan
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => bukaDialogEdit(k)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => hapus(k.id_komoditas)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">{modeEdit ? 'Ubah Komoditas' : 'Tambah Komoditas Baru'}</DialogTitle>
              <DialogDescription>
                Masukkan nama komoditas pertanian untuk dikategorikan dalam sistem.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nama" className="text-right">Nama</Label>
                <Input id="nama" className="col-span-3" value={form.nama_komoditas} onChange={e => setForm({...form, nama_komoditas: e.target.value})} placeholder="Contoh: Padi Sawah" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogBuka(false)}>Batal</Button>
              <Button onClick={simpan} className="bg-primary">{modeEdit ? 'Simpan Perubahan' : 'Simpan Komoditas'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}

DataKomoditas.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
