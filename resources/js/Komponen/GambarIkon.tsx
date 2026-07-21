import { useState } from 'react'
import Icon from './Icon'
import { cn } from '@/lib/utils'

interface GambarIkonProps {
    /** Sumber gambar. Jika kosong atau gagal dimuat, fallback ke ikon material. */
    src?: string | null
    alt?: string
    /** Nama ikon material symbol sebagai fallback. */
    ikon: string
    /** Ukuran ikon fallback (px). */
    size?: number
    fill?: boolean
    className?: string
}

export default function GambarIkon({
    src,
    alt = '',
    ikon,
    size = 24,
    fill = false,
    className = '',
}: GambarIkonProps) {
    const [gagal, setGagal] = useState(false)
    const tampilkanGambar = Boolean(src) && !gagal

    if (tampilkanGambar) {
        return (
            <img
                src={src as string}
                alt={alt}
                onError={() => setGagal(true)}
                className={cn('h-full w-full object-cover', className)}
            />
        )
    }

    return <Icon name={ikon} size={size} fill={fill} className={className} />
}
