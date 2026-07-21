import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface LahanMini {
    id_lahan: number
    koordinat: any
    komoditas_utama: string
    luas: number
}

const WARNA = ['#2e7d32', '#4caf50', '#81c784', '#fcab28', '#0054a7', '#8bc34a', '#c0ca33']

const PUSAT_PETA: [number, number] = [0.612, 122.958]

export default function PetaMini({ lahan }: { lahan: LahanMini[] }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const mapRef = useRef<L.Map | null>(null)

    // Petakan warna per komoditas (dipakai poligon & legenda)
    const warnaKomoditas = useMemo(() => {
        const map = new Map<string, string>()
        let idx = 0
        lahan.forEach((l) => {
            if (!map.has(l.komoditas_utama)) {
                map.set(l.komoditas_utama, WARNA[idx % WARNA.length])
                idx++
            }
        })
        return map
    }, [lahan])

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return

        const map = L.map(containerRef.current, {
            center: PUSAT_PETA,
            zoom: 13,
            zoomControl: false,
            attributionControl: false,
            scrollWheelZoom: false,
        })

        L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            { maxZoom: 22, maxNativeZoom: 19 }
        ).addTo(map)

        L.control.zoom({ position: 'bottomright' }).addTo(map)

        const group = L.featureGroup()
        lahan.forEach((l) => {
            const coords = l.koordinat?.geometry?.coordinates?.[0] ?? l.koordinat?.coordinates?.[0]
            if (!coords || !Array.isArray(coords)) return

            const latlngs = coords.map((c: number[]) => [c[1], c[0]] as L.LatLngTuple)
            const warna = warnaKomoditas.get(l.komoditas_utama) ?? '#6b7280'

            const poly = L.polygon(latlngs, {
                color: '#ffffff',
                weight: 1.5,
                fillColor: warna,
                fillOpacity: 0.55,
            })
            poly.bindTooltip(`${l.komoditas_utama} • ${l.luas} Ha`, {
                direction: 'top',
                className: 'leaflet-tooltip-custom',
                opacity: 0.95,
            })
            poly.addTo(group)
        })
        group.addTo(map)

        if (lahan.length > 0 && group.getBounds().isValid()) {
            map.fitBounds(group.getBounds(), { padding: [30, 30], maxZoom: 16 })
        }

        mapRef.current = map

        return () => {
            map.remove()
            mapRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <div ref={containerRef} className="h-full w-full" />
            {warnaKomoditas.size > 0 && (
                <div className="absolute left-4 top-4 z-[500] space-y-1.5 rounded-lg border border-border bg-card/90 p-3 backdrop-blur-sm">
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Legenda Komoditas</p>
                    {Array.from(warnaKomoditas.entries()).slice(0, 5).map(([nama, warna]) => (
                        <div key={nama} className="flex items-center gap-2 text-xs text-foreground">
                            <span className="h-2 w-4 rounded-sm" style={{ backgroundColor: warna }}></span>
                            {nama}
                        </div>
                    ))}
                </div>
            )}
        </>
    )
}
