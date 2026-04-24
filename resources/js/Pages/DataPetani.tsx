import { useState, useMemo, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/Components/ui/dialog'
import { Plus, Edit, Trash2, Search, UserPlus, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import TataLetak from '@/Komponen/TataLetak'

interface PetaniType {
  id_petani: number
  nik: string
  nama: string
  jenis_kelamin: string
  no_hp: string | null
  alamat: string | null
  created_at?: string
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
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: keyof PetaniType | 'waktu', direction: 'asc' | 'desc' } | null>(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Client-side filtering & sorting
  const filteredPetani = useMemo(() => {
    let result = daftarPetani.filter(p => 
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nik.includes(searchTerm) ||
      (p.alamat && p.alamat.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue: any = sortConfig.key === 'waktu' ? a.id_petani : a[sortConfig.key as keyof PetaniType];
        let bValue: any = sortConfig.key === 'waktu' ? b.id_petani : b[sortConfig.key as keyof PetaniType];
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [daftarPetani, searchTerm, sortConfig])

  // Reset pagination when filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig, perPage])

  const paginatedPetani = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredPetani.slice(start, start + perPage);
  }, [filteredPetani, currentPage, perPage]);

  const requestSort = (key: keyof PetaniType | 'waktu') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  const getSortIcon = (key: keyof PetaniType | 'waktu') => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={14} className="ml-1 opacity-20" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />;
  }

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

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredPetani.map(p => p.id_petani))
    } else {
      setSelectedRows([])
    }
  }

  const toggleRow = (id: number) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  const bulkHapus = () => {
    if (selectedRows.length === 0) return
    if (confirm(`Yakin ingin menghapus ${selectedRows.length} data petani yang dipilih?`)) {
      router.post('/data-petani/bulk-destroy', { ids: selectedRows }, {
        onSuccess: () => setSelectedRows([])
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Manajemen Data Petani</CardTitle>
            <p className="text-sm text-muted-foreground">Kelola informasi profil petani di Kecamatan Telaga</p>
          </div>
          <Button onClick={bukaDialogTambah} className="bg-primary hover:bg-primary/90 flex gap-2">
            <UserPlus size={18} /> Tambah Petani
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Cari nama, NIK, atau alamat..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <select 
                className="h-10 rounded-md border border-input bg-background pl-3 pr-8 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
              >
                <option value={10}>10 Data</option>
                <option value={30}>30 Data</option>
                <option value={50}>50 Data</option>
              </select>
            </div>
            
            <div className="flex items-center gap-4 ml-auto">
              {selectedRows.length > 0 && (
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={bulkHapus}
                  className="animate-in fade-in zoom-in duration-200"
                >
                  <Trash2 size={16} className="mr-2" />
                  Hapus ({selectedRows.length})
                </Button>
              )}
              <div className="text-sm text-muted-foreground">
                Menampilkan <strong className="text-foreground">{filteredPetani.length}</strong> dari {daftarPetani.length} petani
              </div>
            </div>
          </div>

          <div className="border border-border rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12 text-center">
                    <input 
                      type="checkbox" 
                      className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-background accent-primary cursor-pointer"
                      checked={paginatedPetani.length > 0 && selectedRows.length === filteredPetani.length}
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => requestSort('nik')}
                  >
                    <div className="flex items-center">NIK {getSortIcon('nik')}</div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => requestSort('nama')}
                  >
                    <div className="flex items-center">Nama Lengkap {getSortIcon('nama')}</div>
                  </TableHead>
                  <TableHead className="font-semibold text-foreground">Gender</TableHead>
                  <TableHead className="font-semibold text-foreground">No HP</TableHead>
                  <TableHead className="font-semibold text-foreground">Alamat</TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => requestSort('waktu')}
                  >
                    <div className="flex items-center">Waktu {getSortIcon('waktu')}</div>
                  </TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPetani.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Search size={40} className="opacity-20" />
                        <p>Tidak ada data petani yang ditemukan.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPetani.map((p) => (
                    <TableRow 
                      key={p.id_petani} 
                      className={`transition-colors ${selectedRows.includes(p.id_petani) ? 'bg-primary/5' : 'hover:bg-accent/50'}`}
                    >
                      <TableCell className="text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-background accent-primary cursor-pointer"
                          checked={selectedRows.includes(p.id_petani)}
                          onChange={() => toggleRow(p.id_petani)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{p.nik}</TableCell>
                      <TableCell className="font-medium text-foreground">{p.nama}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${p.jenis_kelamin === 'L' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'}`}>
                          {p.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{p.no_hp || '-'}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">{p.alamat || '-'}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">{p.created_at ? new Date(p.created_at).toLocaleDateString('id-ID') : 'Baru'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => bukaDialogEdit(p)} className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => hapusPetani(p.id_petani)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
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

          {/* Pagination Controls */}
          {filteredPetani.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Menampilkan {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, filteredPetani.length)} dari {filteredPetani.length} data
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Sebelumnya
                </Button>
                <div className="text-sm font-medium px-2">
                  Halaman {currentPage} dari {Math.ceil(filteredPetani.length / perPage)}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredPetani.length / perPage), prev + 1))}
                  disabled={currentPage >= Math.ceil(filteredPetani.length / perPage)}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
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
