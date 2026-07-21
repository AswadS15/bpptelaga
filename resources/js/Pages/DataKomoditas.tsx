import { useState, useMemo, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogFooter } from '@/Components/ui/dialog'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/Components/ui/select'
import Icon from '@/Komponen/Icon'
import TataLetak from '@/Komponen/TataLetak'
import { cn } from '@/lib/utils'

interface KomoditasType {
  id_komoditas: number
  nama_komoditas: string
  kategori: string | null
  icon: string | null
  masa_tanam_bulan: number | null
  target_produktivitas: number | null
  lahan_count: number
  created_at?: string
}

interface Props {
  daftarKomoditas: KomoditasType[]
}

const iconKatalog = ['eco', 'grass', 'nature', 'potted_plant'] as const

const iconStyles: Record<string, { bg: string; color: string }> = {
  agriculture: { bg: 'bg-primary-fixed', color: 'text-primary' },
  grain: { bg: 'bg-secondary-container', color: 'text-secondary-foreground' },
  yard: { bg: 'bg-surface-container', color: 'text-on-surface-variant' },
  spa: { bg: 'bg-surface-container-high', color: 'text-outline' },
  coffee: { bg: 'bg-surface-container-high', color: 'text-on-surface-variant' },
  water_drop: { bg: 'bg-primary-container', color: 'text-primary-foreground' },
  smoking_rooms: { bg: 'bg-surface-container-high', color: 'text-warning' },
  local_fire_department: { bg: 'bg-secondary-container', color: 'text-secondary-foreground' },
  apple: { bg: 'bg-tertiary-container', color: 'text-white' },
  circle: { bg: 'bg-surface-container-high', color: 'text-on-surface-variant' },
  eco: { bg: 'bg-primary-fixed', color: 'text-primary' },
  grass: { bg: 'bg-primary-fixed', color: 'text-primary' },
  nature: { bg: 'bg-tertiary-container', color: 'text-white' },
  potted_plant: { bg: 'bg-primary-fixed', color: 'text-primary' },
}

const commodityIcon = (name: string, storedIcon?: string | null): { icon: string; bg: string; color: string } => {
  if (storedIcon && iconStyles[storedIcon]) {
    return { icon: storedIcon, ...iconStyles[storedIcon] }
  }
  const lower = name.toLowerCase()
  if (lower.includes('padi')) return { icon: 'agriculture', ...iconStyles.agriculture }
  if (lower.includes('jagung')) return { icon: 'grain', ...iconStyles.grain }
  if (lower.includes('kelapa')) return { icon: 'yard', ...iconStyles.yard }
  if (lower.includes('kakao') || lower.includes('coklat')) return { icon: 'nature', ...iconStyles.nature }
  if (lower.includes('cengkeh')) return { icon: 'spa', ...iconStyles.spa }
  if (lower.includes('kopi')) return { icon: 'coffee', ...iconStyles.coffee }
  if (lower.includes('sawit')) return { icon: 'potted_plant', ...iconStyles.potted_plant }
  if (lower.includes('karet')) return { icon: 'water_drop', ...iconStyles.water_drop }
  if (lower.includes('tembakau')) return { icon: 'smoking_rooms', ...iconStyles.smoking_rooms }
  if (lower.includes('tebu')) return { icon: 'grass', ...iconStyles.grass }
  if (lower.includes('cabai') || lower.includes('cabe')) return { icon: 'local_fire_department', ...iconStyles['local_fire_department'] }
  if (lower.includes('bawang')) return { icon: 'circle', ...iconStyles.circle }
  if (lower.includes('kacang')) return { icon: 'eco', ...iconStyles.eco }
  if (lower.includes('buah')) return { icon: 'apple', ...iconStyles.apple }
  return { icon: 'eco', ...iconStyles.eco }
}

const kategoriList = [
  { value: '', label: 'Pilih Kategori' },
  { value: 'pangan', label: 'Pangan' },
  { value: 'palawija', label: 'Palawija' },
  { value: 'hortikultura', label: 'Hortikultura' },
  { value: 'perkebunan', label: 'Perkebunan' },
]

