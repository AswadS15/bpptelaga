import { useState, useMemo, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/Components/ui/dialog'
import { Plus, Edit, Trash2, HandCoins, Search, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
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
  created_at?: string
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
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: 'nama_bantuan' | 'jumlah' | 'waktu', direction: 'asc' | 'desc' } | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const filteredBantuan = useMemo(() => {
    let result = daftarBantuan.filter(b => 
      b.nama_bantuan.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;
        
        switch(sortConfig.key) {
          case 'nama_bantuan':
            aValue = a.nama_bantuan.toLowerCase();
            bValue = b.nama_bantuan.toLowerCase();
            break;
          case 'jumlah':
            aValue = a.petani.length;
            bValue = b.petani.length;
            break;
          case 'waktu':
            aValue = a.id_bantuan;
            bValue = b.id_bantuan;
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
  }, [daftarBantuan, searchTerm, sortConfig])

  // Reset pagination when filter/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig, perPage])

  const paginatedBantuan = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredBantuan.slice(start, start + perPage);
  }, [filteredBantuan, currentPage, perPage]);

  const requestSort = (key: 'nama_bantuan' | 'jumlah' | 'waktu') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  const getSortIcon = (key: 'nama_bantuan' | 'jumlah' | 'waktu') => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown size={14} className="ml-1 opacity-20" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />;
  }

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

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredBantuan.map(b => b.id_bantuan))
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
    if (confirm(`Yakin ingin menghapus ${selectedRows.length} data bantuan yang dipilih?`)) {
      router.post('/data-bantuan/bulk-destroy', { ids: selectedRows }, {
        onSuccess: () => setSelectedRows([])
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">Program Bantuan Pemerintah</CardTitle>
            <p className="text-sm text-muted-foreground">Monitoring distribusi bantuan dan hibah untuk petani</p>
          </div>
          <Button onClick={bukaDialogTambah} className="bg-primary hover:bg-primary/90 flex gap-2">
            <Plus size={18} /> Tambah Bantuan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Cari program bantuan..." 
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
                Menampilkan <strong className="text-foreground">{filteredBantuan.length}</strong> dari {daftarBantuan.length} program
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
                      checked={paginatedBantuan.length > 0 && selectedRows.length === filteredBantuan.length}
                      onChange={(e) => toggleAll(e.target.checked)}
                    />
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => requestSort('nama_bantuan')}
                  >
                    <div className="flex items-center">Nama Program Bantuan {getSortIcon('nama_bantuan')}</div>
                  </TableHead>
                  <TableHead 
                    className="font-semibold text-foreground text-center cursor-pointer hover:bg-muted/80 transition-colors select-none"
                    onClick={() => requestSort('jumlah')}
                  >
                    <div className="flex items-center justify-center">Penerima Manfaat {getSortIcon('jumlah')}</div>
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
                {paginatedBantuan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                      <div className="flex flex-col items-center gap-2">
                        <HandCoins size={40} className="opacity-20" />
                        <p>Belum ada program bantuan yang tercatat.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBantuan.map((b) => (
                    <TableRow 
                      key={b.id_bantuan} 
                      className={`transition-colors ${selectedRows.includes(b.id_bantuan) ? 'bg-primary/5' : 'hover:bg-accent/50'}`}
                    >
                      <TableCell className="text-center">
                        <input 
                          type="checkbox" 
                          className="rounded border-border text-primary focus:ring-primary w-4 h-4 bg-background accent-primary cursor-pointer"
                          checked={selectedRows.includes(b.id_bantuan)}
                          onChange={() => toggleRow(b.id_bantuan)}
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">{b.nama_bantuan}</TableCell>
                      <TableCell className="text-center">
                        <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-100">
                          {b.petani.length} Petani
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground text-sm">
                        {b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID') : 'Baru'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => bukaDialogEdit(b)} className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => hapus(b.id_bantuan)} className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10">
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
          {filteredBantuan.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Menampilkan {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, filteredBantuan.length)} dari {filteredBantuan.length} data
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
                  Halaman {currentPage} dari {Math.ceil(filteredBantuan.length / perPage)}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredBantuan.length / perPage), prev + 1))}
                  disabled={currentPage >= Math.ceil(filteredBantuan.length / perPage)}
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
