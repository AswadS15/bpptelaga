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
import { Layers, Plus, MapPin, Eye, Filter, Edit, Trash2, CheckCircle2, X } from 'lucide-react'
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
  fase_tanam: string
  ndvi_skor: number
}

interface Props {
  dataLahan: LahanPeta[]
  daftarPetani: { id_petani: number; nama: string; nik: string }[]
  daftarKomoditas: { id_komoditas: number; nama_komoditas: string }[]
}

// === Tipe klasifikasi ===
type TipeKlasifikasi = 'komoditas' | 'pemilik' | 'kelompok_tani' | 'desa' | 'luas' | 'fase_tanam'

const KATEGORI_KLASIFIKASI: { key: TipeKlasifikasi; label: string }[] = [
  { key: 'komoditas', label: 'Komoditas' },
  { key: 'pemilik', label: 'Pemilik' },
  { key: 'kelompok_tani', label: 'Kelompok Tani' },
  { key: 'desa', label: 'Desa' },
  { key: 'luas', label: 'Luas Lahan' },
  { key: 'fase_tanam', label: 'Monitoring Fase Tanam (Satelit)' },
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
      case 'fase_tanam':
        nilaiSet.add('Belum Tanam')
        nilaiSet.add('Awal Tanam')
        nilaiSet.add('Tumbuh Subur')
        nilaiSet.add('Sudah Panen')
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
    case 'fase_tanam':
      const fase = lahan.fase_tanam === 'belum_tanam' ? 'Belum Tanam' :
                   lahan.fase_tanam === 'awal_tanam' ? 'Awal Tanam' :
                   lahan.fase_tanam === 'tumbuh_subur' ? 'Tumbuh Subur' : 'Sudah Panen'
      return [fase]
  }
}

const WARNA_FASE: Record<string, string> = {
  'Belum Tanam': '#94a3b8', // Slate (Tanah Kosong)
  'Awal Tanam': '#f59e0b',  // Amber (Tunas)
  'Tumbuh Subur': '#22c55e', // Green (Subur)
  'Sudah Panen': '#ef4444',  // Red (Panen/Selesai)
}

// === Pusat Peta ===
const PUSAT_PETA: [number, number] = [0.612, 122.958]