export default function DataKomoditas({ daftarKomoditas }: Props) {
  const [dialogBuka, setDialogBuka] = useState(false)
  const [modeEdit, setModeEdit] = useState(false)
  const [idEdit, setIdEdit] = useState<number | null>(null)
  const [form, setForm] = useState({
    nama_komoditas: '',
    kategori: '',
    icon: 'eco',
    masa_tanam_bulan: '',
    target_produktivitas: '',
  })
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

        switch (sortConfig.key) {
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig, perPage])

  const totalPages = Math.ceil(filteredKomoditas.length / perPage)

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
    if (!sortConfig || sortConfig.key !== key) return <Icon name="swap_vert" size={14} className="opacity-20 ml-1" />;
    return sortConfig.direction === 'asc' ? <Icon name="expand_less" size={14} className="ml-1" /> : <Icon name="expand_more" size={14} className="ml-1" />;
  }

  const bukaDialogTambah = () => {
    setModeEdit(false)
    setIdEdit(null)
    setForm({ nama_komoditas: '', kategori: '', icon: 'eco', masa_tanam_bulan: '', target_produktivitas: '' })
    setDialogBuka(true)
  }

  const bukaDialogEdit = (k: KomoditasType) => {
    setModeEdit(true)
    setIdEdit(k.id_komoditas)
    setForm({
      nama_komoditas: k.nama_komoditas,
      kategori: k.kategori || '',
      icon: k.icon || 'eco',
      masa_tanam_bulan: k.masa_tanam_bulan?.toString() || '',
      target_produktivitas: k.target_produktivitas?.toString() || '',
    })
    setDialogBuka(true)
  }

  const simpan = () => {
    const payload = {
      nama_komoditas: form.nama_komoditas,
      kategori: form.kategori || null,
      icon: form.icon,
      masa_tanam_bulan: form.masa_tanam_bulan ? Number(form.masa_tanam_bulan) : null,
      target_produktivitas: form.target_produktivitas ? Number(form.target_produktivitas) : null,
    }
    if (modeEdit && idEdit) {
      router.put(`/data-komoditas/${idEdit}`, payload, { onSuccess: () => setDialogBuka(false) })
    } else {
      router.post('/data-komoditas', payload, { onSuccess: () => setDialogBuka(false) })
    }
  }

  const hapus = (id: number) => {
    if (confirm('Yakin ingin menghapus komoditas ini?')) {
      router.delete(`/data-komoditas/${id}`)
    }
  }

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(paginatedKomoditas.map(k => k.id_komoditas))
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

  const allChecked = paginatedKomoditas.length > 0 && selectedRows.length === paginatedKomoditas.length

  const formatDate = (date: string) => {
    const d = new Date(date)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('ellipsis')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }
    return pages
  }

  const totalLahan = daftarKomoditas.reduce((sum, k) => sum + k.lahan_count, 0)

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1 text-body-sm text-outline">
        <Icon name="home" size={18} />
        <a className="hover:text-primary transition-colors" href="/beranda">Beranda</a>
        <Icon name="chevron_right" size={18} />
        <span className="text-on-surface-variant font-medium">Data Komoditas</span>
      </nav>

      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="p-6 border-b border-outline-variant">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-headline-sm text-on-surface">Master Komoditas</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">Manajemen data komoditas unggulan di wilayah BPP Telaga.</p>
            </div>
            <div className="flex items-center gap-3">
              {selectedRows.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={bulkHapus}
                  className="animate-in fade-in zoom-in duration-200"
                >
                  <Icon name="delete" size={16} className="mr-2" />
                  Hapus ({selectedRows.length})
                </Button>
              )}
              <Button
                onClick={bukaDialogTambah}
                className="bg-primary hover:bg-primary-container text-white shadow-md active:scale-95 px-6 h-auto py-3"
              >
                <Icon name="add" size={20} className="mr-2" />
                Tambah Komoditas
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-label-md text-outline">Tampilkan</span>
              <select
                className="bg-surface-container-lowest border border-outline-variant rounded-lg px-2 py-1 text-body-sm focus:ring-primary focus:border-primary cursor-pointer"
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-label-md text-outline">data</span>
            </div>
            <div className="text-body-sm text-outline">
              Menampilkan <strong className="text-on-surface">{filteredKomoditas.length}</strong> dari {daftarKomoditas.length} komoditas
            </div>
          </div>
          <div className="relative w-full sm:w-64">
            <Icon name="search" size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <Input
              placeholder="Cari komoditas..."
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-2 text-body-sm focus:ring-primary focus:border-primary transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="p-6 w-12">
                  <input
                    type="checkbox"
                    className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    checked={allChecked}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
                <th
                  className="p-6 text-label-md text-on-surface-variant uppercase tracking-wider cursor-pointer hover:bg-surface-container transition-colors select-none"
                  onClick={() => requestSort('nama_komoditas')}
                >
                  <div className="flex items-center">Nama Komoditas {getSortIcon('nama_komoditas')}</div>
                </th>
                <th className="p-6 text-label-md text-on-surface-variant uppercase tracking-wider">Kategori</th>
                <th
                  className="p-6 text-label-md text-on-surface-variant uppercase tracking-wider text-center cursor-pointer hover:bg-surface-container transition-colors select-none"
                  onClick={() => requestSort('jumlah')}
                >
                  <div className="flex items-center justify-center">Utilisasi Lahan {getSortIcon('jumlah')}</div>
                </th>
                <th className="p-6 text-label-md text-on-surface-variant uppercase tracking-wider text-center">Produktivitas</th>
                <th
                  className="p-6 text-label-md text-on-surface-variant uppercase tracking-wider text-center cursor-pointer hover:bg-surface-container transition-colors select-none"
                  onClick={() => requestSort('waktu')}
                >
                  <div className="flex items-center justify-center">Waktu Pembaruan {getSortIcon('waktu')}</div>
                </th>
                <th className="p-6 text-label-md text-on-surface-variant uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {paginatedKomoditas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center gap-2">
                      <Icon name="eco" size={40} className="opacity-20" />
                      <p>Belum ada data komoditas.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedKomoditas.map((k) => {
                  const ic = commodityIcon(k.nama_komoditas, k.icon)
                  const checked = selectedRows.includes(k.id_komoditas)
                  const kategoriLabel = kategoriList.find(kat => kat.value === k.kategori)?.label || '-'
                  return (
                    <tr
                      key={k.id_komoditas}
                      className={cn(
                        'hover:bg-surface-container-low transition-colors group',
                        checked && 'bg-primary/5'
                      )}
                    >
                      <td className="p-6">
                        <input
                          type="checkbox"
                          className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                          checked={checked}
                          onChange={() => toggleRow(k.id_komoditas)}
                        />
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center shrink-0', ic.bg, ic.color)}>
                            <Icon name={ic.icon} size={20} fill />
                          </div>
                          <div>
                            <span className="text-title-lg text-on-surface block">{k.nama_komoditas}</span>
                            {k.masa_tanam_bulan && (
                              <span className="text-label-sm text-outline">{k.masa_tanam_bulan} bln masa tanam</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="text-body-sm text-on-surface-variant">{kategoriLabel}</span>
                      </td>
                      <td className="p-6 text-center">
                        <div className="inline-flex items-center gap-1 px-2 py-1 bg-on-primary-container text-on-primary-fixed-variant rounded-full text-label-sm">
                          <Icon name="landscape" size={14} fill className="shrink-0" />
                          {k.lahan_count.toLocaleString('id-ID')} Lahan
                        </div>
                      </td>
                      <td className="p-6 text-center">
                        <span className="text-body-sm text-on-surface-variant">
                          {k.target_produktivitas ? `${k.target_produktivitas} T/Ha` : '-'}
                        </span>
                      </td>
                      <td className="p-6 text-center">
                        <div className="text-body-sm text-outline">
                          {k.created_at ? formatDate(k.created_at) : 'Baru'}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            className="p-2 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-all"
                            title="Edit"
                            onClick={() => bukaDialogEdit(k)}
                          >
                            <Icon name="edit" size={18} />
                          </button>
                          <button
                            className="p-2 text-error hover:bg-error-container rounded-lg transition-all"
                            title="Hapus"
                            onClick={() => hapus(k.id_komoditas)}
                          >
                            <Icon name="delete" size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {filteredKomoditas.length > 0 && (
          <div className="p-6 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-body-sm text-outline">
              Menampilkan {(currentPage - 1) * perPage + 1} sampai {Math.min(currentPage * perPage, filteredKomoditas.length)} dari {filteredKomoditas.length} entri
            </span>
            <div className="flex items-center gap-1">
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-outline hover:bg-surface-container transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                <Icon name="chevron_left" size={18} />
              </button>
              {getPageNumbers().map((page, idx) =>
                page === 'ellipsis' ? (
                  <span key={`e-${idx}`} className="mx-1 text-outline">...</span>
                ) : (
                  <button
                    key={page}
                    className={cn(
                      'w-10 h-10 flex items-center justify-center rounded-lg font-label-md transition-all',
                      page === currentPage
                        ? 'bg-primary text-white shadow-sm'
                        : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                    )}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-outline-variant text-outline hover:bg-surface-container transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                <Icon name="chevron_right" size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Icon name="bar_chart" size={32} />
          </div>
          <div>
            <p className="text-label-md text-outline">Total Utilisasi Lahan</p>
            <p className="text-headline-sm font-bold text-on-surface">{totalLahan.toLocaleString('id-ID')} Lahan</p>
            <p className="text-label-sm text-primary flex items-center gap-1 mt-0.5">
              <Icon name="trending_up" size={14} /> {daftarKomoditas.length} komoditas
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary shrink-0">
            <Icon name="inventory_2" size={32} />
          </div>
          <div>
            <p className="text-label-md text-outline">Jenis Komoditas</p>
            <p className="text-headline-sm font-bold text-on-surface">{daftarKomoditas.length} Spesies</p>
            <p className="text-label-sm text-secondary flex items-center gap-1 mt-0.5">
              <Icon name="horizontal_rule" size={14} /> Tetap
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary-container shrink-0">
            <Icon name="groups_2" size={32} />
          </div>
          <div>
            <p className="text-label-md text-outline">Data Tersaji</p>
            <p className="text-headline-sm font-bold text-on-surface">{daftarKomoditas.length} Baris</p>
            <p className="text-label-sm text-primary flex items-center gap-1 mt-0.5">
              <Icon name="check_circle" size={14} /> Siap diakses
            </p>
          </div>
        </div>
      </div>

      <Dialog open={dialogBuka} onOpenChange={setDialogBuka}>
        <DialogContent className="sm:max-w-[480px] !gap-0 !p-0 overflow-hidden rounded-xl border-outline shadow-[0px_4px_20px_rgba(0,0,0,0.1)] [&>button.absolute]:hidden">
          <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Icon name="eco" size={20} fill />
              </div>
              <DialogTitle className="text-headline-sm m-0">{modeEdit ? 'Ubah Komoditas' : 'Tambah Komoditas'}</DialogTitle>
            </div>
            <DialogClose className="p-2 hover:bg-surface-container-highest rounded-full transition-colors cursor-pointer">
              <Icon name="close" size={20} className="text-on-surface-variant" />
            </DialogClose>
          </div>

          <div className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-label-md text-on-surface-variant" htmlFor="nama_komoditas">
                Nama Komoditas <span className="text-error">*</span>
              </label>
              <input
                id="nama_komoditas"
                className="w-full h-12 px-6 border border-outline rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline-variant text-body-sm bg-surface-container-lowest"
                placeholder="Cth: Padi Sawah"
                value={form.nama_komoditas}
                onChange={e => setForm({ ...form, nama_komoditas: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-label-md text-on-surface-variant">Kategori</label>
              <Select
                value={form.kategori}
                onValueChange={val => setForm({ ...form, kategori: val })}
              >
                <SelectTrigger className="w-full h-12 px-6 border border-outline rounded-xl text-body-sm bg-surface-container-lowest [&>svg]:text-on-surface-variant [&>svg]:right-4 [&>svg]:h-5 [&>svg]:w-5">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {kategoriList.map(kat => (
                    <SelectItem key={kat.value} value={kat.value} disabled={kat.value === ''}>{kat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-label-md text-on-surface-variant">Pilih Ikon</label>
              <div className="grid grid-cols-4 gap-4">
                {iconKatalog.map(ico => (
                  <label key={ico} className="cursor-pointer">
                    <input
                      type="radio"
                      name="icon-choice"
                      className="hidden peer"
                      checked={form.icon === ico}
                      onChange={() => setForm({ ...form, icon: ico })}
                    />
                    <div className={cn(
                      'w-full aspect-square border border-outline-variant rounded-xl flex items-center justify-center transition-all hover:bg-surface-container',
                      form.icon === ico && 'bg-primary-fixed border-primary'
                    )}>
                      <Icon name={ico} size={24} />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-label-md text-on-surface-variant" htmlFor="masa_tanam">Masa Tanam (Bulan)</label>
                <input
                  id="masa_tanam"
                  type="number"
                  min="1"
                  max="12"
                  className="w-full h-12 px-6 border border-outline rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-body-sm bg-surface-container-lowest"
                  placeholder="3"
                  value={form.masa_tanam_bulan}
                  onChange={e => setForm({ ...form, masa_tanam_bulan: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-label-md text-on-surface-variant" htmlFor="produktivitas">Target Produktivitas</label>
                <div className="relative">
                  <input
                    id="produktivitas"
                    type="text"
                    className="w-full h-12 px-6 border border-outline rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all pr-14 text-body-sm bg-surface-container-lowest"
                    placeholder="5.5"
                    value={form.target_produktivitas}
                    onChange={e => setForm({ ...form, target_produktivitas: e.target.value })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-label-md text-outline">T/Ha</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-outline-variant bg-surface-container-low flex-row-reverse sm:flex-row sm:justify-end gap-3">
            <Button
              onClick={simpan}
              className="bg-primary hover:bg-primary-container text-white shadow-sm active:scale-95"
            >
              {modeEdit ? 'Simpan Perubahan' : 'Simpan Data'}
            </Button>
            <Button variant="outline" onClick={() => setDialogBuka(false)} className="border-primary text-primary hover:bg-primary/5">
              Batal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

DataKomoditas.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
