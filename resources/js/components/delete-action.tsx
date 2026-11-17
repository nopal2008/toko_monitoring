import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

/**
 * Tombol arsip dengan dialog konfirmasi. Backend melakukan soft delete,
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
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

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
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!processing) {
                    setOpen(next);
                }
            }}
        >
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="border-danger/40 text-danger-fg hover:bg-danger/10"
                >
                    {label}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{label} data ini?</DialogTitle>
                    <DialogDescription>
                        <strong className="font-medium text-foreground">
                            {itemName}
                        </strong>{' '}
                        akan diarsipkan dan tidak tampil lagi di daftar.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={processing}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={confirm}
                        loading={processing}
                    >
                        {processing ? 'Memproses...' : label}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
