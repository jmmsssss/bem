import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
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
            <Head title="Forgot Password - Solvity" />

            {/* Kartu Khusus dengan Glow & Tekstur Sesuai Halaman Login */}
            <div className="relative rounded-3xl p-8 sm:p-12 border transition-all duration-300
                bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl
                border-slate-200 dark:border-blue-500/40
                shadow-[0_20px_60px_-15px_rgba(15,23,42,0.4)]
                dark:shadow-[0_0_60px_-10px_rgba(59,130,246,0.45)]
                bg-[radial-gradient(#e2e8f0_1px,transparent_1px)]
                dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)]
                [background-size:16px_16px] overflow-hidden"
            >
                <div className="mb-6">
                    <Link
                        href={route('login')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                    >
                        &larr; Back to sign in
                    </Link>
                </div>

                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        Reset Password
                    </h1>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        Forgot your password? No problem, let us know your email address and we will email you a password reset link.
                    </p>

                </div>

                {status && (
                    <div className="mb-4 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            placeholder="Email address"
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:ring-2 focus:ring-blue-500 transition shadow-sm"
                            autoComplete="username"
                            required
                        />
                        <InputError message={errors.email} className="mt-1.5" />
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-lg shadow-blue-500/25 disabled:opacity-50 flex items-center justify-center text-sm"
                    >
                        {processing ? 'Sending link...' : 'Email Password Reset Link'}
                    </button>
                </form>
            </div>
        </GuestLayout>
    );
}
