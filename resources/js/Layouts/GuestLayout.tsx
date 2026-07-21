import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-surface">
            <div className="w-full max-w-md px-4">{children}</div>
        </div>
    );
}
