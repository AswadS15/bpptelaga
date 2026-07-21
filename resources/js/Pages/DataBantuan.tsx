import { useState, useMemo, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Button } from '@/Components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/Components/ui/dialog'
import Icon from '@/Komponen/Icon'
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

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

function formatWaktu(iso?: string): string {
  if (!iso) return 'Baru'
  const d = new Date(iso)
  const tgl = d.getDate()
  const bln = BULAN[d.getMonth()]
  const thn = d.getFullYear()
  return `${tgl} ${bln} ${thn}`
}

type SortKey = 'nama_bantuan' | 'jumlah' | 'waktu'

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const pages: (number | '...')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < total - 1) pages.push('...')
  pages.push(total)
  return pages
}

export default function DataBantuan({ daftarBantuan, daftarPetani }: Props) {
  const [dialogBuka, setDialogBuka] = useState(false)
  const [modeEdit, setModeEdit] = useState(false)
  const [idEdit, setIdEdit] = useState<number | null>(null)
  const [form, setForm] = useState({ nama_bantuan: '', penerima: [] as { id_petani: number; tanggal: string }[] })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'asc' | 'desc' } | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const filteredBantuan = useMemo(() => {
    let result = daftarBantuan.filter(b =>
      b.nama_bantuan.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sortConfig.key) {
          case 'nama_bantuan':
            aValue = a.nama_bantuan.toLowerCase()
            bValue = b.nama_bantuan.toLowerCase()
            break
          case 'jumlah':
            aValue = a.petani.length
            bValue = b.petani.length
            break
          case 'waktu':
            aValue = a.id_bantuan
            bValue = b.id_bantuan
            break
          default:
            return 0
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return result
  }, [daftarBantuan, searchTerm, sortConfig])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortConfig, perPage])

  const totalPages = Math.max(1, Math.ceil(filteredBantuan.length / perPage))

  const paginatedBantuan = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredBantuan.slice(start, start + perPage)
  }, [filteredBantuan, currentPage, perPage])

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const getSortIcon = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) return <Icon name="swap_vert" size={14} className="ml-1 opacity-30" />
    return sortConfig.direction === 'asc' ? <Icon name="expand_less" size={14} className="ml-1" /> : <Icon name="expand_more" size={14} className="ml-1" />
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
      setSelectedRows(paginatedBantuan.map(b => b.id_bantuan))
    } else {
      setSelectedRows([])
    }
  }

  const toggleRow = (id: number) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  const semuaTerpilih = paginatedBantuan.length > 0 && paginatedBantuan.every(b => selectedRows.includes(b.id_bantuan))

  const bulkHapus = () => {
    if (selectedRows.length === 0) return
    if (confirm(`Yakin ingin menghapus ${selectedRows.length} data bantuan yang dipilih?`)) {
      router.post('/data-bantuan/bulk-destroy', { ids: selectedRows }, {
        onSuccess: () => setSelectedRows([])
      })
    }
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages)

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-on-surface">Program Bantuan Pemerintah</h3>
          <p className="mt-1 text-sm text-on-surface-variant">Manajemen data program bantuan pemerintah untuk sektor pertanian di wilayah BPP Telaga.</p>
        </div>
        <Button
          onClick={bukaDialogTambah}
          className="shrink-0 bg-primary-container text-on-primary-container hover:brightness-110 active:scale-95 shadow-sm rounded-xl px-6 py-2.5"
        >
          <Icon name="add" size={20} />
          Tambah Bantuan
        </Button>
      </div>

      {/* Filter & Action Row */}
      <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:flex-1">
          <div className="relative w-full max-w-sm">
            <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <Input
              placeholder="Cari program bantuan..."
              className="pl-10 bg-surface border-outline-variant focus-visible:border-primary rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-sm font-semibold text-on-surface-variant">Tampilkan:</span>
            <select
              className="rounded-lg border border-outline-variant bg-surface px-3 py-1.5 text-sm text-on-surface focus:border-primary focus:outline-none cursor-pointer"
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {selectedRows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={bulkHapus}
              className="rounded-lg"
            >
              <Icon name="delete" size={16} className="mr-1" />
              Hapus ({selectedRows.length})
            </Button>
          )}
          <div className="text-sm font-semibold text-on-surface-variant">
            Menampilkan <span className="font-bold text-on-surface">{filteredBantuan.length}</span> dari <span className="font-bold text-on-surface">{daftarBantuan.length}</span> program
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low">
              <tr className="border-b border-outline-variant">
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer rounded border-outline-variant text-primary accent-primary focus:ring-primary"
                    checked={semuaTerpilih}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
                <th
                  className="cursor-pointer select-none px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant transition-colors hover:bg-surface-container"
                  onClick={() => requestSort('nama_bantuan')}
                >
                  <div className="flex items-center">Nama Program Bantuan {getSortIcon('nama_bantuan')}</div>
                </th>
                <th
                  className="cursor-pointer select-none px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant transition-colors hover:bg-surface-container"
                  onClick={() => requestSort('jumlah')}
                >
                  <div className="flex items-center">Penerima Manfaat {getSortIcon('jumlah')}</div>
                </th>
                <th
                  className="cursor-pointer select-none px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant transition-colors hover:bg-surface-container"
                  onClick={() => requestSort('waktu')}
                >
                  <div className="flex items-center">Waktu {getSortIcon('waktu')}</div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {paginatedBantuan.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center gap-2">
                      <Icon name="search" size={40} className="opacity-20" />
                      <p>Belum ada program bantuan yang tercatat.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedBantuan.map((b) => (
                  <tr
                    key={b.id_bantuan}
                    className={`group transition-colors ${selectedRows.includes(b.id_bantuan) ? 'bg-primary/5' : 'hover:bg-surface-container'}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer rounded border-outline-variant text-primary accent-primary focus:ring-primary"
                        checked={selectedRows.includes(b.id_bantuan)}
                        onChange={() => toggleRow(b.id_bantuan)}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-on-surface">{b.nama_bantuan}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-secondary-container/20 px-3 py-1 text-xs font-semibold text-on-secondary-container">
                        <Icon name="group" size={14} />
                        {b.petani.length} Petani
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID') : 'Baru'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => bukaDialogEdit(b)}
                          title="Edit"
                          className="rounded p-1.5 text-primary transition-colors hover:bg-primary/10"
                        >
                          <Icon name="edit" size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={() => hapus(b.id_bantuan)}
                          title="Hapus"
                          className="rounded p-1.5 text-error transition-colors hover:bg-error/10"
                        >
                          <Icon name="delete" size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredBantuan.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-outline-variant bg-surface-container-low px-4 py-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-highest disabled:opacity-50"
            >
              <Icon name="chevron_left" size={18} />
              Sebelumnya
            </button>
            <div className="flex items-center gap-1">
              {pageNumbers.map((pg, i) =>
                pg === '...' ? (
                  <span key={`dots-${i}`} className="px-1 text-on-surface-variant">...</span>
                ) : (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${pg === currentPage ? 'bg-primary text-on-primary' : 'hover:bg-surface-container text-on-surface-variant'}`}
                  >
                    {pg}
                  </button>
                )
              )}
            </div>
            <button
              type="button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-highest disabled:opacity-50"
            >
              Selanjutnya
              <Icon name="chevron_right" size={18} />
            </button>
          </div>
        )}
      </div>

      <Dialog open={dialogBuka} onOpenChange={setDialogBuka}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">{modeEdit ? 'Ubah Program Bantuan' : 'Tambah Program Bantuan'}</DialogTitle>
            <DialogDescription>
              Definisikan nama program bantuan pemerintah atau hibah.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nama" className="text-right">Nama Program</Label>
              <Input id="nama" className="col-span-3" value={form.nama_bantuan} onChange={e => setForm({ ...form, nama_bantuan: e.target.value })} placeholder="Contoh: Bantuan Pupuk Subsidi" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogBuka(false)}>Batal</Button>
            <Button onClick={simpan} className="bg-primary">{modeEdit ? 'Simpan Perubahan' : 'Simpan Program'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

DataBantuan.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
