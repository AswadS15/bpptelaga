import {
    forwardRef,
    InputHTMLAttributes,
    useEffect,
    useImperativeHandle,
    useRef,
} from 'react';

export default forwardRef(function TextInput(
    {
        type = 'text',
        className = '',
        isFocused = false,
        leadingIcon,
        trailingIcon,
        onTrailingIconClick,
        ...props
    }: InputHTMLAttributes<HTMLInputElement> & {
        isFocused?: boolean;
        leadingIcon?: string;
        trailingIcon?: string;
        onTrailingIconClick?: () => void;
    },
    ref,
) {
    const localRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
        focus: () => localRef.current?.focus(),
    }));

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <div className="relative">
            {leadingIcon && (
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-outline">
                    {leadingIcon}
                </span>
            )}
            <input
                {...props}
                type={type}
                className={
                    `h-12 w-full rounded-xl border border-outline-variant bg-surface-bright text-body-md text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary-container/20 ${
                        leadingIcon ? 'pl-11' : 'px-4'
                    } ${trailingIcon ? 'pr-12' : 'px-4'} ` + className
                }
                ref={localRef}
            />
            {trailingIcon && (
                <button
                    type="button"
                    tabIndex={-1}
                    onClick={onTrailingIconClick}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline transition-colors hover:text-on-surface"
                >
                    <span className="material-symbols-outlined text-[20px]">
                        {trailingIcon}
                    </span>
                </button>
            )}
        </div>
    );
});
