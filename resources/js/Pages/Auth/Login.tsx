import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-surface">
            <Head title="Masuk" />

            <main className="w-full max-w-md px-4">
                {/* Login Card */}
                <div
                    className="flex flex-col items-center rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-lg"
                    style={{ borderTop: '4px solid #2e7d32' }}
                >
                    {/* Logo & Header */}
                    <div className="mb-6 text-center">
                        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-container/10">
                            <span className="material-symbols-outlined text-[40px] text-primary">
                                eco
                            </span>
                        </div>
                        <h1 className="text-headline-md tracking-tight text-on-surface">
                            WebGIS BPP Telaga
                        </h1>
                        <p className="mt-1 text-body-sm text-on-surface-variant">
                            Masuk untuk mengelola data pertanian
                        </p>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="mb-4 w-full rounded-lg bg-primary-fixed/30 px-4 py-3 text-body-sm font-medium text-on-primary-fixed-variant">
                            {status}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={submit} className="w-full space-y-4">
                        {/* Email */}
                        <div className="space-y-1">
                            <label
                                htmlFor="email"
                                className="block px-1 text-label-md text-on-surface-variant"
                            >
                                Email
                            </label>
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                placeholder="Alamat Email"
                                autoComplete="username"
                                isFocused={true}
                                leadingIcon="mail"
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                            />
                            <InputError message={errors.email} />
                        </div>

                        {/* Password */}
                        <div className="space-y-1">
                            <label
                                htmlFor="password"
                                className="block px-1 text-label-md text-on-surface-variant"
                            >
                                Kata Sandi
                            </label>
                            <TextInput
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                placeholder="Password"
                                autoComplete="current-password"
                                leadingIcon="lock"
                                trailingIcon={
                                    showPassword
                                        ? 'visibility_off'
                                        : 'visibility'
                                }
                                onTrailingIconClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                            />
                            <InputError message={errors.password} />
                        </div>

                        {/* Options */}
                        <div className="flex items-center justify-between px-1 py-1">
                            <label className="group flex cursor-pointer items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) =>
                                        setData(
                                            'remember',
                                            e.target.checked,
                                        )
                                    }
                                    className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary-container/30"
                                />
                                <span className="text-label-sm text-on-surface-variant transition-colors group-hover:text-on-surface">
                                    Ingat saya
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-label-sm text-primary underline-offset-4 hover:underline"
                                >
                                    Lupa password?
                                </Link>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-title-lg text-white shadow-md transition-all hover:bg-[#0a4d15] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span>Masuk Sistem</span>
                            <span className="material-symbols-outlined text-[20px]">
                                login
                            </span>
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="mt-8 w-full border-t border-outline-variant pt-6 text-center">
                        <p className="text-label-sm text-outline">
                            &copy; 2024 AgriGIS &bull; Balai Penyuluhan
                            Pertanian Kecamatan Telaga
                        </p>
                        <div className="mt-2 flex justify-center gap-4">
                            <Link
                                href="#"
                                className="text-label-sm text-on-surface-variant transition-colors hover:text-primary"
                            >
                                Kebijakan Privasi
                            </Link>
                            <Link
                                href="#"
                                className="text-label-sm text-on-surface-variant transition-colors hover:text-primary"
                            >
                                Bantuan
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Decorative Background Elements */}
                <div className="pointer-events-none fixed bottom-0 left-0 select-none p-6 opacity-20">
                    <span className="material-symbols-outlined text-[120px] text-primary-container">
                        potted_plant
                    </span>
                </div>
                <div className="pointer-events-none fixed right-0 top-0 select-none p-6 opacity-20">
                    <span className="material-symbols-outlined text-[120px] text-primary-container">
                        agriculture
                    </span>
                </div>
            </main>
        </div>
    );
}
