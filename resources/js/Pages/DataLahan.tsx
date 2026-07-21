import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { router } from '@inertiajs/react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import {
  Dialog, DialogContent, DialogTitle,
} from '@/Components/ui/dialog'
import Icon from '@/Komponen/Icon'
import TataLetak from '@/Komponen/TataLetak'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface TitikKoordinat { titik: number; lat: number; lng: number }

interface LahanType {
  id_lahan: number
  id_petani: number
  luas: number
  koordinat: any
  titik_koordinat: TitikKoordinat[] | null
  fase_tanam: string
  petani: { id_petani: number; nama: string }
  komoditas: { id_komoditas: number; nama_komoditas: string }[]
  created_at?: string
}

interface Props {
  daftarLahan: LahanType[]
  daftarPetani: { id_petani: number; nama: string }[]
  daftarKomoditas: { id_komoditas: number; nama_komoditas: string }[]
}

function ModalPeta({
  buka, koordinatAwal, onSelesai, onTutup,
}: {
  buka: boolean
  koordinatAwal: any
  onSelesai: (geoJSON: any, luasHa: string) => void
  onTutup: () => void
}) {
  const modeEdit = !!koordinatAwal
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const drawnItemsRef = useRef<L.FeatureGroup | null>(null)
  const [drawnGeoJSON, setDrawnGeoJSON] = useState<any>(null)
  const [luasSementara, setLuasSementara] = useState<string>('')
  const [sudahDigambarUlang, setSudahDigambarUlang] = useState(false)

  useEffect(() => {
    if (!buka) {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null }
      drawnItemsRef.current = null
      setDrawnGeoJSON(null)
      setLuasSementara('')
      setSudahDigambarUlang(false)
      return
    }

    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return

      const map = L.map(mapContainerRef.current, { zoomControl: true }).setView([0.612, 122.958], 15)
      mapRef.current = map

      L.tileLayer('https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '&copy; Google', maxZoom: 22,
      }).addTo(map)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OSM', opacity: 0.4, maxZoom: 22,
      }).addTo(map)

      const drawnItems = new L.FeatureGroup()
      drawnItemsRef.current = drawnItems
      drawnItems.addTo(map)

      const drawControl = new L.Control.Draw({
        position: 'topright',
        edit: { featureGroup: drawnItems },
        draw: {
          polygon: {
            allowIntersection: false,
            shapeOptions: { color: '#2563eb', weight: 2, fillOpacity: 0.25 },
          } as any,
          polyline: false, circle: false, rectangle: false, marker: false, circlemarker: false,
        },
      })
      map.addControl(drawControl)

      map.on(L.Draw.Event.CREATED, (e: any) => {
        const layer = e.layer
        drawnItems.clearLayers()
        drawnItems.addLayer(layer)

        const latlngs = layer.getLatLngs()[0] as L.LatLng[]
        const areaSqm = L.GeometryUtil.geodesicArea(latlngs)
        const areaHa = (areaSqm / 10000).toFixed(4)

        const coords = latlngs.map((ll) => [ll.lng, ll.lat])
        coords.push([latlngs[0].lng, latlngs[0].lat])

        const geoJSON = {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [coords] },
          properties: { luas_ha: areaHa },
        }
        setDrawnGeoJSON(geoJSON)
        setLuasSementara(areaHa)
        setSudahDigambarUlang(true)
      })

      if (koordinatAwal) {
        try {
          const ghostLayer = L.geoJSON(koordinatAwal, {
            style: {
              color: '#ef4444',
              weight: 2,
              fillOpacity: 0.08,
              dashArray: '6, 5',
              opacity: 0.7,
            },
          }).addTo(map)

          map.fitBounds(ghostLayer.getBounds(), { padding: [40, 40] })

          const coords = koordinatAwal?.geometry?.coordinates?.[0]
          if (coords) {
            const ll = coords.slice(0, -1).map((c: number[]) => L.latLng(c[1], c[0]))
            const areaSqm = L.GeometryUtil.geodesicArea(ll)
            setLuasSementara((areaSqm / 10000).toFixed(4))
          }

          setTimeout(() => {
            const polygonDrawer = new ((L as any).Draw.Polygon)(map, {
              allowIntersection: false,
              shapeOptions: { color: '#2563eb', weight: 2, fillOpacity: 0.25 },
            })
            polygonDrawer.enable()
          }, 200)
        } catch (_) {}
      } else {
        navigator.geolocation?.getCurrentPosition((p) => {
          map.setView([p.coords.latitude, p.coords.longitude], 17)
        })
      }

      setTimeout(() => map.invalidateSize(), 100)
    }, 80)

    return () => clearTimeout(timer)
  }, [buka])

  if (!buka) return null

  const bolehSimpan = modeEdit ? sudahDigambarUlang : !!drawnGeoJSON
  const geoJSONUntukSimpan = drawnGeoJSON

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white shadow-md">
        <div className="flex items-center gap-2">
          <Icon name="map" size={18} className="text-primary" />
          <span className="font-semibold text-sm">
            {modeEdit ? 'Edit Titik Koordinat Lahan' : 'Gambar Lahan di Peta Satelit'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {luasSementara && (
            <span className="text-xs bg-primary px-3 py-1 rounded-full font-medium">
              Luas: <strong>{luasSementara} Ha</strong>
            </span>
          )}
          <button onClick={onTutup} className="text-slate-400 hover:text-white transition-colors">
            <Icon name="close" size={20} />
          </button>
        </div>
      </div>

      {modeEdit ? (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
          <Icon name="edit" size={14} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800">
            <strong>Mode Edit:</strong> Shape lama ditampilkan sebagai garis putus-putus merah sebagai referensi.
            Gambarlah shape baru di atasnya → klik titik pertama untuk menutup → klik <strong>Simpan</strong>.
          </p>
        </div>
      ) : (
        <div className="bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-center gap-2">
          <Icon name="landscape" size={14} className="text-primary shrink-0" />
          <p className="text-xs text-foreground">
            Klik ikon <strong>poligon</strong> di kanan atas peta → klik titik-titik batas lahan (tidak terbatas) → klik titik pertama untuk menutup poligon.
          </p>
        </div>
      )}

      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="absolute inset-0" />
      </div>

      <div className="px-4 py-3 bg-white border-t flex items-center justify-between gap-3 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
        <div className="text-xs text-slate-500">
          {modeEdit ? (
            sudahDigambarUlang ? (
              <span className="text-green-600 font-medium flex items-center gap-1">
                <Icon name="check_circle" size={14} /> Shape baru siap disimpan — luas <strong>{luasSementara} Ha</strong>
              </span>
            ) : (
              <span className="text-amber-600 font-medium">
                Gambarlah shape baru di atas referensi (garis merah) untuk menggantikan shape lama.
              </span>
            )
          ) : (
            drawnGeoJSON ? (
              <span className="text-green-600 font-medium flex items-center gap-1">
                <Icon name="check_circle" size={14} /> Poligon tersimpan — luas <strong>{luasSementara} Ha</strong>
              </span>
            ) : 'Belum ada poligon yang digambar.'
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onTutup} size="sm">Batal</Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white flex gap-2"
            disabled={!bolehSimpan}
            onClick={() => onSelesai(geoJSONUntukSimpan, luasSementara)}
          >
            <Icon name="check_circle" size={16} /> {modeEdit ? 'Simpan Perubahan' : 'Selesai & Simpan Koordinat'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function DataLahan({ daftarLahan, daftarPetani, daftarKomoditas }: Props) {
  const [dialogBuka, setDialogBuka] = useState(false)
  const [modalPetaBuka, setModalPetaBuka] = useState(false)
  const [modeEdit, setModeEdit] = useState(false)
  const [idEdit, setIdEdit] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [form, setForm] = useState({
    id_petani: '', luas: '', komoditas: [] as number[],
    fase_tanam: 'belum_tanam', koordinat: null as any,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [sortConfig, setSortConfig] = useState<{ key: 'pemilik' | 'luas' | 'waktu' | 'komoditas', direction: 'asc' | 'desc' } | null>(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const filteredLahan = useMemo(() => {
    let result = daftarLahan.filter(l =>
      l.petani?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.komoditas.some(k => k.nama_komoditas.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch(sortConfig.key) {
          case 'pemilik':
            aValue = a.petani?.nama || '';
            bValue = b.petani?.nama || '';
            break;
          case 'luas':
            aValue = Number(a.luas);
            bValue = Number(b.luas);
            break;
          case 'waktu':
            aValue = a.id_lahan;
            bValue = b.id_lahan;
            break;
          case 'komoditas':
            aValue = a.komoditas.length > 0 ? a.komoditas[0].nama_komoditas : '';
            bValue = b.komoditas.length > 0 ? b.komoditas[0].nama_komoditas : '';
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
  }, [daftarLahan, searchTerm, sortConfig])

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortConfig, perPage])

  const paginatedLahan = useMemo(() => {
    const start = (currentPage - 1) * perPage;
    return filteredLahan.slice(start, start + perPage);
  }, [filteredLahan, currentPage, perPage]);

  const totalPages = Math.ceil(filteredLahan.length / perPage);

  const requestSort = (key: 'pemilik' | 'luas' | 'waktu' | 'komoditas') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  }

  const getSortIcon = (key: 'pemilik' | 'luas' | 'waktu' | 'komoditas') => {
    if (!sortConfig || sortConfig.key !== key) return <Icon name="swap_vert" size={14} className="ml-1 opacity-20" />;
    return sortConfig.direction === 'asc' ? <Icon name="expand_less" size={14} className="ml-1" /> : <Icon name="expand_more" size={14} className="ml-1" />;
  }

  const bukaDialogTambah = () => {
    setModeEdit(false); setIdEdit(null)
    setForm({ id_petani: '', luas: '', komoditas: [], fase_tanam: 'belum_tanam', koordinat: null })
    setDialogBuka(true)
  }

  const bukaDialogEdit = (l: LahanType) => {
    setModeEdit(true); setIdEdit(l.id_lahan)
    setForm({
      id_petani: String(l.id_petani), luas: String(l.luas),
      komoditas: l.komoditas.map(k => k.id_komoditas),
      fase_tanam: l.fase_tanam || 'belum_tanam', koordinat: l.koordinat ?? null,
    })
    setDialogBuka(true)
  }

  const bukaPeta = () => {
    setDialogBuka(false)
    setTimeout(() => setModalPetaBuka(true), 150)
  }

  const handleSelesaiGambar = useCallback((geoJSON: any, luasHa: string) => {
    setForm(prev => ({ ...prev, koordinat: geoJSON, luas: luasHa }))
    setModalPetaBuka(false)
    setTimeout(() => setDialogBuka(true), 150)
  }, [])

  const handleBatalPeta = useCallback(() => {
    setModalPetaBuka(false)
    setTimeout(() => setDialogBuka(true), 150)
  }, [])

  const simpan = () => {
    const payload = {
      id_petani: Number(form.id_petani), luas: Number(form.luas),
      komoditas: form.komoditas, fase_tanam: form.fase_tanam, koordinat: form.koordinat,
    }
    if (modeEdit && idEdit) {
      router.put(`/data-lahan/${idEdit}`, payload, { onSuccess: () => setDialogBuka(false) })
    } else {
      router.post('/data-lahan', payload, { onSuccess: () => setDialogBuka(false) })
    }
  }

  const hapusLahan = (id: number) => {
    if (confirm('Yakin ingin menghapus data lahan ini?')) router.delete(`/data-lahan/${id}`)
  }

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredLahan.map(l => l.id_lahan))
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
    if (confirm(`Yakin ingin menghapus ${selectedRows.length} data lahan yang dipilih?`)) {
      router.post('/data-lahan/bulk-destroy', { ids: selectedRows }, {
        onSuccess: () => setSelectedRows([])
      })
    }
  }

  const toggleKomoditas = (id: number) =>
    setForm(prev => ({
      ...prev,
      komoditas: prev.komoditas.includes(id)
        ? prev.komoditas.filter(k => k !== id)
        : [...prev.komoditas, id],
    }))

  // Pagination page numbers
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('ellipsis')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="space-y-6">
      <ModalPeta
        buka={modalPetaBuka}
        koordinatAwal={form.koordinat}
        onSelesai={handleSelesaiGambar}
        onTutup={handleBatalPeta}
      />

      {/* Page Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-10 tracking-tight text-on-surface">
            Inventaris Lahan Pertanian
          </h1>
          <p className="mt-1 text-base text-on-surface-variant">
            Kelola data spasial dan informasi komoditas lahan di wilayah BPP Telaga.
          </p>
        </div>
        <button
          onClick={bukaDialogTambah}
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all active:scale-95 hover:bg-primary-container"
        >
          <Icon name="add" size={20} />
          + Tambah Lahan
        </button>
      </div>

      {/* Table Card */}
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-4 border-b border-outline-variant bg-surface-container-low/30 px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="relative w-72">
              <Icon name="search" size={18} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline" />
              <Input
                placeholder="Cari pemilik atau komoditas..."
                className="h-9 rounded-lg border-outline-variant bg-surface-container-lowest pl-9 text-sm focus:border-primary focus:ring-2 focus:ring-primary"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold tracking-wide text-outline">Tampilkan</span>
              <select
                className="rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 py-1.5 text-xs font-semibold focus:ring-primary"
                value={perPage}
                onChange={(e) => setPerPage(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            {selectedRows.length > 0 && (
              <button
                onClick={bulkHapus}
                className="flex items-center gap-1.5 rounded-lg bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                <Icon name="delete" size={16} />
                Hapus ({selectedRows.length})
              </button>
            )}
          </div>

          <p className="text-xs font-semibold text-on-surface-variant">
            Menampilkan <span className="font-bold">{filteredLahan.length}</span> dari{' '}
            <span className="font-bold text-primary">{daftarLahan.length}</span> lahan
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-outline-variant bg-surface-container-low">
                <TableHead className="w-12 p-3">
                  <input
                    type="checkbox"
                    className="rounded border-outline-variant text-primary focus:ring-primary"
                    checked={paginatedLahan.length > 0 && selectedRows.length === filteredLahan.length}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </TableHead>
                <TableHead
                  className="p-3 text-xs font-semibold uppercase tracking-wider text-outline cursor-pointer select-none hover:bg-surface-container transition-colors"
                  onClick={() => requestSort('pemilik')}
                >
                  <div className="flex items-center gap-1">
                    Nama Pemilik
                    {getSortIcon('pemilik')}
                  </div>
                </TableHead>
                <TableHead
                  className="p-3 text-xs font-semibold uppercase tracking-wider text-outline cursor-pointer select-none hover:bg-surface-container transition-colors"
                  onClick={() => requestSort('komoditas')}
                >
                  <div className="flex items-center gap-1">
                    Komoditas
                    {getSortIcon('komoditas')}
                  </div>
                </TableHead>
                <TableHead
                  className="p-3 text-xs font-semibold uppercase tracking-wider text-outline text-center cursor-pointer select-none hover:bg-surface-container transition-colors"
                  onClick={() => requestSort('luas')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Luas (Ha)
                    {getSortIcon('luas')}
                  </div>
                </TableHead>
                <TableHead className="p-3 text-xs font-semibold uppercase tracking-wider text-outline">
                  Status Spasial
                </TableHead>
                <TableHead
                  className="p-3 text-xs font-semibold uppercase tracking-wider text-outline text-center cursor-pointer select-none hover:bg-surface-container transition-colors"
                  onClick={() => requestSort('waktu')}
                >
                  <div className="flex items-center justify-center gap-1">
                    Waktu
                    {getSortIcon('waktu')}
                  </div>
                </TableHead>
                <TableHead className="p-3 text-xs font-semibold uppercase tracking-wider text-outline">
                  Titik Koordinat
                </TableHead>
                <TableHead className="p-3 text-xs font-semibold uppercase tracking-wider text-outline text-right">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLahan.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-16 text-center text-on-surface-variant">
                    <div className="flex flex-col items-center gap-2">
                      <Icon name="map" size={40} className="opacity-20" />
                      <p className="text-sm">Tidak ada data lahan yang ditemukan.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLahan.map(l => (
                  <TableRow
                    key={l.id_lahan}
                    className={`border-b border-outline-variant transition-colors ${
                      selectedRows.includes(l.id_lahan)
                        ? 'bg-primary/5 border-l-4 border-l-primary'
                        : 'hover:bg-surface-container-low/50'
                    }`}
                  >
                    <TableCell className="p-3">
                      <input
                        type="checkbox"
                        className="rounded border-outline-variant text-primary focus:ring-primary"
                        checked={selectedRows.includes(l.id_lahan)}
                        onChange={() => toggleRow(l.id_lahan)}
                      />
                    </TableCell>
                    <TableCell className="p-3 text-base font-semibold text-on-surface">
                      {l.petani?.nama || '-'}
                    </TableCell>
                    <TableCell className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        {l.komoditas.length > 0 ? (
                          l.komoditas.map(k => (
                            <span
                              key={k.id_komoditas}
                              className="rounded-full bg-primary-container/20 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                            >
                              {k.nama_komoditas}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs italic text-outline">Belum ditentukan</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="p-3 text-center text-base font-medium text-on-surface">
                      {l.luas}
                    </TableCell>
                    <TableCell className="p-3">
                      {l.koordinat ? (
                        <div className="flex w-fit items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-medium text-green-800">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                          Terpetakan
                        </div>
                      ) : (
                        <div className="flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-800">
                          <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Non-Spasial
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="p-3 text-center text-sm text-outline">
                      {l.created_at ? new Date(l.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru'}
                    </TableCell>
                    <TableCell className="p-3">
                      {l.titik_koordinat && l.titik_koordinat.length > 0 ? (
                        <button
                          onClick={() => setExpandedId(expandedId === l.id_lahan ? null : l.id_lahan)}
                          className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                            expandedId === l.id_lahan
                              ? 'border-primary/30 bg-primary/10 text-primary'
                              : 'border-outline-variant text-on-surface-variant hover:bg-surface-container'
                          }`}
                        >
                          <Icon name="pin_drop" size={16} />
                          {l.titik_koordinat.length} titik
                        </button>
                      ) : (
                        <span className="text-xs italic text-outline">Belum ada titik</span>
                      )}
                    </TableCell>
                    <TableCell className="p-3 text-right">
                      <div className="flex justify-end gap-0.5">
                        <button
                          className="rounded-md p-1.5 text-primary transition-colors hover:bg-primary/10"
                          title="Edit"
                          onClick={() => bukaDialogEdit(l)}
                        >
                          <Icon name="edit" size={20} />
                        </button>
                        <button
                          className="rounded-md p-1.5 text-error transition-colors hover:bg-error/10"
                          title="Hapus"
                          onClick={() => hapusLahan(l.id_lahan)}
                        >
                          <Icon name="delete" size={20} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}

              {/* Expanded rows for coordinate details */}
              {paginatedLahan.map(l =>
                expandedId === l.id_lahan && l.titik_koordinat && l.titik_koordinat.length > 0 && (
                  <TableRow key={`exp-${l.id_lahan}`} className="bg-surface-container-lowest/80">
                    <TableCell colSpan={8} className="p-0">
                      <div className="border-t border-primary/20 px-6 py-4">
                        <p className="mb-3 text-[11px] font-semibold text-outline">
                          Titik Koordinat Lahan —{' '}
                          <span className="text-primary">{l.petani?.nama}</span>
                          &nbsp;({l.titik_koordinat.length} titik)
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {l.titik_koordinat.map(t => (
                            <div
                              key={t.titik}
                              className="min-w-[140px] rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-xs"
                            >
                              <div className="mb-1 font-bold text-primary">Titik {t.titik}</div>
                              <div className="text-on-surface-variant">
                                <span className="font-medium text-on-surface">Lat:</span>&nbsp;{t.lat.toFixed(8)}
                              </div>
                              <div className="text-on-surface-variant">
                                <span className="font-medium text-on-surface">Lng:</span>&nbsp;{t.lng.toFixed(8)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredLahan.length > 0 && (
          <div className="flex items-center justify-between border-t border-outline-variant bg-surface-container-low/30 px-4 py-3">
            <p className="text-xs text-on-surface-variant">
              Menampilkan {(currentPage - 1) * perPage + 1} - {Math.min(currentPage * perPage, filteredLahan.length)} dari {filteredLahan.length} data
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold text-outline transition-colors hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Icon name="chevron_left" size={18} />
                Sebelumnya
              </button>
              <div className="flex items-center gap-1">
                {getPageNumbers().map((page, idx) =>
                  page === 'ellipsis' ? (
                    <span key={`e-${idx}`} className="px-1 text-xs text-outline">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                        currentPage === page
                          ? 'bg-primary text-on-primary'
                          : 'text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Selanjutnya
                <Icon name="chevron_right" size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog Tambah / Edit */}
      <Dialog open={dialogBuka} onOpenChange={setDialogBuka}>
        <DialogContent className="max-w-2xl gap-0 overflow-hidden rounded-xl border-outline-variant bg-surface-container-lowest p-0 shadow-xl sm:rounded-xl">
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
            <DialogTitle className="text-xl font-bold text-on-surface">
              {modeEdit ? 'Ubah Data Lahan' : 'Tambah Data Lahan'}
            </DialogTitle>
            <button
              onClick={() => setDialogBuka(false)}
              className="rounded-full p-1 text-outline transition-colors hover:bg-surface-container"
            >
              <Icon name="close" size={24} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="max-h-[716px] space-y-5 overflow-y-auto px-6 py-5">
            {/* Field: Pemilik */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-on-surface">
                Pemilik Lahan
              </label>
              <select
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary"
                value={form.id_petani}
                onChange={e => setForm({ ...form, id_petani: e.target.value })}
              >
                <option value="">Pilih nama petani...</option>
                {daftarPetani.map(p => (
                  <option key={p.id_petani} value={p.id_petani}>{p.nama}</option>
                ))}
              </select>
            </div>

            {/* Field: Peta */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-on-surface">
                Batas Spasial Lahan
              </label>
              {form.koordinat ? (
                <button
                  type="button"
                  onClick={bukaPeta}
                  className="group flex w-full items-center justify-center gap-3 rounded-xl border-2 border-primary/50 bg-primary/5 px-4 py-6 text-sm font-medium text-primary transition-all hover:bg-primary/10"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Icon name="check_circle" size={24} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">Poligon tersimpan — Luas: {form.luas} Ha</p>
                    <p className="mt-0.5 text-xs text-on-surface-variant underline">Klik untuk edit batas lahan</p>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={bukaPeta}
                  className="group flex h-48 w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-outline-variant bg-surface-container-low transition-all hover:border-primary hover:bg-surface-container-high"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Icon name="polyline" size={28} className="text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-primary">Gambar Lahan di Peta Satelit</span>
                  <span className="px-6 text-center text-xs text-outline">
                    Klik untuk membuka GIS Editor dan mulai menentukan batas poligon lahan.
                  </span>
                </button>
              )}
            </div>

            {/* Grid: Luas + Fase Tanam */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-on-surface">
                  Luas (Ha)
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.0001"
                    placeholder="0.00"
                    className="rounded-lg border-outline-variant bg-surface-container-low p-3 pr-10 text-sm focus:border-primary focus:ring-2 focus:ring-primary"
                    value={form.luas}
                    onChange={e => setForm({ ...form, luas: e.target.value })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-outline">
                    Ha
                  </span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold tracking-wide text-on-surface">
                  Fase Tanam
                </label>
                <select
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary"
                  value={form.fase_tanam}
                  onChange={e => setForm({ ...form, fase_tanam: e.target.value })}
                >
                  <option value="belum_tanam">Persiapan Lahan</option>
                  <option value="awal_tanam">Vegetatif</option>
                  <option value="tumbuh_subur">Generatif</option>
                  <option value="panen">Panen</option>
                </select>
              </div>
            </div>

            {/* Field: Komoditas Chips */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold tracking-wide text-on-surface">
                Komoditas Utama
              </label>
              <div className="flex flex-wrap gap-2">
                {daftarKomoditas.map(k => {
                  const selected = form.komoditas.includes(k.id_komoditas)
                  return (
                    <button
                      key={k.id_komoditas}
                      type="button"
                      onClick={() => toggleKomoditas(k.id_komoditas)}
                      className={`flex items-center gap-1.5 rounded-full border-2 px-4 py-1.5 text-xs font-semibold transition-all ${
                        selected
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-outline-variant text-on-surface-variant hover:border-primary'
                      }`}
                    >
                      {selected && <Icon name="check_circle" size={18} />}
                      {k.nama_komoditas}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 border-t border-outline-variant bg-surface-container-low px-6 py-4">
            <button
              onClick={() => setDialogBuka(false)}
              className="rounded-lg px-5 py-2.5 text-sm font-semibold text-outline transition-colors hover:bg-surface-container-highest"
            >
              Batal
            </button>
            <button
              onClick={simpan}
              disabled={!form.id_petani || !form.luas}
              className="rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-on-primary shadow-lg shadow-primary/20 transition-all hover:bg-primary-container active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {modeEdit ? 'Simpan Perubahan' : 'Simpan Lahan'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

DataLahan.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
