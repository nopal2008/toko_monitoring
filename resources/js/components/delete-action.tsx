import { router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { buttonClass } from '@/components/ui';

/**
 * Tombol hapus dengan dialog konfirmasi. Backend melakukan soft delete,
 * jadi teksnya menyebut "arsipkan".
 */
export function DeleteAction({
    url,
    itemName,
    label = 'Arsipkan',
    redirectOnSuccess = false,
}: {
    url: string;
    itemName: string;
    label?: string;
    redirectOnSuccess?: boolean;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const dialog = dialogRef.current;

        if (!dialog) {
            return;
        }

        if (open && !dialog.open) {
            dialog.showModal();
        }

        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    function confirm() {
        if (processing) {
            return;
        }

        router.delete(url, {
            preserveScroll: !redirectOnSuccess,
            onStart: () => setProcessing(true),
            onFinish: () => {
                setProcessing(false);
                setOpen(false);
            },
        });
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={buttonClass(
                    'secondary',
                    'border-red-300 text-red-700 hover:bg-red-50',
                )}
            >
                {label}
            </button>
            <dialog
                ref={dialogRef}
                onClose={() => setOpen(false)}
                aria-labelledby="delete-dialog-title"
                className="m-auto w-[calc(100%-2rem)] max-w-md rounded-lg p-0 shadow-xl backdrop:bg-slate-900/50"
            >
                <div className="p-6">
                    <h2
                        id="delete-dialog-title"
                        className="text-lg font-semibold text-slate-900"
                    >
                        {label} data ini?
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        <strong className="font-medium">{itemName}</strong>{' '}
                        akan diarsipkan dan tidak tampil lagi di daftar.
                    </p>
                    <div className="mt-6 flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            disabled={processing}
                            className={buttonClass('secondary')}
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={confirm}
                            disabled={processing}
                            className={buttonClass('danger')}
                        >
                            {processing ? 'Memproses...' : label}
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
