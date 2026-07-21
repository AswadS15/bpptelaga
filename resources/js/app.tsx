import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import type { ComponentType } from 'react';

createInertiaApp({
    title: (title) => `${title} - ${import.meta.env.VITE_APP_NAME || 'Laravel'}`,
    resolve: (name) => {
        const pages = import.meta.glob('./Pages/**/*.tsx');

        return pages[`./Pages/${name}.tsx`]() as Promise<ComponentType>;
    },
    setup({ el, App, props }) {
        if (!el) {
            return;
        }

        createRoot(el as HTMLElement).render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
