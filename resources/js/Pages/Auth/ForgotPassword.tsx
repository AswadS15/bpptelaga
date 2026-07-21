import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Kata Sandi" />

            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                {/* Lock Icon */}
                <div className="mb-6 flex flex-col items-center">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed">
                        <span className="material-symbols-outlined text-[32px] text-primary">
                            lock_reset
                        </span>
                    </div>

                    <h1 className="text-center text-headline-lg-mobile text-on-background md:text-headline-lg">
                        Lupa Kata Sandi?
                    </h1>
                    <p className="mt-2 text-center text-body-md leading-relaxed text-on-surface-variant">
                        Tidak masalah. Beri tahu kami alamat email Anda dan
                        kami akan mengirimkan tautan reset kata sandi.
                    </p>
                </div>

                {/* Status message */}
                {status && (
                    <div className="mb-4 rounded-lg bg-primary-fixed/30 px-4 py-3 text-body-sm font-medium text-on-primary-fixed-variant">
                        {status}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={submit} className="space-y-6">
                    <div className="flex flex-col gap-2">
                        <InputLabel htmlFor="email" value="Alamat Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder="nama@email.com"
                            isFocused={true}
                            leadingIcon="mail"
                            onChange={(e) =>
                                setData('email', e.target.value)
                            }
                        />
                        <InputError message={errors.email} />
                    </div>

                    <PrimaryButton disabled={processing}>
                        <span>Kirim Tautan Reset</span>
                        <span className="material-symbols-outlined text-[20px]">
                            arrow_forward
                        </span>
                    </PrimaryButton>
                </form>

                {/* Back to Login */}
                <div className="mt-8 text-center">
                    <Link
                        href={route('login')}
                        className="inline-flex items-center gap-2 text-button font-semibold text-primary transition-colors hover:text-primary-container"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            arrow_back
                        </span>
                        Kembali ke login
                    </Link>
                </div>
            </div>
        </GuestLayout>
    );
}
