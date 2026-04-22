import { useState } from 'react'
import { router } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/Components/ui/dialog'
import { Plus, Edit, Trash2 } from 'lucide-react'
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
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Kelola Data Bantuan</CardTitle>
        <Button onClick={bukaDialogTambah} className="bg-primary flex gap-2">
          <Plus size={16} /> Tambah Bantuan
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Nama Bantuan</TableHead>
                <TableHead>Jumlah Penerima</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {daftarBantuan.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-slate-400 py-8">Belum ada data bantuan.</TableCell></TableRow>
              ) : (
                daftarBantuan.map((b) => (
                  <TableRow key={b.id_bantuan}>
                    <TableCell className="font-medium">{b.nama_bantuan}</TableCell>
                    <TableCell>{b.petani.length} petani</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => bukaDialogEdit(b)}>
                        <Edit size={16} className="text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => hapus(b.id_bantuan)}>
                        <Trash2 size={16} className="text-red-600" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modeEdit ? 'Ubah Bantuan' : 'Tambah Bantuan'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nama Bantuan</Label><Input value={form.nama_bantuan} onChange={e => setForm({...form, nama_bantuan: e.target.value})} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogBuka(false)}>Batal</Button>
            <Button onClick={simpan}>{modeEdit ? 'Simpan Perubahan' : 'Tambah'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

DataBantuan.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
