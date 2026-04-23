import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { router } from '@inertiajs/react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/Components/ui/dialog'
import {
  Plus, Trash2, Search, Map as MapIcon, Edit,
  CheckCircle2, X, LandPlot, ChevronDown, ChevronUp,
} from 'lucide-react'
import TataLetak from '@/Komponen/TataLetak'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

/* ─── Types ─────────────────────────────────────────────────────── */
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
}

interface Props {
  daftarLahan: LahanType[]
  daftarPetani: { id_petani: number; nama: string }[]
  daftarKomoditas: { id_komoditas: number; nama_komoditas: string }[]
}

/* ─── Modal Peta Fullscreen ──────────────────────────────────────── */
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
  // Simpan hasil gambar baru. Kalau mode tambah, mulai dari null.
  // Kalau mode edit, mulai dari koordinatAwal sebagai fallback (jika user tidak menggambar ulang).
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

      // Hanya tampilkan kontrol draw (tanpa edit untuk menghindari konflik)
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
        // Hanya simpan hasil gambar terbaru (hapus hasil gambar sebelumnya)
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
          // Tampilkan shape lama sebagai GHOST (referensi, garis putus-putus merah)
          // TIDAK masukkan ke drawnItems agar user tidak bisa edit mode lama
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

          // Hitung luas awal untuk tampilan info
          const coords = koordinatAwal?.geometry?.coordinates?.[0]
          if (coords) {
            const ll = coords.slice(0, -1).map((c: number[]) => L.latLng(c[1], c[0]))
            const areaSqm = L.GeometryUtil.geodesicArea(ll)
            setLuasSementara((areaSqm / 10000).toFixed(4))
          }

          // Auto-aktifkan tool gambar polygon langsung
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

  // Tentukan apakah tombol simpan bisa diklik:
  // - Mode tambah: harus ada drawnGeoJSON
  // - Mode edit: boleh simpan jika sudah digambar ulang
  const bolehSimpan = modeEdit ? sudahDigambarUlang : !!drawnGeoJSON
  const geoJSONUntukSimpan = drawnGeoJSON

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white shadow-md">
        <div className="flex items-center gap-2">
          <MapIcon size={18} className="text-blue-400" />
          <span className="font-semibold text-sm">
            {modeEdit ? 'Edit Titik Koordinat Lahan' : 'Gambar Lahan di Peta Satelit'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {luasSementara && (
            <span className="text-xs bg-blue-600 px-3 py-1 rounded-full font-medium">
              Luas: <strong>{luasSementara} Ha</strong>
            </span>
          )}
          <button onClick={onTutup} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Banner petunjuk */}
      {modeEdit ? (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
          <Edit size={14} className="text-amber-600 shrink-0" />
          <p className="text-xs text-amber-800">
            <strong>Mode Edit:</strong> Shape lama ditampilkan sebagai garis putus-putus merah sebagai referensi.
            Gambarlah shape baru di atasnya → klik titik pertama untuk menutup → klik <strong>Simpan</strong>.
          </p>
        </div>
      ) : (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center gap-2">
          <LandPlot size={14} className="text-blue-600 shrink-0" />
          <p className="text-xs text-blue-700">
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
                <CheckCircle2 size={14} /> Shape baru siap disimpan — luas <strong>{luasSementara} Ha</strong>
              </span>
            ) : (
              <span className="text-amber-600 font-medium">
                Gambarlah shape baru di atas referensi (garis merah) untuk menggantikan shape lama.
              </span>
            )
          ) : (
            drawnGeoJSON ? (
              <span className="text-green-600 font-medium flex items-center gap-1">
                <CheckCircle2 size={14} /> Poligon tersimpan — luas <strong>{luasSementara} Ha</strong>
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
            <CheckCircle2 size={16} /> {modeEdit ? 'Simpan Perubahan' : 'Selesai & Simpan Koordinat'}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ─── Halaman Utama ──────────────────────────────────────────────── */
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

  const filteredLahan = useMemo(() =>
    daftarLahan.filter(l =>
      l.petani?.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.komoditas.some(k => k.nama_komoditas.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [daftarLahan, searchTerm])

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

  const toggleKomoditas = (id: number) =>
    setForm(prev => ({
      ...prev,
      komoditas: prev.komoditas.includes(id)
        ? prev.komoditas.filter(k => k !== id)
        : [...prev.komoditas, id],
    }))

  return (
    <div className="space-y-4">
      <ModalPeta
        buka={modalPetaBuka}
        koordinatAwal={form.koordinat}
        onSelesai={handleSelesaiGambar}
        onTutup={handleBatalPeta}
      />

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold text-slate-800">Inventaris Lahan Pertanian</CardTitle>
            <p className="text-sm text-slate-500">Monitoring luas dan komoditas lahan di wilayah BPP Telaga</p>
          </div>
          <Button onClick={bukaDialogTambah} className="bg-primary hover:bg-primary/90 flex gap-2">
            <Plus size={18} /> Tambah Lahan
          </Button>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Cari pemilik atau komoditas..."
                className="pl-10" value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="text-sm text-slate-500">
              Menampilkan <strong>{filteredLahan.length}</strong> dari {daftarLahan.length} lahan
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-semibold">Nama Pemilik</TableHead>
                  <TableHead className="font-semibold">Komoditas</TableHead>
                  <TableHead className="font-semibold text-center">Luas (Ha)</TableHead>
                  <TableHead className="font-semibold">Status Spasial</TableHead>
                  <TableHead className="font-semibold text-center">Titik Koordinat</TableHead>
                  <TableHead className="text-right font-semibold">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLahan.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-slate-400 py-12">
                      <div className="flex flex-col items-center gap-2">
                        <MapIcon size={40} className="opacity-20" />
                        <p>Tidak ada data lahan yang ditemukan.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLahan.map(l => (
                    <>
                      <TableRow key={l.id_lahan} className="hover:bg-slate-50/50 transition-colors">
                        <TableCell className="font-medium text-slate-900">{l.petani?.nama || '-'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {l.komoditas.length > 0 ? (
                              l.komoditas.map(k => (
                                <span key={k.id_komoditas} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                                  {k.nama_komoditas}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 text-xs italic">Belum ditentukan</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-semibold text-slate-700">{l.luas}</TableCell>
                        <TableCell>
                          {l.koordinat ? (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                              Terpetakan
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Non-Spasial
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {l.titik_koordinat && l.titik_koordinat.length > 0 ? (
                            <button
                              onClick={() => setExpandedId(expandedId === l.id_lahan ? null : l.id_lahan)}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-1 rounded-full hover:bg-blue-100 transition-colors"
                            >
                              {l.titik_koordinat.length} titik
                              {expandedId === l.id_lahan ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                            </button>
                          ) : (
                            <span className="text-slate-300 text-[10px]">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => bukaDialogEdit(l)}
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              <Edit size={16} />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => hapusLahan(l.id_lahan)}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>

                      {/* Baris expandable: detail tiap titik koordinat */}
                      {expandedId === l.id_lahan && l.titik_koordinat && l.titik_koordinat.length > 0 && (
                        <TableRow key={`titik-${l.id_lahan}`} className="bg-blue-50/40">
                          <TableCell colSpan={6} className="py-4 px-6">
                            <p className="text-[11px] font-semibold text-slate-600 mb-3">
                              Titik Koordinat Lahan — <span className="text-blue-700">{l.petani?.nama}</span>
                              &nbsp;({l.titik_koordinat.length} titik)
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {l.titik_koordinat.map(t => (
                                <div key={t.titik}
                                  className="bg-white border border-blue-100 rounded-lg px-3 py-2 text-[10px] shadow-sm min-w-[130px]">
                                  <div className="font-bold text-blue-600 mb-1">Titik {t.titik}</div>
                                  <div className="text-slate-500">
                                    <span className="font-medium text-slate-700">Lat:</span>&nbsp;{t.lat.toFixed(8)}
                                  </div>
                                  <div className="text-slate-500">
                                    <span className="font-medium text-slate-700">Lng:</span>&nbsp;{t.lng.toFixed(8)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Dialog Tambah / Edit */}
        <Dialog open={dialogBuka} onOpenChange={setDialogBuka}>
          <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">{modeEdit ? 'Ubah Data Lahan' : 'Tambah Data Lahan'}</DialogTitle>
              <DialogDescription>
                Lengkapi informasi lahan, lalu gambar poligonnya di peta satelit.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div>
                <Label htmlFor="pemilik">Pemilik Lahan</Label>
                <select id="pemilik"
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={form.id_petani} onChange={e => setForm({ ...form, id_petani: e.target.value })}>
                  <option value="">-- Pilih Petani --</option>
                  {daftarPetani.map(p => <option key={p.id_petani} value={p.id_petani}>{p.nama}</option>)}
                </select>
              </div>

              <div>
                <Label>Titik Koordinat Lahan</Label>
                <button type="button" onClick={bukaPeta}
                  className={`mt-1 w-full flex items-center justify-center gap-2 rounded-lg border-2 border-dashed py-4 text-sm font-medium transition-all ${
                    form.koordinat
                      ? 'border-green-400 bg-green-50 text-green-700 hover:bg-green-100'
                      : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                  }`}>
                  <MapIcon size={18} />
                  {form.koordinat
                    ? <span>✓ Poligon tersimpan — Luas: <strong>{form.luas} Ha</strong><span className="ml-2 text-xs underline">(klik untuk edit)</span></span>
                    : 'Gambar Lahan di Peta Satelit'}
                </button>
              </div>

              <div>
                <Label htmlFor="luas">Luas Lahan (Ha)</Label>
                <Input id="luas" type="number" step="0.0001" className="mt-1" value={form.luas}
                  onChange={e => setForm({ ...form, luas: e.target.value })}
                  placeholder="Terisi otomatis saat menggambar" />
              </div>

              <div>
                <Label htmlFor="fase">Fase Tanam</Label>
                <select id="fase"
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  value={form.fase_tanam} onChange={e => setForm({ ...form, fase_tanam: e.target.value })}>
                  <option value="belum_tanam">Belum Tanam</option>
                  <option value="awal_tanam">Awal Tanam</option>
                  <option value="tumbuh_subur">Tumbuh Subur</option>
                  <option value="panen">Sudah Panen</option>
                </select>
              </div>

              <div>
                <Label>Komoditas</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {daftarKomoditas.map(k => (
                    <button key={k.id_komoditas} type="button" onClick={() => toggleKomoditas(k.id_komoditas)}
                      className={`px-3 py-1.5 text-[10px] rounded-full border transition-all ${
                        form.komoditas.includes(k.id_komoditas)
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                      }`}>
                      {k.nama_komoditas}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={() => setDialogBuka(false)}>Batal</Button>
              <Button onClick={simpan} className="bg-primary" disabled={!form.id_petani || !form.luas}>
                {modeEdit ? 'Simpan Perubahan' : 'Simpan Lahan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}

DataLahan.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
