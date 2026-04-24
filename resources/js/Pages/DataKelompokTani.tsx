import { useState, useMemo, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/Components/ui/dialog'
import { Plus, Edit, Trash2, Search, UsersRound, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import TataLetak from '@/Komponen/TataLetak'

interface KelompokTaniType {
  id_kelompok: number
  nama_kelompok: string
  desa: string
  petani: { id_petani: number; nama: string }[]
  created_at?: string
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
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: 'nama_kelompok' | 'desa' | 'jumlah' | 'waktu', direction: 'asc' | 'desc' } | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const filteredKelompok = useMemo(() => {
    let result = daftarKelompokTani.filter(k => 
      k.nama_kelompok.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.desa.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch(sortConfig.key) {
          case 'nama_kelompok':
            aValue = a.nama_kelompok.toLowerCase();
            bValue = b.nama_kelompok.toLowerCase();
            break;
          case 'desa':
            aValue = a.desa.toLowerCase();
            bValue = b.desa.toLowerCase();
            break;
          case 'jumlah':
            aValue = a.petani.length;
            bValue = b.petani.length;
            break;
          case 'waktu':
            aValue = a.id_kelompok;
            bValue = b.id_kelompok;
            break;
          default:
            return 0;
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [daftarKelompokTani, searchTerm, sortConfig])

  // Reset pagination when filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig, perPage])

  const paginatedKelompok = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredKelompok.slice(start, start + perPage);
  }, [filteredKelompok, currentPage, perPage]);

  const requestSort = (key: 'nama_kelompok' | 'desa' | 'jumlah' | 'waktu') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  const getSortIcon = (key: 'nama_kelompok' | 'desa' | 'jumlah' | 'waktu') => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={14} className="ml-1 opacity-20" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />;
  }

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

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredKelompok.map(k => k.id_kelompok))
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
    if (confirm(`Yakin ingin menghapus ${selectedRows.length} data kelompok tani yang dipilih?`)) {
      router.post('/data-kelompok-tani/bulk-destroy', { ids: selectedRows }, {
        onSuccess: () => setSelectedRows([])
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Daftar Kelompok Tani</CardTitle>
            <p className="text-sm text-muted-foreground">Kelola kelompok tani dan keanggotaan di wilayah BPP Telaga</p>
          </div>
          <Button onClick={bukaDialogTambah} className="bg-primary hover:bg-primary/90 flex gap-2">
            <Plus size={18} /> Tambah Kelompok
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Cari nama kelompok atau desa..." 
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
                Menampilkan <strong className="text-foreground">{filteredKelompok.length}</strong> dari {daftarKelompokTani.length} kelompok
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
                      checked={paginatedKelompok.length > 0 && selectedRows.length === filteredKelompok.length}
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => requestSort('nama_kelompok')}
                  >
                    <div className="flex items-center">Nama Kelompok {getSortIcon('nama_kelompok')}</div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => requestSort('desa')}
                  >
                    <div className="flex items-center">Desa {getSortIcon('desa')}</div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground text-center cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => requestSort('jumlah')}
                  >
                    <div className="flex items-center justify-center">Jumlah Anggota {getSortIcon('jumlah')}</div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-center text-foreground cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => requestSort('waktu')}
                  >
                    <div className="flex items-center justify-center">Waktu {getSortIcon('waktu')}</div>
                  </TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedKelompok.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      <div className="flex flex-col items-center gap-2">
                        <UsersRound size={40} className="opacity-20" />
                        <p>Belum ada data kelompok tani.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedKelompok.map((k) => (
                    <TableRow 
                      key={k.id_kelompok} 
                      className={`transition-colors ${selectedRows.includes(k.id_kelompok) ? 'bg-primary/5' : 'hover:bg-accent/50'}`}
                    >
                      <TableCell className="text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-background accent-primary cursor-pointer"
                          checked={selectedRows.includes(k.id_kelompok)}
                          onChange={() => toggleRow(k.id_kelompok)}
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">{k.nama_kelompok}</TableCell>
                      <TableCell className="text-muted-foreground">{k.desa}</TableCell>
                      <TableCell className="text-center">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                          {k.petani.length} Orang
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground text-sm">
                        {k.created_at ? new Date(k.created_at).toLocaleDateString('id-ID') : 'Baru'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => bukaDialogEdit(k)} className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => hapus(k.id_kelompok)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
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
          {filteredKelompok.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Menampilkan {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, filteredKelompok.length)} dari {filteredKelompok.length} data
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
                  Halaman {currentPage} dari {Math.ceil(filteredKelompok.length / perPage)}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredKelompok.length / perPage), prev + 1))}
                  disabled={currentPage >= Math.ceil(filteredKelompok.length / perPage)}
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
