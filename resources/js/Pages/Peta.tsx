import { useState, useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet-draw'
import 'leaflet-draw/dist/leaflet.draw.css'
import { router } from '@inertiajs/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/Components/ui/dialog'
import { Layers, Plus, MapPin, Eye, Filter } from 'lucide-react'
import TataLetak from '@/Komponen/TataLetak'

// Fix leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// === Palet warna yang variatif ===
const PALET_WARNA = [
  '#2563eb', '#ef4444', '#f59e0b', '#84cc16', '#f97316',
  '#8b5cf6', '#ec4899', '#14b8a6', '#06b6d4', '#a855f7',
  '#10b981', '#f43f5e', '#0ea5e9', '#d946ef', '#22c55e',
  '#e11d48', '#7c3aed', '#0891b2', '#c026d3', '#65a30d',
]

function ambilWarna(index: number): string {
  return PALET_WARNA[index % PALET_WARNA.length]
}

// === Interfaces ===
interface LahanPeta {
  id_lahan: number
  luas: number
  koordinat: {
    type: string
    properties: Record<string, any>
    geometry: { type: string; coordinates: number[][][] }
  }
  nama_pemilik: string
  nik_pemilik: string
  alamat_pemilik: string
  id_petani: number
  komoditas: string[]
  komoditas_ids: number[]
  komoditas_utama: string
  kelompok_tani: string[]
  desa: string
}

interface Props {
  dataLahan: LahanPeta[]
  daftarPetani: { id_petani: number; nama: string; nik: string }[]
  daftarKomoditas: { id_komoditas: number; nama_komoditas: string }[]
}

// === Tipe klasifikasi ===
type TipeKlasifikasi = 'komoditas' | 'pemilik' | 'kelompok_tani' | 'desa' | 'luas'

const KATEGORI_KLASIFIKASI: { key: TipeKlasifikasi; label: string }[] = [
  { key: 'komoditas', label: 'Komoditas' },
  { key: 'pemilik', label: 'Pemilik' },
  { key: 'kelompok_tani', label: 'Kelompok Tani' },
  { key: 'desa', label: 'Desa' },
  { key: 'luas', label: 'Luas Lahan' },
]

// Ambil nilai unik berdasarkan tipe klasifikasi
function ambilNilaiUnik(dataLahan: LahanPeta[], tipe: TipeKlasifikasi): string[] {
  const nilaiSet = new Set<string>()
  dataLahan.forEach(l => {
    switch (tipe) {
      case 'komoditas':
        if (l.komoditas.length > 0) l.komoditas.forEach(k => nilaiSet.add(k))
        else nilaiSet.add('Belum Ditentukan')
        break
      case 'pemilik':
        nilaiSet.add(l.nama_pemilik)
        break
      case 'kelompok_tani':
        if (l.kelompok_tani.length > 0) l.kelompok_tani.forEach(k => nilaiSet.add(k))
        else nilaiSet.add('Tidak Berkelompok')
        break
      case 'desa':
        nilaiSet.add(l.desa || '-')
        break
      case 'luas':
        if (l.luas < 1) nilaiSet.add('< 1 Ha')
        else if (l.luas < 2) nilaiSet.add('1 - 2 Ha')
        else if (l.luas < 3) nilaiSet.add('2 - 3 Ha')
        else nilaiSet.add('≥ 3 Ha')
        break
    }
  })
  return Array.from(nilaiSet).sort()
}

// Ambil nilai klasifikasi untuk satu lahan
function ambilNilaiLahan(lahan: LahanPeta, tipe: TipeKlasifikasi): string[] {
  switch (tipe) {
    case 'komoditas':
      return lahan.komoditas.length > 0 ? lahan.komoditas : ['Belum Ditentukan']
    case 'pemilik':
      return [lahan.nama_pemilik]
    case 'kelompok_tani':
      return lahan.kelompok_tani.length > 0 ? lahan.kelompok_tani : ['Tidak Berkelompok']
    case 'desa':
      return [lahan.desa || '-']
    case 'luas':
      if (lahan.luas < 1) return ['< 1 Ha']
      if (lahan.luas < 2) return ['1 - 2 Ha']
      if (lahan.luas < 3) return ['2 - 3 Ha']
      return ['≥ 3 Ha']
  }
}

// === Pusat Peta ===
const PUSAT_PETA: [number, number] = [0.612, 122.958]

export default function Peta({ dataLahan, daftarPetani, daftarKomoditas }: Props) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const polygonLayerRef = useRef<L.LayerGroup>(new L.LayerGroup())

  const [lahanHover, setLahanHover] = useState<LahanPeta | null>(null)
  const [dialogBuka, setDialogBuka] = useState(false)
  const [koordinatBaru, setKoordinatBaru] = useState<number[][]>([])
  const [form, setForm] = useState({ id_petani: '', luas: '', komoditas: [] as number[] })

  // Klasifikasi
  const [tipeKlasifikasi, setTipeKlasifikasi] = useState<TipeKlasifikasi>('komoditas')
  const [filterNilai, setFilterNilai] = useState<string | null>(null)

  const nilaiUnik = ambilNilaiUnik(dataLahan, tipeKlasifikasi)

  // Buat peta warna berdasarkan nilai unik
  const warnaMap = new Map<string, string>()
  nilaiUnik.forEach((val, idx) => warnaMap.set(val, ambilWarna(idx)))

  // Filter data
  const lahanTampil = filterNilai
    ? dataLahan.filter(l => ambilNilaiLahan(l, tipeKlasifikasi).includes(filterNilai))
    : dataLahan

  // Inisialisasi peta
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = L.map(mapContainerRef.current, {
      center: PUSAT_PETA,
      zoom: 17,
      maxZoom: 22,
      zoomControl: true,
    })

    // Satellite tile layer (Esri)
    const satelit = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: '&copy; Esri, Maxar, Earthstar Geographics',
        maxZoom: 22,
        maxNativeZoom: 19,
      }
    )

    // Label overlay
    const label = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 22, maxNativeZoom: 19, pane: 'overlayPane' }
    )

    // OpenStreetMap
    const osm = L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      { attribution: '&copy; OpenStreetMap', maxZoom: 22, maxNativeZoom: 19 }
    )

    // Google Satellite
    const googleSat = L.tileLayer(
      'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
      { attribution: '&copy; Google', maxZoom: 22, maxNativeZoom: 20 }
    )

    // Default: Satellite
    satelit.addTo(map)
    label.addTo(map)

    // Layer control
    const baseLayers: Record<string, L.TileLayer> = {
      'Satelit (Esri)': satelit,
      'Satelit (Google)': googleSat,
      'Peta Jalan (OSM)': osm,
    }
    L.control.layers(baseLayers, { 'Label & Batas': label }, { position: 'topleft' }).addTo(map)

    polygonLayerRef.current.addTo(map)

    // === Leaflet Draw ===
    const drawnItems = new L.FeatureGroup()
    map.addLayer(drawnItems)

    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false,
          shapeOptions: { color: '#ffffff', weight: 3, fillOpacity: 0.3, fillColor: '#67C090' },
        },
        polyline: false,
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false,
      },
      edit: { featureGroup: drawnItems },
    })
    map.addControl(drawControl)

    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer
      const latlngs = layer.getLatLngs()[0] as L.LatLng[]
      const koordinatGeoJSON = latlngs.map(ll => [ll.lng, ll.lat])
      koordinatGeoJSON.push(koordinatGeoJSON[0])

      setKoordinatBaru(koordinatGeoJSON)
      setForm({ id_petani: '', luas: '', komoditas: [] })
      setDialogBuka(true)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Render polygon setiap kali data/filter/klasifikasi berubah
  useEffect(() => {
    const layerGroup = polygonLayerRef.current
    layerGroup.clearLayers()

    lahanTampil.forEach((lahan) => {
      const koordinatLatLng = lahan.koordinat.geometry.coordinates[0].map(
        (coord: number[]) => [coord[1], coord[0]] as L.LatLngTuple
      )

      // Warna berdasarkan klasifikasi aktif
      const nilaiLahan = ambilNilaiLahan(lahan, tipeKlasifikasi)
      const warna = warnaMap.get(nilaiLahan[0]) || '#6b7280'

      const polygon = L.polygon(koordinatLatLng, {
        color: '#ffffff',
        fillColor: warna,
        fillOpacity: 0.6,
        weight: 2,
      })

      // Tooltip saat hover (bukan click)
      const tooltipContent = `
        <div style="min-width:220px;font-family:system-ui,sans-serif">
          <div style="font-weight:700;font-size:13px;margin-bottom:6px;border-bottom:1px solid #e2e8f0;padding-bottom:5px;color:#1e293b">
            ${lahan.nama_pemilik}
          </div>
          <table style="font-size:11px;width:100%;line-height:1.6">
            <tr><td style="color:#64748b;padding-right:10px;white-space:nowrap">NIK</td><td style="font-weight:500">${lahan.nik_pemilik}</td></tr>
            <tr><td style="color:#64748b;padding-right:10px">Alamat</td><td style="font-weight:500">${lahan.alamat_pemilik}</td></tr>
            <tr><td style="color:#64748b;padding-right:10px">Luas</td><td style="font-weight:500">${lahan.luas} Ha</td></tr>
            <tr><td style="color:#64748b;padding-right:10px">Komoditas</td><td style="font-weight:500">${lahan.komoditas.join(', ') || '-'}</td></tr>
            <tr><td style="color:#64748b;padding-right:10px">Kelompok</td><td style="font-weight:500">${lahan.kelompok_tani.join(', ') || '-'}</td></tr>
            <tr><td style="color:#64748b;padding-right:10px">Desa</td><td style="font-weight:500">${lahan.desa}</td></tr>
          </table>
        </div>
      `

      polygon.bindTooltip(tooltipContent, {
        sticky: true,
        direction: 'top',
        className: 'leaflet-tooltip-custom',
        opacity: 0.95,
      })

      // Highlight saat hover
      polygon.on('mouseover', () => {
        polygon.setStyle({ weight: 4, color: '#000000', fillOpacity: 0.8 })
        polygon.bringToFront()
        setLahanHover(lahan)
      })
      polygon.on('mouseout', () => {
        polygon.setStyle({ weight: 2, color: '#ffffff', fillOpacity: 0.6 })
        setLahanHover(null)
      })

      polygon.addTo(layerGroup)
    })
  }, [lahanTampil, tipeKlasifikasi, warnaMap])

  const simpanLahanBaru = () => {
    const geoJSON = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [koordinatBaru],
      },
    }

    router.post('/peta', {
      id_petani: Number(form.id_petani),
      luas: Number(form.luas),
      koordinat: geoJSON,
      komoditas: form.komoditas,
    }, {
      onSuccess: () => {
        setDialogBuka(false)
        setKoordinatBaru([])
      },
    })
  }

  const toggleKomoditas = (id: number) => {
    setForm(prev => ({
      ...prev,
      komoditas: prev.komoditas.includes(id)
        ? prev.komoditas.filter(k => k !== id)
        : [...prev.komoditas, id],
    }))
  }

  return (
    <div className="flex gap-4 h-full">
      {/* Peta */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 shadow-md border-t-4 border-t-secondary overflow-hidden flex flex-col">
          <CardHeader className="py-2.5 px-4 bg-slate-50 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers size={18} className="text-secondary" />
              Peta Lahan Pertanian — Kec. Telaga
            </CardTitle>
            <span className="text-xs text-slate-500">
              {lahanTampil.length}/{dataLahan.length} lahan ditampilkan
            </span>
          </CardHeader>
          <CardContent className="p-0 flex-1 relative" style={{ minHeight: 550 }}>
            <div ref={mapContainerRef} className="w-full h-full absolute inset-0" />
          </CardContent>
        </Card>
      </div>

      {/* Panel Kanan: Klasifikasi */}
      <div className="w-80 flex flex-col gap-3 overflow-auto max-h-[calc(100vh-120px)]">
        {/* Pilih Tipe Klasifikasi */}
        <Card className="shadow-md">
          <CardHeader className="py-2.5 px-4 bg-slate-50 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter size={14} className="text-primary" /> Klasifikasi Berdasarkan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2">
            <div className="grid grid-cols-2 gap-1.5">
              {KATEGORI_KLASIFIKASI.map(kat => (
                <button
                  key={kat.key}
                  onClick={() => { setTipeKlasifikasi(kat.key); setFilterNilai(null) }}
                  className={`px-2.5 py-1.5 text-xs rounded-md transition-all font-medium ${
                    tipeKlasifikasi === kat.key
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {kat.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Legenda Warna */}
        <Card className="shadow-md">
          <CardHeader className="py-2.5 px-4 bg-slate-50 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <MapPin size={14} className="text-primary" />
              {KATEGORI_KLASIFIKASI.find(k => k.key === tipeKlasifikasi)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            <button
              onClick={() => setFilterNilai(null)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${!filterNilai ? 'bg-primary text-white' : 'hover:bg-slate-100'}`}
            >
              <Eye size={12} /> Tampilkan Semua ({dataLahan.length})
            </button>

            {nilaiUnik.map((nama, idx) => {
              const warna = warnaMap.get(nama) || '#6b7280'
              const jumlah = dataLahan.filter(l =>
                ambilNilaiLahan(l, tipeKlasifikasi).includes(nama)
              ).length
              const aktif = filterNilai === nama

              return (
                <button
                  key={nama}
                  onClick={() => setFilterNilai(aktif ? null : nama)}
                  className={`w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs transition-colors ${aktif ? 'font-semibold bg-slate-100' : 'hover:bg-slate-50'}`}
                  style={aktif ? { outline: `2px solid ${warna}`, outlineOffset: '1px' } : {}}
                >
                  <div
                    className="w-4 h-4 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: warna, border: `1px solid ${warna}` }}
                  />
                  <span className="flex-1 text-left truncate" title={nama}>{nama}</span>
                  <span className="text-slate-400 flex-shrink-0">{jumlah}</span>
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* Info Hover */}
        <Card className="shadow-md">
          <CardHeader className="py-2.5 px-4 bg-slate-50 border-b">
            <CardTitle className="text-sm">Detail Lahan</CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            {lahanHover ? (
              <div className="space-y-2.5 text-sm">
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase tracking-wider">Pemilik</span>
                  <span className="font-semibold">{lahanHover.nama_pemilik}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase tracking-wider">NIK</span>
                    <span className="font-medium text-xs">{lahanHover.nik_pemilik}</span>
                  </div>
                  <div>
                    <span className="block text-slate-400 text-[10px] uppercase tracking-wider">Luas</span>
                    <span className="font-medium">{lahanHover.luas} Ha</span>
                  </div>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase tracking-wider">Alamat</span>
                  <span className="font-medium text-xs">{lahanHover.alamat_pemilik}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase tracking-wider">Komoditas</span>
                  <div className="flex flex-wrap gap-1 mt-0.5">
                    {lahanHover.komoditas.length > 0 ? lahanHover.komoditas.map((k, i) => {
                      const warna = warnaMap.get(k) || ambilWarna(i)
                      return (
                        <span key={i} className="px-2 py-0.5 text-[10px] rounded-full text-white" style={{ backgroundColor: warna }}>
                          {k}
                        </span>
                      )
                    }) : <span className="text-slate-400 text-xs">-</span>}
                  </div>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase tracking-wider">Kelompok Tani</span>
                  <span className="font-medium text-xs">{lahanHover.kelompok_tani.join(', ') || '-'}</span>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase tracking-wider">Desa</span>
                  <span className="font-medium text-xs">{lahanHover.desa}</span>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-6 text-xs">
                <MapPin className="mx-auto mb-2 text-slate-300" size={28} />
                Arahkan kursor ke polygon untuk melihat detail.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog Form Tambah Lahan */}
      <Dialog open={dialogBuka} onOpenChange={(open) => { setDialogBuka(open); if (!open) setKoordinatBaru([]) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus size={18} /> Tambah Data Lahan Baru
            </DialogTitle>
            <DialogDescription>
              Polygon telah digambar ({koordinatBaru.length > 0 ? koordinatBaru.length - 1 : 0} titik). Lengkapi data atribut di bawah ini.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <Label>Pemilik Lahan (Petani)</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={form.id_petani}
                onChange={e => setForm({ ...form, id_petani: e.target.value })}
              >
                <option value="">-- Pilih Petani --</option>
                {daftarPetani.map(p => (
                  <option key={p.id_petani} value={p.id_petani}>{p.nama} ({p.nik})</option>
                ))}
              </select>
            </div>

            <div>
              <Label>Luas Lahan (Hektar)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Contoh: 2.5"
                className="mt-1"
                value={form.luas}
                onChange={e => setForm({ ...form, luas: e.target.value })}
              />
            </div>

            <div>
              <Label>Komoditas yang Ditanam</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {daftarKomoditas.map((k, i) => {
                  const warna = ambilWarna(i)
                  return (
                    <button
                      key={k.id_komoditas}
                      type="button"
                      onClick={() => toggleKomoditas(k.id_komoditas)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                        form.komoditas.includes(k.id_komoditas)
                          ? 'text-white border-transparent shadow-sm'
                          : 'bg-white text-slate-600 border-slate-300 hover:border-slate-400'
                      }`}
                      style={form.komoditas.includes(k.id_komoditas) ? { backgroundColor: warna } : {}}
                    >
                      {k.nama_komoditas}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="bg-slate-50 rounded-md p-3">
              <Label className="text-xs text-slate-500">Koordinat Polygon (GeoJSON)</Label>
              <pre className="text-[10px] text-slate-400 mt-1 max-h-20 overflow-auto">
                {JSON.stringify(koordinatBaru.slice(0, 3), null, 1)}
                {koordinatBaru.length > 3 && `\n... +${koordinatBaru.length - 3} titik lainnya`}
              </pre>
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => { setDialogBuka(false); setKoordinatBaru([]) }}>Batal</Button>
            <Button
              onClick={simpanLahanBaru}
              disabled={!form.id_petani || !form.luas}
              className="bg-primary"
            >
              Simpan Lahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

Peta.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>
