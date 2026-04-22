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
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Kelola Kelompok Tani</CardTitle>
        <Button onClick={bukaDialogTambah} className="bg-primary flex gap-2">
          <Plus size={16} /> Tambah Kelompok
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Nama Kelompok</TableHead>
                <TableHead>Desa</TableHead>
                <TableHead>Jumlah Anggota</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {daftarKelompokTani.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-8">Belum ada data kelompok tani.</TableCell></TableRow>
              ) : (
                daftarKelompokTani.map((k) => (
                  <TableRow key={k.id_kelompok}>
                    <TableCell className="font-medium">{k.nama_kelompok}</TableCell>
                    <TableCell>{k.desa}</TableCell>
                    <TableCell>{k.petani.length} orang</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => bukaDialogEdit(k)}>
                        <Edit size={16} className="text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => hapus(k.id_kelompok)}>
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
            <DialogTitle>{modeEdit ? 'Ubah Kelompok Tani' : 'Tambah Kelompok Tani'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nama Kelompok</Label><Input value={form.nama_kelompok} onChange={e => setForm({...form, nama_kelompok: e.target.value})} /></div>
            <div><Label>Desa</Label><Input value={form.desa} onChange={e => setForm({...form, desa: e.target.value})} /></div>
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

DataKelompokTani.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
