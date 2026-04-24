import { useState, useMemo, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/Components/ui/dialog'
import { Plus, Edit, Trash2, Sprout, Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import TataLetak from '@/Komponen/TataLetak'

interface KomoditasType {
  id_komoditas: number
  nama_komoditas: string
  lahan_count: number
  created_at?: string
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
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: 'nama_komoditas' | 'jumlah' | 'waktu', direction: 'asc' | 'desc' } | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const filteredKomoditas = useMemo(() => {
    let result = daftarKomoditas.filter(k => 
      k.nama_komoditas.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch(sortConfig.key) {
          case 'nama_komoditas':
            aValue = a.nama_komoditas.toLowerCase();
            bValue = b.nama_komoditas.toLowerCase();
            break;
          case 'jumlah':
            aValue = a.lahan_count;
            bValue = b.lahan_count;
            break;
          case 'waktu':
            aValue = a.id_komoditas;
            bValue = b.id_komoditas;
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
  }, [daftarKomoditas, searchTerm, sortConfig])

  // Reset pagination when filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig, perPage])

  const paginatedKomoditas = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredKomoditas.slice(start, start + perPage);
  }, [filteredKomoditas, currentPage, perPage]);

  const requestSort = (key: 'nama_komoditas' | 'jumlah' | 'waktu') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  const getSortIcon = (key: 'nama_komoditas' | 'jumlah' | 'waktu') => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={14} className="ml-1 opacity-20" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />;
  }

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

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredKomoditas.map(k => k.id_komoditas))
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
    if (confirm(`Yakin ingin menghapus ${selectedRows.length} komoditas yang dipilih?`)) {
      router.post('/data-komoditas/bulk-destroy', { ids: selectedRows }, {
        onSuccess: () => setSelectedRows([])
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Master Komoditas</CardTitle>
            <p className="text-sm text-muted-foreground">Kelola jenis tanaman dan komoditas pertanian unggulan</p>
          </div>
          <Button onClick={bukaDialogTambah} className="bg-primary hover:bg-primary/90 flex gap-2">
            <Plus size={18} /> Tambah Komoditas
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Cari nama komoditas..." 
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
                Menampilkan <strong className="text-foreground">{filteredKomoditas.length}</strong> dari {daftarKomoditas.length} komoditas
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
                      checked={paginatedKomoditas.length > 0 && selectedRows.length === filteredKomoditas.length}
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => requestSort('nama_komoditas')}
                  >
                    <div className="flex items-center">Nama Komoditas {getSortIcon('nama_komoditas')}</div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground text-center cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => requestSort('jumlah')}
                  >
                    <div className="flex items-center justify-center">Utilisasi Lahan {getSortIcon('jumlah')}</div>
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
                {paginatedKomoditas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                      <div className="flex flex-col items-center gap-2">
                        <Sprout size={40} className="opacity-20" />
                        <p>Belum ada data komoditas.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedKomoditas.map((k) => (
                    <TableRow 
                      key={k.id_komoditas} 
                      className={`transition-colors ${selectedRows.includes(k.id_komoditas) ? 'bg-primary/5' : 'hover:bg-accent/50'}`}
                    >
                      <TableCell className="text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-background accent-primary cursor-pointer"
                          checked={selectedRows.includes(k.id_komoditas)}
                          onChange={() => toggleRow(k.id_komoditas)}
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">{k.nama_komoditas}</TableCell>
                      <TableCell className="text-center">
                        <span className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100">
                          {k.lahan_count} Lahan
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
                          <Button variant="ghost" size="icon" onClick={() => hapus(k.id_komoditas)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
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
          {filteredKomoditas.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Menampilkan {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, filteredKomoditas.length)} dari {filteredKomoditas.length} data
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
                  Halaman {currentPage} dari {Math.ceil(filteredKomoditas.length / perPage)}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredKomoditas.length / perPage), prev + 1))}
                  disabled={currentPage >= Math.ceil(filteredKomoditas.length / perPage)}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
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
