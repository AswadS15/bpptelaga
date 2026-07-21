import { HTMLAttributes } from 'react'

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
    name: string
    size?: number
    fill?: boolean
}

export default function Icon({
    name,
    size,
    fill = false,
    className = '',
    style,
    ...props
}: IconProps) {
    return (
        <span
            className={`material-symbols-outlined${fill ? ' fill' : ''} ${className}`}
            style={{
                fontSize: size ? `${size}px` : undefined,
                ...style,
            }}
            aria-hidden="true"
            {...props}
        >
            {name}
        </span>
    )
}
