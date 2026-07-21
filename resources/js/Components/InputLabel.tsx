import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string }) {
    return (
        <label
            {...props}
            className={
                `text-label-md text-on-surface-variant ` +
                className
            }
        >
            {value ? value : children}
        </label>
    );
}
