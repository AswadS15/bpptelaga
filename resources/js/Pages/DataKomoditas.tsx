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
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Kelola Komoditas</CardTitle>
        <Button onClick={bukaDialogTambah} className="bg-primary flex gap-2">
          <Plus size={16} /> Tambah Komoditas
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Nama Komoditas</TableHead>
                <TableHead>Jumlah Lahan</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {daftarKomoditas.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-slate-400 py-8">Belum ada data komoditas.</TableCell></TableRow>
              ) : (
                daftarKomoditas.map((k) => (
                  <TableRow key={k.id_komoditas}>
                    <TableCell className="font-medium">{k.nama_komoditas}</TableCell>
                    <TableCell>{k.lahan_count} lahan</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => bukaDialogEdit(k)}>
                        <Edit size={16} className="text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => hapus(k.id_komoditas)}>
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
            <DialogTitle>{modeEdit ? 'Ubah Komoditas' : 'Tambah Komoditas'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nama Komoditas</Label><Input value={form.nama_komoditas} onChange={e => setForm({...form, nama_komoditas: e.target.value})} /></div>
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

DataKomoditas.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