export default function Peta({ dataLahan, daftarPetani, daftarKomoditas }: Props) {
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const polygonLayerRef = useRef<L.LayerGroup>(new L.LayerGroup())

  const [lahanHover, setLahanHover] = useState<LahanPeta | null>(null)
  const [lahanTerpilih, setLahanTerpilih] = useState<{data: LahanPeta, layer: L.Polygon} | null>(null)
  const lahanTerpilihRef = useRef<LahanPeta | null>(null)
  const lahanLayerRef = useRef<L.Polygon | null>(null)
  const [modeEditTitik, setModeEditTitik] = useState(false)
  const modeEditRef = useRef(false)
  const drawerRef = useRef<any>(null)
  const [dialogBuka, setDialogBuka] = useState(false)
  const [koordinatBaru, setKoordinatBaru] = useState<number[][]>([])
  const [form, setForm] = useState({ id_petani: '', luas: '', komoditas: [] as number[], fase_tanam: 'belum_tanam' })

  // Klasifikasi
  const [tipeKlasifikasi, setTipeKlasifikasi] = useState<TipeKlasifikasi>('komoditas')
  const [filterNilai, setFilterNilai] = useState<string | null>(null)

  const nilaiUnik = ambilNilaiUnik(dataLahan, tipeKlasifikasi)

  // Buat peta warna berdasarkan nilai unik
  const warnaMap = new Map<string, string>()
  nilaiUnik.forEach((val, idx) => {
    if (tipeKlasifikasi === 'fase_tanam') {
      warnaMap.set(val, WARNA_FASE[val] || ambilWarna(idx))
    } else {
      warnaMap.set(val, ambilWarna(idx))
    }
  })

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

    // Geolocation: Auto center to GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          map.setView([latitude, longitude], 18)
          
          // Tambahkan marker lokasi pengguna
          L.circleMarker([latitude, longitude], {
            radius: 8,
            fillColor: '#3b82f6',
            color: '#ffffff',
            weight: 2,
            fillOpacity: 0.8
          }).addTo(map).bindTooltip("Lokasi Anda", { permanent: false, direction: 'top' })
        },
        (error) => {
          console.warn('Geolocation error:', error)
          // Jika gagal, tetap di pusat default
        }
      )
    }

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
      
      // Hitung luas otomatis (m2 -> Ha)
      const areaSqm = L.GeometryUtil.geodesicArea(latlngs)
      const areaHa = (areaSqm / 10000).toFixed(4)

      const koordinatGeoJSON = latlngs.map(ll => [ll.lng, ll.lat])
      koordinatGeoJSON.push(koordinatGeoJSON[0])

      if (modeEditRef.current && lahanTerpilihRef.current) {
        if (confirm('Simpan lahan dengan bentuk baru ini?\n\nShape lama akan digantikan oleh gambar baru.')) {
          const geoJSON = {
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [koordinatGeoJSON] }
          }
          const lahanData = lahanTerpilihRef.current
          router.put(`/peta/${lahanData.id_lahan}`, {
            id_petani: lahanData.id_petani,
            luas: areaHa,
            koordinat: geoJSON,
            komoditas: lahanData.komoditas_ids,
            fase_tanam: lahanData.fase_tanam
          }, {
            onSuccess: () => {
              // Hapus layer lama dari peta segera
              if (lahanLayerRef.current) {
                polygonLayerRef.current.removeLayer(lahanLayerRef.current)
                lahanLayerRef.current = null
              }
              setModeEditTitik(false)
              modeEditRef.current = false
              lahanTerpilihRef.current = null
            }
          })
        } else {
          setModeEditTitik(false)
          modeEditRef.current = false
          lahanTerpilihRef.current = null
          router.reload({ only: ['dataLahan'] })
        }
      } else {
        setKoordinatBaru(koordinatGeoJSON)
        setForm({ id_petani: '', luas: areaHa, komoditas: [], fase_tanam: 'belum_tanam' })
        setDialogBuka(true)
      }
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
            <tr style="border-top:1px dashed #e2e8f0"><td colspan="2" style="padding-top:5px"></td></tr>
            <tr><td style="color:#64748b;padding-right:10px">Fase Tanam</td><td style="font-weight:700;color:${WARNA_FASE[ambilNilaiLahan(lahan, 'fase_tanam')[0]]}">${ambilNilaiLahan(lahan, 'fase_tanam')[0]}</td></tr>
            <tr><td style="color:#64748b;padding-right:10px">NDVI (Satelit)</td><td style="font-weight:700;color:${lahan.ndvi_skor > 0.5 ? '#16a34a' : lahan.ndvi_skor > 0.2 ? '#d97706' : '#dc2626'}">${lahan.ndvi_skor.toFixed(3)}</td></tr>
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
        if (modeEditRef.current) return
        polygon.setStyle({ weight: 4, color: '#000000', fillOpacity: 0.8 })
        polygon.bringToFront()
        setLahanHover(lahan)
      })
      polygon.on('mouseout', () => {
        if (modeEditRef.current) return
        polygon.setStyle({ weight: 2, color: '#ffffff', fillOpacity: 0.6 })
        setLahanHover(null)
      })

      // Klik poligon untuk aksi (Edit / Hapus)
      polygon.on('click', () => {
        if (modeEditRef.current) return
        setLahanTerpilih({ data: lahan, layer: polygon })
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
      fase_tanam: form.fase_tanam,
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

  // --- Aksi Edit & Hapus Titik (Poligon Existing) ---
  const mulaiEditTitik = () => {
    if (!lahanTerpilih) return
    setModeEditTitik(true)
    modeEditRef.current = true
    lahanTerpilihRef.current = lahanTerpilih.data
    lahanLayerRef.current = lahanTerpilih.layer  // simpan referensi layer lama
    
    // Ubah style polygon lama agar transparan (menjadi background/jejak)
    const layer = lahanTerpilih.layer as L.Polygon
    layer.setStyle({ dashArray: '5, 5', fillOpacity: 0.1, opacity: 0.4, color: '#ef4444' })
    
    // Mulai menggambar poligon baru
    const polygonDrawer = new ((L as any).Draw.Polygon)(mapRef.current!, {
      allowIntersection: false,
      shapeOptions: { color: '#2563eb', weight: 3, fillOpacity: 0.3 },
    })
    polygonDrawer.enable()
    drawerRef.current = polygonDrawer

    setLahanTerpilih(null) // Tutup dialog
  }

  const batalEditTitik = () => {
    if (drawerRef.current) {
      drawerRef.current.disable()
      drawerRef.current = null
    }
    // Kembalikan style layer lama ke normal
    if (lahanLayerRef.current) {
      lahanLayerRef.current.setStyle({ dashArray: '', fillOpacity: 0.6, opacity: 1, color: '#ffffff' })
      lahanLayerRef.current = null
    }
    setModeEditTitik(false)
    modeEditRef.current = false
    lahanTerpilihRef.current = null
  }

  const hapusLahanExisting = () => {
    if (!lahanTerpilih) return
    if (confirm(`Yakin ingin menghapus lahan milik ${lahanTerpilih.data.nama_pemilik} beserta seluruh datanya?\n\nAksi ini tidak dapat dibatalkan.`)) {
      router.delete(`/peta/${lahanTerpilih.data.id_lahan}`, {
        onSuccess: () => {
          setLahanTerpilih(null)
          setModeEditTitik(false)
        }
      })
    }
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
            {modeEditTitik && (
              <div className="absolute top-0 left-0 right-0 z-[1000] bg-blue-600 text-white px-4 py-3 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-2 font-medium">
                  <Edit size={18} />
                  Gambarlah bentuk lahan yang baru (Selesaikan dengan mengklik titik awal)
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20" onClick={batalEditTitik}>
                    <X size={14} className="mr-1" /> Batal Menggambar
                  </Button>
                </div>
              </div>
            )}
            <div ref={mapContainerRef} className="w-full h-full absolute inset-0" />
            
            {/* Tombol GPS Manual */}
            <Button 
              variant="secondary" 
              size="sm" 
              className="absolute bottom-6 right-6 z-[1000] shadow-lg flex gap-2 border-2 border-white"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((p) => {
                    const { latitude, longitude } = p.coords
                    mapRef.current?.setView([latitude, longitude], 18)
                  })
                }
              }}
            >
              <MapPin size={16} className="text-blue-600" />
              Lokasi Saya
            </Button>
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
                <div className="pt-2 border-t border-dashed">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider">Status Satelit</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-600">NDVI ACTIVE</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div 
                         className="h-full transition-all" 
                         style={{ 
                           width: `${lahanHover.ndvi_skor * 100}%`,
                           backgroundColor: lahanHover.ndvi_skor > 0.5 ? '#22c55e' : lahanHover.ndvi_skor > 0.2 ? '#f59e0b' : '#ef4444'
                         }} 
                       />
                    </div>
                    <span className="text-xs font-bold">{lahanHover.ndvi_skor.toFixed(3)}</span>
                  </div>
                  <div className="mt-1 text-[10px] font-medium text-slate-500">
                    Vegetasi: {lahanHover.ndvi_skor > 0.6 ? 'Sangat Lebat' : lahanHover.ndvi_skor > 0.3 ? 'Sedang' : 'Lahan Kosong/Panen'}
                  </div>
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

            <div>
              <Label>Fase Tanam Saat Ini</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                value={form.fase_tanam}
                onChange={e => setForm({ ...form, fase_tanam: e.target.value })}
              >
                <option value="belum_tanam">Belum Tanam</option>
                <option value="awal_tanam">Awal Tanam</option>
                <option value="tumbuh_subur">Tumbuh Subur</option>
                <option value="panen">Sudah Panen</option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1">* Sistem akan melakukan sinkronisasi citra satelit NDVI otomatis.</p>
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
      {/* Modal Opsi Lahan (Klik Poligon) */}
      <Dialog open={!!lahanTerpilih && !modeEditTitik} onOpenChange={(open) => !open && setLahanTerpilih(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Aksi Lahan Pertanian</DialogTitle>
            <DialogDescription>
              Pilih aksi untuk lahan milik <strong>{lahanTerpilih?.data.nama_pemilik}</strong>
            </DialogDescription>
          </DialogHeader>
          
          {lahanTerpilih && (
            <div className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-lg border text-sm">
                <div className="grid grid-cols-2 gap-y-2">
                  <div className="text-slate-500">Luas:</div>
                  <div className="font-medium text-right">{lahanTerpilih.data.luas} Ha</div>
                  <div className="text-slate-500">Komoditas:</div>
                  <div className="font-medium text-right">{lahanTerpilih.data.komoditas.join(', ') || '-'}</div>
                  <div className="text-slate-500">Fase Tanam:</div>
                  <div className="font-medium text-right">{WARNA_FASE[ambilNilaiLahan(lahanTerpilih.data, 'fase_tanam')[0]] ? ambilNilaiLahan(lahanTerpilih.data, 'fase_tanam')[0] : '-'}</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={mulaiEditTitik}>
                  <Edit size={16} /> Edit Poligon
                </Button>
                <Button variant="outline" className="flex-1 gap-2 text-red-600 border-red-200 hover:bg-red-50" onClick={hapusLahanExisting}>
                  <Trash2 size={16} /> Hapus Lahan
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

Peta.layout = (page: React.ReactNode) => <TataLetak>{page}</TataLetak>

