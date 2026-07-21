import { useState, useMemo, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Button } from '@/Components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/Components/ui/dialog'
import Icon from '@/Komponen/Icon'
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

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

function formatWaktu(iso?: string): string {
  if (!iso) return 'Baru'
  const d = new Date(iso)
  const tgl = d.getDate()
  const bln = BULAN[d.getMonth()]
  const thn = d.getFullYear()
  const jam = String(d.getHours()).padStart(2, '0')
  const mnt = String(d.getMinutes()).padStart(2, '0')
  return `${tgl} ${bln} ${thn}, ${jam}:${mnt}`
}

type SortKey = keyof PetaniType | 'waktu'

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

export default function DataPetani({ daftarPetani }: Props) {
  const [dialogBuka, setDialogBuka] = useState(false)
  const [modeEdit, setModeEdit] = useState(false)
  const [idEdit, setIdEdit] = useState<number | null>(null)
  const [form, setForm] = useState({ nik: '', nama: '', jenis_kelamin: 'L', no_hp: '', alamat: '' })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'asc' | 'desc' } | null>(null)

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
        let aValue: any = sortConfig.key === 'waktu' ? a.id_petani : a[sortConfig.key as keyof PetaniType]
        let bValue: any = sortConfig.key === 'waktu' ? b.id_petani : b[sortConfig.key as keyof PetaniType]

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return result
  }, [daftarPetani, searchTerm, sortConfig])

  // Reset pagination when filter/sort changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, sortConfig, perPage])

  const totalPages = Math.max(1, Math.ceil(filteredPetani.length / perPage))

  const paginatedPetani = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredPetani.slice(start, start + perPage)
  }, [filteredPetani, currentPage, perPage])

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
      setSelectedRows(paginatedPetani.map(p => p.id_petani))
    } else {
      setSelectedRows([])
    }
  }

  const toggleRow = (id: number) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    )
  }

  const semuaTerpilih = paginatedPetani.length > 0 && paginatedPetani.every(p => selectedRows.includes(p.id_petani))

  const bulkHapus = () => {
    if (selectedRows.length === 0) return
    if (confirm(`Yakin ingin menghapus ${selectedRows.length} data petani yang dipilih?`)) {
      router.post('/data-petani/bulk-destroy', { ids: selectedRows }, {
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
          <h3 className="text-2xl font-semibold text-on-surface">Manajemen Data Petani</h3>
          <p className="mt-1 text-sm text-on-surface-variant">Kelola informasi identitas dan data pribadi petani di wilayah BPP Telaga</p>
        </div>
        <Button
          onClick={bukaDialogTambah}
          className="shrink-0 bg-primary-container text-on-primary-container hover:brightness-110 active:scale-95 shadow-sm rounded-xl px-6 py-2.5"
        >
          Tambah Petani
          <Icon name="add" size={20} />
        </Button>
      </div>

      {/* Filter & Action Row */}
      <div className="flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:flex-1">
          <div className="relative w-full max-w-sm">
            <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <Input
              placeholder="Cari NIK, Nama, atau Desa..."
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
              <option value={30}>30</option>
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
            Menampilkan <span className="font-bold text-on-surface">{filteredPetani.length}</span> dari <span className="font-bold text-on-surface">{daftarPetani.length}</span> petani
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
                  onClick={() => requestSort('nik')}
                >
                  <div className="flex items-center">NIK {getSortIcon('nik')}</div>
                </th>
                <th
                  className="cursor-pointer select-none px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant transition-colors hover:bg-surface-container"
                  onClick={() => requestSort('nama')}
                >
                  <div className="flex items-center">Nama Lengkap {getSortIcon('nama')}</div>
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Gender</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">No HP</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Alamat</th>
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
              {paginatedPetani.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center gap-2">
                      <Icon name="search" size={40} className="opacity-20" />
                      <p>Tidak ada data petani yang ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedPetani.map((p) => (
                  <tr
                    key={p.id_petani}
                    className={`transition-colors ${selectedRows.includes(p.id_petani) ? 'bg-primary/5' : 'hover:bg-surface-container'}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 cursor-pointer rounded border-outline-variant text-primary accent-primary focus:ring-primary"
                        checked={selectedRows.includes(p.id_petani)}
                        onChange={() => toggleRow(p.id_petani)}
                      />
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-on-surface-variant">{p.nik}</td>
                    <td className="px-4 py-3 text-sm font-medium text-on-surface">{p.nama}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.jenis_kelamin === 'L' ? 'bg-cyan-100 text-cyan-800' : 'bg-rose-100 text-rose-800'}`}>
                        {p.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">{p.no_hp || '-'}</td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-sm text-on-surface-variant">{p.alamat || '-'}</td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">{formatWaktu(p.created_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => bukaDialogEdit(p)}
                          title="Edit"
                          className="rounded p-1.5 text-primary transition-colors hover:bg-primary/10"
                        >
                          <Icon name="edit" size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={() => hapusPetani(p.id_petani)}
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
        {filteredPetani.length > 0 && (
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
            <DialogTitle className="text-xl">{modeEdit ? 'Ubah Profil Petani' : 'Registrasi Petani Baru'}</DialogTitle>
            <DialogDescription>
              Lengkapi formulir di bawah ini dengan data yang valid.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nik" className="text-right">NIK</Label>
              <Input id="nik" className="col-span-3" value={form.nik} onChange={e => setForm({ ...form, nik: e.target.value })} maxLength={16} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nama" className="text-right">Nama</Label>
              <Input id="nama" className="col-span-3" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Gender</Label>
              <select className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" value={form.jenis_kelamin} onChange={e => setForm({ ...form, jenis_kelamin: e.target.value })}>
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="no_hp" className="text-right">No HP</Label>
              <Input id="no_hp" className="col-span-3" value={form.no_hp} onChange={e => setForm({ ...form, no_hp: e.target.value })} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="alamat" className="text-right">Alamat</Label>
              <Input id="alamat" className="col-span-3" value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogBuka(false)}>Batal</Button>
            <Button onClick={simpan} className="bg-primary">{modeEdit ? 'Simpan Perubahan' : 'Daftarkan Petani'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

DataPetani.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
