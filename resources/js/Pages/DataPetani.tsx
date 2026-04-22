import { useState, useMemo } from 'react'
import { router } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/Components/ui/dialog'
import { Plus, Edit, Trash2, Search, UserPlus } from 'lucide-react'
import TataLetak from '@/Komponen/TataLetak'

interface PetaniType {
  id_petani: number
  nik: string
  nama: string
  jenis_kelamin: string
  no_hp: string | null
  alamat: string | null
}

interface Props {
  daftarPetani: PetaniType[]
}

export default function DataPetani({ daftarPetani }: Props) {
  const [dialogBuka, setDialogBuka] = useState(false)
  const [modeEdit, setModeEdit] = useState(false)
  const [idEdit, setIdEdit] = useState<number | null>(null)
  const [form, setForm] = useState({ nik: '', nama: '', jenis_kelamin: 'L', no_hp: '', alamat: '' })
  const [searchTerm, setSearchTerm] = useState('')

  // Client-side filtering
  const filteredPetani = useMemo(() => {
    return daftarPetani.filter(p => 
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nik.includes(searchTerm) ||
      (p.alamat && p.alamat.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [daftarPetani, searchTerm])

  const bukaDialogTambah = () => {
    setModeEdit(false)
    setIdEdit(null)
    setForm({ nik: '', nama: '', jenis_kelamin: 'L', no_hp: '', alamat: '' })
    setDialogBuka(true)
  }

  const bukaDialogEdit = (p: PetaniType) => {
    setModeEdit(true)
    setIdEdit(p.id_petani)
    setForm({ nik: p.nik, nama: p.nama, jenis_kelamin: p.jenis_kelamin, no_hp: p.no_hp || '', alamat: p.alamat || '' })
    setDialogBuka(true)
  }

  const simpan = () => {
    if (modeEdit && idEdit) {
      router.put(`/data-petani/${idEdit}`, form, { onSuccess: () => setDialogBuka(false) })
    } else {
      router.post('/data-petani', form, { onSuccess: () => setDialogBuka(false) })
    }
  }

  const hapusPetani = (id: number) => {
    if (confirm('Yakin ingin menghapus data petani ini?')) {
      router.delete(`/data-petani/${id}`)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800">Manajemen Data Petani</CardTitle>
            <p className="text-sm text-slate-500">Kelola informasi profil petani di Kecamatan Telaga</p>
          </div>
          <Button onClick={bukaDialogTambah} className="bg-primary hover:bg-primary/90 flex gap-2">
            <UserPlus size={18} /> Tambah Petani
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input 
                placeholder="Cari nama, NIK, atau alamat..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-slate-500">
              Menampilkan <strong>{filteredPetani.length}</strong> dari {daftarPetani.length} petani
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-semibold">NIK</TableHead>
                  <TableHead className="font-semibold">Nama Lengkap</TableHead>
                  <TableHead className="font-semibold">Gender</TableHead>
                  <TableHead className="font-semibold">No HP</TableHead>
                  <TableHead className="font-semibold">Alamat</TableHead>
                  <TableHead className="text-right font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPetani.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={40} className="opacity-20" />
                        <p>Tidak ada data petani yang ditemukan.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPetani.map((p) => (
                    <TableRow key={p.id_petani} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell className="font-mono text-xs">{p.nik}</TableCell>
                      <TableCell className="font-medium text-slate-900">{p.nama}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.jenis_kelamin === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                          {p.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-600">{p.no_hp || '-'}</TableCell>
                      <TableCell className="text-slate-600 max-w-[200px] truncate">{p.alamat || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => bukaDialogEdit(p)} className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => hapusPetani(p.id_petani)} className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
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
              <DialogTitle className="text-xl">{modeEdit ? 'Ubah Profil Petani' : 'Registrasi Petani Baru'}</DialogTitle>
              <DialogDescription>
                Lengkapi formulir di bawah ini dengan data yang valid.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nik" className="text-right">NIK</Label>
                <Input id="nik" className="col-span-3" value={form.nik} onChange={e => setForm({...form, nik: e.target.value})} maxLength={16} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nama" className="text-right">Nama</Label>
                <Input id="nama" className="col-span-3" value={form.nama} onChange={e => setForm({...form, nama: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Gender</Label>
                <select className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={form.jenis_kelamin} onChange={e => setForm({...form, jenis_kelamin: e.target.value})}>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="no_hp" className="text-right">No HP</Label>
                <Input id="no_hp" className="col-span-3" value={form.no_hp} onChange={e => setForm({...form, no_hp: e.target.value})} />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="alamat" className="text-right">Alamat</Label>
                <Input id="alamat" className="col-span-3" value={form.alamat} onChange={e => setForm({...form, alamat: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogBuka(false)}>Batal</Button>
              <Button onClick={simpan} className="bg-primary">{modeEdit ? 'Simpan Perubahan' : 'Daftarkan Petani'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}

DataPetani.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
