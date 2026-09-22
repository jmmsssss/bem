import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-xl font-extrabold text-red-600 dark:text-red-400">
                    Delete Account
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Once the account is deleted, all projects and tasks within it will be permanently deleted.
                </p>
            </header>
            <button type="button" onClick={confirmUserDeletion}
                className="h-11 px-6 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-sm transition">
                Delete Account
            </button>

            {/* Modal Konfirmasi Hapus Akun Modern */}
            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser}
                    className="p-8 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white">
                        Are you sure you want to delete your account?
                    </h2>

                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        This action cannot be undone. Enter your account password to confirm permanent deletion.
                    </p>

                    <div className="mt-5">
                        <input id="password" type="password" name="password" ref={passwordInput} value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className="w-full h-12 px-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 transition shadow-sm"
                            placeholder="Password Anda..."
                        />
                        <InputError message={errors.password} className="mt-1.5" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={closeModal}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">
                            Cancel
                        </button>

                        <button type="submit" disabled={processing}
                            className="h-11 px-6 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition shadow-sm disabled:opacity-50">
                            {processing ? 'Deleting...' : 'Yes, Delete Account'}
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
