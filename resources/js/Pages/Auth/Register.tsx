import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                {/* Branding/Icon Section */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-container">
                        <span className="material-symbols-outlined text-[32px] text-on-primary-container">
                            agriculture
                        </span>
                    </div>
                    <h1 className="text-headline-md text-on-surface">
                        Register
                    </h1>
                    <p className="mt-1 text-body-md text-on-surface-variant">
                        Buat akun baru
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="space-y-5">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                        <InputLabel htmlFor="name" value="Nama Lengkap" />
                        <TextInput
                            id="name"
                            name="name"
                            value={data.name}
                            placeholder="John Doe"
                            autoComplete="name"
                            isFocused={true}
                            leadingIcon="person"
                            onChange={(e) => setData('name', e.target.value)}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder="email@agrigis.gov"
                            autoComplete="username"
                            leadingIcon="mail"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <InputLabel htmlFor="password" value="Kata Sandi" />
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            leadingIcon="lock"
                            trailingIcon={
                                showPassword ? 'visibility_off' : 'visibility'
                            }
                            onTrailingIconClick={() =>
                                setShowPassword(!showPassword)
                            }
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            required
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Konfirmasi Kata Sandi"
                        />
                        <TextInput
                            id="password_confirmation"
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="password_confirmation"
                            value={data.password_confirmation}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            leadingIcon="lock_reset"
                            trailingIcon={
                                showConfirmPassword
                                    ? 'visibility_off'
                                    : 'visibility'
                            }
                            onTrailingIconClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            onChange={(e) =>
                                setData(
                                    'password_confirmation',
                                    e.target.value,
                                )
                            }
                            required
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    {/* Submit */}
                    <PrimaryButton disabled={processing} className="h-14">
                        <span>Register</span>
                        <span className="material-symbols-outlined text-[20px]">
                            arrow_forward
                        </span>
                    </PrimaryButton>
                </form>

                {/* Footer Link */}
                <div className="mt-8 border-t border-outline-variant pt-6 text-center">
                    <p className="text-body-sm text-on-surface-variant">
                        Sudah punya akun?{' '}
                        <Link
                            href={route('login')}
                            className="ml-1 font-semibold text-primary transition-all hover:underline"
                        >
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </GuestLayout>
    );
}
