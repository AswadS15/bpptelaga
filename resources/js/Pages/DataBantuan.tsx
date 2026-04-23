import { useState, useMemo } from 'react'
import { router } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/Components/ui/dialog'
import { Plus, Edit, Trash2, HandCoins, Search } from 'lucide-react'
import TataLetak from '@/Komponen/TataLetak'

interface PetaniPivot {
  id_petani: number
  nama: string
  pivot: { tanggal: string }
}

interface BantuanType {
  id_bantuan: number
  nama_bantuan: string
  petani: PetaniPivot[]
}

interface Props {
  daftarBantuan: BantuanType[]
  daftarPetani: { id_petani: number; nama: string }[]
}

export default function DataBantuan({ daftarBantuan, daftarPetani }: Props) {
  const [dialogBuka, setDialogBuka] = useState(false)
  const [modeEdit, setModeEdit] = useState(false)
  const [idEdit, setIdEdit] = useState<number | null>(null)
  const [form, setForm] = useState({ nama_bantuan: '', penerima: [] as { id_petani: number; tanggal: string }[] })
  const [searchTerm, setSearchTerm] = useState('')

  const filteredBantuan = useMemo(() => {
    return daftarBantuan.filter(b => 
      b.nama_bantuan.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [daftarBantuan, searchTerm])

  const bukaDialogTambah = () => {
    setModeEdit(false)
    setIdEdit(null)
    setForm({ nama_bantuan: '', penerima: [] })
    setDialogBuka(true)
  }

  const bukaDialogEdit = (b: BantuanType) => {
    setModeEdit(true)
    setIdEdit(b.id_bantuan)
    setForm({
      nama_bantuan: b.nama_bantuan,
      penerima: b.petani.map(p => ({ id_petani: p.id_petani, tanggal: p.pivot.tanggal })),
    })
    setDialogBuka(true)
  }

  const simpan = () => {
    if (modeEdit && idEdit) {
      router.put(`/data-bantuan/${idEdit}`, form, { onSuccess: () => setDialogBuka(false) })
    } else {
      router.post('/data-bantuan', form, { onSuccess: () => setDialogBuka(false) })
    }
  }

  const hapus = (id: number) => {
    if (confirm('Yakin ingin menghapus data bantuan ini?')) {
      router.delete(`/data-bantuan/${id}`)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800">Program Bantuan Pemerintah</CardTitle>
            <p className="text-sm text-slate-500">Monitoring distribusi bantuan dan hibah untuk petani</p>
          </div>
          <Button onClick={bukaDialogTambah} className="bg-primary hover:bg-primary/90 flex gap-2">
            <Plus size={18} /> Tambah Bantuan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Cari program bantuan..." 
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
                  <TableHead className="font-semibold text-slate-700">Nama Program Bantuan</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Penerima Manfaat</TableHead>
                  <TableHead className="text-right font-semibold text-slate-700">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBantuan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-slate-400 py-12">
                      <div className="flex flex-col items-center gap-2">
                        <HandCoins size={40} className="opacity-20" />
                        <p>Belum ada program bantuan yang tercatat.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBantuan.map((b) => (
                    <TableRow key={b.id_bantuan} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-semibold text-slate-900">{b.nama_bantuan}</TableCell>
                      <TableCell className="text-center">
                        <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
                          {b.petani.length} Petani
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => bukaDialogEdit(b)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => hapus(b.id_bantuan)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
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
              <DialogTitle className="text-xl">{modeEdit ? 'Ubah Data Program' : 'Tambah Program Bantuan'}</DialogTitle>
              <DialogDescription>
                Definisikan nama program bantuan pemerintah atau hibah.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nama" className="text-right">Nama Program</Label>
                <Input id="nama" className="col-span-3" value={form.nama_bantuan} onChange={e => setForm({...form, nama_bantuan: e.target.value})} placeholder="Contoh: Bantuan Pupuk Subsidi" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogBuka(false)}>Batal</Button>
              <Button onClick={simpan} className="bg-primary">{modeEdit ? 'Simpan Perubahan' : 'Simpan Program'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}

DataBantuan.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
