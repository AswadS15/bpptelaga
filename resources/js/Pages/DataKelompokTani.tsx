import { useState, useMemo, useEffect } from 'react'
import { router } from '@inertiajs/react'
import { Link } from '@inertiajs/react'
import Icon from '@/Komponen/Icon'
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

  const totalAnggota = daftarKelompokTani.reduce((sum, k) => sum + k.petani.length, 0)

  const filteredKelompok = useMemo(() => {
    let result = daftarKelompokTani.filter(k =>
      k.nama_kelompok.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.desa.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortConfig.key) {
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig, perPage])

  const paginatedKelompok = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredKelompok.slice(start, start + perPage);
  }, [filteredKelompok, currentPage, perPage]);

  const totalPages = Math.ceil(filteredKelompok.length / perPage)

  const requestSort = (key: 'nama_kelompok' | 'desa' | 'jumlah' | 'waktu') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  const getSortIcon = (key: 'nama_kelompok' | 'desa' | 'jumlah' | 'waktu') => {
    if (!sortConfig || sortConfig.key !== key) return <Icon name="swap_vert" size={14} className="ml-1 opacity-20" />;
    return sortConfig.direction === 'asc' ? <Icon name="expand_less" size={14} className="ml-1" /> : <Icon name="expand_more" size={14} className="ml-1" />;
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
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1 text-body-sm text-outline">
        <Link href="/beranda" className="hover:text-primary transition-colors flex items-center gap-1">
          <Icon name="home" size={18} />
          Beranda
        </Link>
        <Icon name="chevron_right" size={18} />
        <span className="text-on-surface-variant font-medium">Data Kelompok Tani</span>
      </nav>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[32px]">groups</span>
          </div>
          <div>
            <p className="text-label-md text-outline font-label-md">Total Kelompok</p>
            <p className="text-headline-sm font-bold text-on-surface">{daftarKelompokTani.length}</p>
            <p className="text-label-sm font-label-sm text-primary flex items-center gap-1">
              <Icon name="trending_up" size={14} /> Aktif
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-secondary-container/10 flex items-center justify-center text-secondary shrink-0">
            <span className="material-symbols-outlined text-[32px]">person</span>
          </div>
          <div>
            <p className="text-label-md text-outline font-label-md">Total Anggota</p>
            <p className="text-headline-sm font-bold text-on-surface">{totalAnggota} Orang</p>
            <p className="text-label-sm font-label-sm text-secondary flex items-center gap-1">
              <Icon name="horizontal_rule" size={14} /> Terdaftar
            </p>
          </div>
        </div>
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary shrink-0">
            <span className="material-symbols-outlined text-[32px]">landscape</span>
          </div>
          <div>
            <p className="text-label-md text-outline font-label-md">Wilayah Tersebar</p>
            <p className="text-headline-sm font-bold text-on-surface">{new Set(daftarKelompokTani.map(k => k.desa)).size} Desa</p>
            <p className="text-label-sm font-label-sm text-primary flex items-center gap-1">
              <Icon name="trending_up" size={14} /> BPP Telaga
            </p>
          </div>
        </div>
      </div>

      {/* Master Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        {/* Card Header */}
        <div className="p-4 border-b border-outline-variant">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Master Kelompok Tani</h3>
              <p className="text-body-sm text-on-surface-variant">Kelola kelompok tani dan keanggotaan di wilayah BPP Telaga.</p>
            </div>
            <button
              onClick={bukaDialogTambah}
              className="bg-primary hover:bg-primary-container text-white px-4 py-2.5 rounded-lg font-label-md text-label-md flex items-center gap-2 transition-all shadow-md active:scale-95"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Tambah Kelompok
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-3 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1.5">
              <span className="text-label-md text-outline font-label-md">Tampilkan</span>
              <select
                className="bg-surface-container-lowest border border-outline-variant rounded-lg px-2.5 py-1.5 text-body-sm focus:ring-primary focus:border-primary"
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-label-md text-outline font-label-md">data</span>
            </div>
            {selectedRows.length > 0 && (
              <button
                onClick={bulkHapus}
                className="px-2.5 py-1.5 rounded-lg bg-error-container text-error font-label-md text-label-md flex items-center gap-1.5 hover:bg-error hover:text-on-error transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Hapus ({selectedRows.length})
              </button>
            )}
          </div>
          <div className="relative w-full sm:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-3 py-2 text-body-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="Cari kelompok atau desa..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant">
              <tr>
                <th className="p-3 w-12">
                  <input
                    type="checkbox"
                    className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    checked={paginatedKelompok.length > 0 && selectedRows.length === filteredKelompok.length}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </th>
                <th
                  className="p-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider cursor-pointer hover:bg-surface-container-highest transition-colors select-none"
                  onClick={() => requestSort('nama_kelompok')}
                >
                  <div className="flex items-center gap-1">
                    Nama Kelompok {getSortIcon('nama_kelompok')}
                  </div>
                </th>
                <th
                  className="p-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider cursor-pointer hover:bg-surface-container-highest transition-colors select-none"
                  onClick={() => requestSort('desa')}
                >
                  <div className="flex items-center gap-1">
                    Desa {getSortIcon('desa')}
                  </div>
                </th>
                <th
                  className="p-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center cursor-pointer hover:bg-surface-container-highest transition-colors select-none"
                  onClick={() => requestSort('jumlah')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Jumlah Anggota {getSortIcon('jumlah')}
                  </div>
                </th>
                <th
                  className="p-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center cursor-pointer hover:bg-surface-container-highest transition-colors select-none"
                  onClick={() => requestSort('waktu')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Waktu {getSortIcon('waktu')}
                  </div>
                </th>
                <th className="p-3 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {paginatedKelompok.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center">
                    <div className="flex flex-col items-center gap-2 py-8">
                      <Icon name="groups" size={40} className="opacity-20 text-outline" />
                      <p className="text-body-sm text-on-surface-variant">Belum ada data kelompok tani.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedKelompok.map((k) => (
                  <tr
                    key={k.id_kelompok}
                    className={`hover:bg-surface-container-low transition-colors group ${selectedRows.includes(k.id_kelompok) ? 'bg-primary/5' : ''}`}
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        className="rounded border-outline-variant text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                        checked={selectedRows.includes(k.id_kelompok)}
                        onChange={() => toggleRow(k.id_kelompok)}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-fixed/30 flex items-center justify-center text-primary shrink-0">
                          <span className="material-symbols-outlined">groups</span>
                        </div>
                        <span className="font-title-lg text-title-lg text-on-surface">{k.nama_kelompok}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="text-body-sm text-on-surface-variant">{k.desa}</span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-on-primary-container/20 text-on-primary-fixed-variant rounded-full text-label-sm font-label-sm">
                        <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                        {k.petani.length} Anggota
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <div className="text-body-sm text-outline">
                        {k.created_at ? new Date(k.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru'}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => bukaDialogEdit(k)}
                          className="p-1.5 text-on-surface-variant hover:bg-surface-container-highest rounded-lg transition-all"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          onClick={() => hapus(k.id_kelompok)}
                          className="p-1.5 text-error hover:bg-error-container rounded-lg transition-all"
                          title="Hapus"
                        >
                          <span className="material-symbols-outlined">delete</span>
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
        {filteredKelompok.length > 0 && (
          <div className="p-4 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-body-sm text-outline">
              Menampilkan {(currentPage - 1) * perPage + 1} sampai {Math.min(currentPage * perPage, filteredKelompok.length)} dari {filteredKelompok.length} entri
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant text-outline hover:bg-surface-container transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .map((p, idx, arr) => (
                  <span key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="mx-0.5 text-outline text-body-sm">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(p)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg font-label-md text-label-md transition-all ${
                        currentPage === p
                          ? 'bg-primary text-white shadow-sm'
                          : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {p}
                    </button>
                  </span>
                ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-outline-variant text-outline hover:bg-surface-container transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {dialogBuka && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-outline-variant flex items-center justify-between">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {modeEdit ? 'Ubah Kelompok Tani' : 'Tambah Kelompok Baru'}
              </h3>
              <button
                onClick={() => setDialogBuka(false)}
                className="p-1.5 hover:bg-surface-container rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-label-md font-label-md text-on-surface-variant" htmlFor="nama">
                  Nama Kelompok
                </label>
                <input
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-body-md"
                  id="nama"
                  placeholder="Contoh: Tani Makmur"
                  type="text"
                  value={form.nama_kelompok}
                  onChange={e => setForm({ ...form, nama_kelompok: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-label-md font-label-md text-on-surface-variant" htmlFor="desa">
                  Desa
                </label>
                <input
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-body-md"
                  id="desa"
                  placeholder="Contoh: Desa Luhu"
                  type="text"
                  value={form.desa}
                  onChange={e => setForm({ ...form, desa: e.target.value })}
                />
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                <p className="text-body-sm text-on-surface-variant">
                  Data kelompok tani akan digunakan untuk analisis sebaran dan keanggotaan pada peta tematik.
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-outline-variant bg-surface-container-low flex justify-end gap-3">
              <button
                onClick={() => setDialogBuka(false)}
                className="px-4 py-2.5 rounded-lg border border-outline-variant text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high transition-colors active:scale-95"
              >
                Batal
              </button>
              <button
                onClick={simpan}
                className="px-4 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-white font-label-md text-label-md shadow-md transition-all active:scale-95"
              >
                {modeEdit ? 'Simpan Perubahan' : 'Tambah Kelompok'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

DataKelompokTani.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
