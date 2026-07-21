import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
                {/* Icon Section */}
                <div className="mb-8 flex flex-col items-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-fixed">
                        <span className="material-symbols-outlined text-[32px] text-primary">
                            key
                        </span>
                    </div>
                    <h1 className="text-headline-md text-on-surface">
                        Reset Password
                    </h1>
                    <p className="mt-1 text-body-md text-on-surface-variant">
                        Buat kata sandi baru untuk akun Anda
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={submit} className="space-y-5">
                    {/* Email (read-only) */}
                    <div className="space-y-1.5">
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="cursor-not-allowed opacity-60"
                            autoComplete="username"
                            leadingIcon="mail"
                            onChange={(e) =>
                                setData('email', e.target.value)
                            }
                            readOnly
                        />
                        <InputError message={errors.email} />
                    </div>

                    {/* New Password */}
                    <div className="space-y-1.5">
                        <InputLabel
                            htmlFor="password"
                            value="Kata Sandi Baru"
                        />
                        <TextInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={data.password}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            isFocused={true}
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
                        />
                        <InputError message={errors.password} />
                    </div>

                    {/* Confirm New Password */}
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
                                setShowConfirmPassword(
                                    !showConfirmPassword,
                                )
                            }
                            onChange={(e) =>
                                setData(
                                    'password_confirmation',
                                    e.target.value,
                                )
                            }
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    {/* Submit */}
                    <PrimaryButton disabled={processing}>
                        <span>Reset Password</span>
                        <span className="material-symbols-outlined text-[20px]">
                            lock_reset
                        </span>
                    </PrimaryButton>
                </form>
            </div>
        </GuestLayout>
    );
}
