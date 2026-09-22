import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user as any;
    const fileInput = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm<{
            _method: string;
            name: string;
            email: string;
            avatar: File | null;
        }>({
            _method: 'patch',
            name: user.name,
            email: user.email,
            avatar: null,
        });

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setData('avatar', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            forceFormData: true,
        });
    };

    const avatarUrl = preview
        ? preview
        : user.avatar
        ? `/storage/${user.avatar}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&size=160&bold=true`;

    return (
        <section className={className}>
            <header>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                    Profile Information
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Update your account details and profile picture.
                </p>
            </header>

            <div className="mt-6 flex flex-col-reverse md:flex-row items-center md:items-start justify-between gap-8">
                <form onSubmit={submit} className="space-y-4 flex-1 w-full">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            className="w-full h-12 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>

                        {recentlySuccessful && (
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                Saved successfully!
                            </p>
                        )}
                    </div>
                </form>

                {/* Avatar Display & Upload Trigger */}
                <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 w-full md:w-72 text-center shrink-0 shadow-sm space-y-3">
                    <img
                        src={avatarUrl}
                        alt={user.name}
                        className="h-32 w-32 rounded-full shadow-md ring-4 ring-blue-500/20 object-cover"
                    />
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base">{user.name}</h3>
                        <p className="text-xs text-slate-400 truncate max-w-full px-2">{user.email}</p>
                    </div>

                    <input
                        type="file"
                        ref={fileInput}
                        onChange={handleAvatarChange}
                        accept="image/*"
                        className="hidden"
                    />
                </div>
            </div>
        </section>
    );
}
