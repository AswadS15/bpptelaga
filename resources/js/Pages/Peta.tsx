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
import Icon from '@/Komponen/Icon'
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

// === Token warna Material Design 3 (sesuai Stitch) ===
const MD3 = {
  primaryContainer: '#2e7d32',
  onPrimaryContainer: '#cbffc2',
  secondaryContainer: '#fcab28',
  onSecondaryContainer: '#694300',
}

// Konversi lingkaran menjadi cincin poligon GeoJSON (lng, lat)
function lingkaranKePoligon(center: { lat: number; lng: number }, radiusMeter: number, titik = 64): number[][] {
  const coords: number[][] = []
  const jarakSudut = radiusMeter / 6378137
  const lat1 = (center.lat * Math.PI) / 180
  const lon1 = (center.lng * Math.PI) / 180
  for (let i = 0; i <= titik; i++) {
    const bearing = (i / titik) * 2 * Math.PI
    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(jarakSudut) +
      Math.cos(lat1) * Math.sin(jarakSudut) * Math.cos(bearing)
    )
    const lon2 = lon1 + Math.atan2(
      Math.sin(bearing) * Math.sin(jarakSudut) * Math.cos(lat1),
      Math.cos(jarakSudut) - Math.sin(lat1) * Math.sin(lat2)
    )
    coords.push([(lon2 * 180) / Math.PI, (lat2 * 180) / Math.PI])
  }
  return coords
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
  { key: 'fase_tanam', label: 'Monitoring Fase' },
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
  const activeDrawRef = useRef<any>(null)

  const [lahanHover, setLahanHover] = useState<LahanPeta | null>(null)
  const lahanHoverLayerRef = useRef<L.Polygon | null>(null)
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

    // === Leaflet Draw (handler kustom, tanpa toolbar bawaan) ===
    const drawnItems = new L.FeatureGroup()
    map.addLayer(drawnItems)

    const simpanHasilGambar = (koordinatGeoJSON: number[][], areaHa: string) => {
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
    }

    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer
      const tipe = e.layerType

      if (tipe === 'circle') {
        const center = layer.getLatLng()
        const radius = layer.getRadius()
        const ring = lingkaranKePoligon(center, radius)
        const areaSqm = Math.PI * radius * radius
        simpanHasilGambar(ring, (areaSqm / 10000).toFixed(4))
        return
      }

      const latlngs = layer.getLatLngs()[0] as L.LatLng[]
      const areaSqm = L.GeometryUtil.geodesicArea(latlngs)
      let koordinatGeoJSON = latlngs.map(ll => [ll.lng, ll.lat])
      const first = koordinatGeoJSON[0]
      const last = koordinatGeoJSON[koordinatGeoJSON.length - 1]
      if (first[0] !== last[0] || first[1] !== last[1]) {
        koordinatGeoJSON = [...koordinatGeoJSON, first]
      }
      simpanHasilGambar(koordinatGeoJSON, (areaSqm / 10000).toFixed(4))
    })

    // === Fungsi trigger gambar (dipanggil dari tombol kustom) ===
    ;(map as any)._mulaiGambar = (bentuk: 'polygon' | 'rectangle' | 'circle') => {
      if (activeDrawRef.current) {
        activeDrawRef.current.disable()
        activeDrawRef.current = null
      }
      const opsi: any = {
        shapeOptions: { color: '#ffffff', weight: 3, fillOpacity: 0.3, fillColor: '#67C090' },
      }
      if (bentuk === 'polygon') {
        activeDrawRef.current = new (L as any).Draw.Polygon(map, { allowIntersection: false, ...opsi })
      } else if (bentuk === 'rectangle') {
        activeDrawRef.current = new (L as any).Draw.Rectangle(map, opsi)
      } else {
        activeDrawRef.current = new (L as any).Draw.Circle(map, opsi)
      }
      activeDrawRef.current.enable()
    }

    ;(map as any)._batalGambar = () => {
      if (activeDrawRef.current) {
        activeDrawRef.current.disable()
        activeDrawRef.current = null
      }
      drawnItems.clearLayers()
    }

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
        lahanHoverLayerRef.current = polygon
      })
      polygon.on('mouseout', () => {
        if (modeEditRef.current) return
        polygon.setStyle({ weight: 2, color: '#ffffff', fillOpacity: 0.6 })
        setLahanHover(null)
        lahanHoverLayerRef.current = null
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
        if (activeDrawRef.current) {
          activeDrawRef.current.disable()
          activeDrawRef.current = null
        }
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

  const mulaiGambar = (bentuk: 'polygon' | 'rectangle' | 'circle') => {
    ;(mapRef.current as any)?._mulaiGambar(bentuk)
  }

  const batalGambar = () => {
    ;(mapRef.current as any)?._batalGambar()
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

  const bukaDetailLengkap = () => {
    if (lahanHover && lahanHoverLayerRef.current) {
      setLahanTerpilih({ data: lahanHover, layer: lahanHoverLayerRef.current })
    }
  }

  const ndviLabel = (skor: number) =>
    skor > 0.6 ? 'Kondisi vegetasi sangat baik (Hijau Pekat)'
    : skor > 0.3 ? 'Vegetasi sedang'
    : 'Lahan kosong / sudah panen'

  return (
    <div className="flex h-full w-full gap-3">
      {/* Peta (full-bleed) */}
      <div className="relative flex-1 overflow-hidden rounded-xl border border-outline-variant bg-surface">
        {modeEditTitik && (
          <div className="absolute inset-x-0 top-0 z-[1000] flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground shadow-md">
            <div className="flex items-center gap-2 font-medium">
              <Icon name="edit" size={18} />
              Gambarlah bentuk lahan yang baru (Selesaikan dengan mengklik titik awal)
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-white/20 bg-white/10 text-white hover:bg-white/20"
                onClick={batalEditTitik}
              >
                <Icon name="close" size={14} className="mr-1" /> Batal Menggambar
              </Button>
            </div>
          </div>
        )}

        <div ref={mapContainerRef} className="absolute inset-0" />

        {/* Klaster alat gambar (atas-kanan) */}
        <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-1 shadow-md">
          <button
            type="button"
            title="Gambar Poligon"
            onClick={() => mulaiGambar('polygon')}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <Icon name="pentagon" size={20} />
          </button>
          <button
            type="button"
            title="Gambar Persegi"
            onClick={() => mulaiGambar('rectangle')}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <Icon name="rectangle" size={20} />
          </button>
          <button
            type="button"
            title="Gambar Lingkaran"
            onClick={() => mulaiGambar('circle')}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <Icon name="circle" size={20} />
          </button>
          <div className="mx-2 h-px bg-outline-variant" />
          <button
            type="button"
            title="Bersihkan Gambar"
            onClick={batalGambar}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container"
          >
            <Icon name="delete" size={20} />
          </button>
        </div>

        {/* Tombol GPS (bawah-kanan) */}
        <button
          type="button"
          title="Lokasi Saya"
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition((p) => {
                const { latitude, longitude } = p.coords
                mapRef.current?.setView([latitude, longitude], 18)
              })
            }
          }}
          className="absolute bottom-3 right-3 z-[1000] flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-on-primary shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <Icon name="my_location" size={22} fill />
        </button>

        {/* Badge jumlah lahan (bawah-kiri) */}
        <div className="absolute bottom-3 left-3 z-[1000] rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-xs font-medium text-on-surface shadow-md">
          {lahanTampil.length}/{dataLahan.length} lahan ditampilkan
        </div>
      </div>

      {/* Panel Kanan: Klasifikasi */}
      <aside className="flex w-80 flex-col gap-3 overflow-y-auto pr-1">
        {/* Pilih Tipe Klasifikasi */}
        <Card className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-on-surface">
              <Icon name="filter_alt" size={18} className="text-primary" />
              Klasifikasi Berdasarkan
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-2">
              {KATEGORI_KLASIFIKASI.map(kat => {
                const aktif = tipeKlasifikasi === kat.key
                return (
                  <button
                    key={kat.key}
                    onClick={() => { setTipeKlasifikasi(kat.key); setFilterNilai(null) }}
                    className={`rounded-lg border px-2.5 py-2 text-center text-xs font-medium transition-all ${
                      aktif
                        ? 'border-primary bg-primary text-on-primary'
                        : 'border-outline-variant text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                  >
                    {kat.label}
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Legenda Warna */}
        <Card className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-on-surface">
              <Icon name="place" size={18} className="text-primary" />
              {KATEGORI_KLASIFIKASI.find(k => k.key === tipeKlasifikasi)?.label}
            </CardTitle>
            <Icon name="info" size={20} className="text-on-surface-variant" />
          </CardHeader>
          <CardContent className="space-y-1 p-0">
            <button
              onClick={() => setFilterNilai(null)}
              className={`mb-2 flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                !filterNilai ? 'bg-primary text-on-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              }`}
            >
              <Icon name="visibility" size={14} />
              Tampilkan Semua ({dataLahan.length})
            </button>

            <ul className="space-y-0.5">
              {nilaiUnik.map((nama) => {
                const warna = warnaMap.get(nama) || '#6b7280'
                const jumlah = dataLahan.filter(l =>
                  ambilNilaiLahan(l, tipeKlasifikasi).includes(nama)
                ).length
                const aktif = filterNilai === nama

                return (
                  <li key={nama}>
                    <button
                      onClick={() => setFilterNilai(aktif ? null : nama)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-colors ${
                        aktif ? 'bg-accent font-semibold text-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                      }`}
                      style={aktif ? { outline: `2px solid ${warna}`, outlineOffset: '1px' } : {}}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-4 w-4 flex-shrink-0 rounded-sm"
                          style={{ backgroundColor: warna, border: `1px solid ${warna}` }}
                        />
                        <span className="truncate text-left" title={nama}>{nama}</span>
                      </span>
                      <span className="flex-shrink-0 text-on-surface-variant">{jumlah}</span>
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="mt-2 border-t border-outline-variant pt-2">
              <button
                onClick={() => setFilterNilai(null)}
                className="flex w-full items-center justify-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                Tampilkan Semua
                <Icon name="chevron_right" size={16} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Info Hover / Detail Lahan */}
        <Card className="rounded-xl border border-outline-variant border-t-4 border-t-primary bg-surface-container-lowest p-4">
          <CardHeader className="p-0 pb-3">
            <CardTitle className="text-base font-semibold text-on-surface">
              {lahanHover ? `Lahan ${lahanHover.komoditas_utama} #L${String(lahanHover.id_lahan).padStart(4, '0')}` : 'Detail Lahan'}
            </CardTitle>
            {lahanHover && (
              <div className="mt-2 flex flex-wrap gap-1">
                {lahanHover.komoditas.length > 0 ? lahanHover.komoditas.map((k, i) => (
                  <span
                    key={i}
                    className="rounded-full px-2 py-[2px] text-[11px] font-medium"
                    style={{ backgroundColor: MD3.primaryContainer, color: MD3.onPrimaryContainer }}
                  >
                    {k}
                  </span>
                )) : (
                  <span
                    className="rounded-full px-2 py-[2px] text-[11px] font-medium"
                    style={{ backgroundColor: MD3.secondaryContainer, color: MD3.onSecondaryContainer }}
                  >
                    Belum Ditentukan
                  </span>
                )}
                <span
                  className="rounded-full px-2 py-[2px] text-[11px] font-medium"
                  style={{ backgroundColor: MD3.secondaryContainer, color: MD3.onSecondaryContainer }}
                >
                  Aktif
                </span>
              </div>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {lahanHover ? (
              <div>
                <div className="divide-y divide-outline-variant">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-medium text-on-surface-variant">Pemilik</span>
                    <span className="text-sm font-semibold text-foreground">{lahanHover.nama_pemilik}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-medium text-on-surface-variant">NIK</span>
                    <span className="text-sm text-foreground">{lahanHover.nik_pemilik}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-medium text-on-surface-variant">Luas</span>
                    <span className="text-sm font-semibold text-foreground">{lahanHover.luas} Ha</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs font-medium text-on-surface-variant">Alamat</span>
                    <span className="text-sm text-foreground">{lahanHover.alamat_pemilik}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex items-end justify-between">
                    <span className="text-xs font-bold text-primary">NDVI ACTIVE</span>
                    <span className="text-[11px] font-bold text-foreground">{lahanHover.ndvi_skor.toFixed(3)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-primary transition-all duration-1000"
                      style={{ width: `${Math.min(lahanHover.ndvi_skor * 100, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] italic text-on-surface-variant">{ndviLabel(lahanHover.ndvi_skor)}</p>
                </div>

                <Button
                  className="mt-4 w-full gap-2 bg-primary text-on-primary hover:bg-primary/90"
                  onClick={bukaDetailLengkap}
                >
                  <Icon name="visibility" size={18} />
                  Lihat Detail Lengkap
                </Button>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                <Icon name="place" className="mx-auto mb-2 opacity-30" size={28} />
                Arahkan kursor ke polygon untuk melihat detail.
              </div>
            )}
          </CardContent>
        </Card>
      </aside>

      {/* Dialog Form Tambah Lahan */}
      <Dialog open={dialogBuka} onOpenChange={(open) => { setDialogBuka(open); if (!open) setKoordinatBaru([]) }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="add" size={18} /> Tambah Data Lahan Baru
            </DialogTitle>
            <DialogDescription>
              Polygon telah digambar ({koordinatBaru.length > 0 ? koordinatBaru.length - 1 : 0} titik). Lengkapi data atribut di bawah ini.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-2 space-y-4">
            <div>
              <Label>Pemilik Lahan (Petani)</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              <div className="mt-2 flex flex-wrap gap-2">
                {daftarKomoditas.map((k, i) => {
                  const warna = ambilWarna(i)
                  return (
                    <button
                      key={k.id_komoditas}
                      type="button"
                      onClick={() => toggleKomoditas(k.id_komoditas)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                        form.komoditas.includes(k.id_komoditas)
                          ? 'border-transparent text-white shadow-sm'
                          : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
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
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={form.fase_tanam}
                onChange={e => setForm({ ...form, fase_tanam: e.target.value })}
              >
                <option value="belum_tanam">Belum Tanam</option>
                <option value="awal_tanam">Awal Tanam</option>
                <option value="tumbuh_subur">Tumbuh Subur</option>
                <option value="panen">Sudah Panen</option>
              </select>
              <p className="mt-1 text-[10px] text-slate-500">* Sistem akan melakukan sinkronisasi citra satelit NDVI otomatis.</p>
            </div>

            <div className="rounded-md bg-slate-50 p-3">
              <Label className="text-xs text-slate-500">Koordinat Polygon (GeoJSON)</Label>
              <pre className="mt-1 max-h-20 overflow-auto text-[10px] text-slate-400">
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
              className="bg-primary text-on-primary hover:bg-primary/90"
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
              <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm">
                <div className="grid grid-cols-2 gap-y-2">
                  <div className="text-on-surface-variant">Luas:</div>
                  <div className="text-right font-medium">{lahanTerpilih.data.luas} Ha</div>
                  <div className="text-on-surface-variant">Komoditas:</div>
                  <div className="text-right font-medium">{lahanTerpilih.data.komoditas.join(', ') || '-'}</div>
                  <div className="text-on-surface-variant">Fase Tanam:</div>
                  <div className="text-right font-medium">
                    {WARNA_FASE[ambilNilaiLahan(lahanTerpilih.data, 'fase_tanam')[0]] ? ambilNilaiLahan(lahanTerpilih.data, 'fase_tanam')[0] : '-'}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 gap-2 border-primary/30 text-primary hover:bg-primary/5" onClick={mulaiEditTitik}>
                  <Icon name="edit" size={16} /> Edit Poligon
                </Button>
                <Button variant="outline" className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50" onClick={hapusLahanExisting}>
                  <Icon name="delete" size={16} /> Hapus Lahan
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
