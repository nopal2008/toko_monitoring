import { Head, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { Bell, FileText, Save, Sliders } from 'lucide-react';
import { TextField } from '@/components/fields';
import { Card, PageHeader, buttonClass } from '@/components/ui';
import AppLayout from '@/layouts/app-layout';
import { cn } from '@/lib/utils';
import { update as settingsUpdate } from '@/routes/settings';

type SettingItem = {
    id: number;
    setting_group: string;
    setting_key: string;
    value: string | null;
};

type Props = {
    settings: SettingItem[];
};

type SettingGroup = 'general' | 'notifications' | 'receipt';

function SettingsIndex({ settings }: Props) {
    const [activeTab, setActiveTab] = useState<SettingGroup>('general');

    // Buat map setting awal
    const initialMap: Record<string, string> = {
        'general.app_title': 'Store Monitoring',
        'general.company_phone': '',
        'general.company_address': '',
        'notifications.email_alerts': '1',
        'notifications.low_stock_threshold': '10',
        'receipt.footer_note': 'Terima kasih atas kunjungan Anda!',
        'receipt.tax_percentage': '11',
    };

    settings.forEach((s) => {
        initialMap[`${s.setting_group}.${s.setting_key}`] = s.value ?? '';
    });

    const [formData, setFormData] =
        useState<Record<string, string>>(initialMap);
    const form = useForm<{
        settings: {
            setting_group: string;
            setting_key: string;
            value: string | null;
        }[];
    }>({
        settings: [],
    });

    function handleChange(group: string, key: string, val: string) {
        setFormData((prev) => ({
            ...prev,
            [`${group}.${key}`]: val,
        }));
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();

        // Siapkan array settings untuk request PUT
        const payload = Object.entries(formData).map(([fullKey, value]) => {
            const [setting_group, setting_key] = fullKey.split('.');
            return {
                setting_group: setting_group ?? 'general',
                setting_key: setting_key ?? fullKey,
                value: value || null,
            };
        });

        form.transform(() => ({ settings: payload }));
        form.put(settingsUpdate.url(), {
            preserveScroll: true,
        });
    }

    const tabs = [
        { id: 'general' as const, label: 'Umum & Bisnis', icon: Sliders },
        {
            id: 'notifications' as const,
            label: 'Notifikasi & Peringatan',
            icon: Bell,
        },
        { id: 'receipt' as const, label: 'Struk & Kasir', icon: FileText },
    ];

    return (
        <>
            <Head title="Pengaturan" />
            <PageHeader
                title="Pengaturan Sistem"
                description="Konfigurasikan profil toko, parameter notifikasi, dan format struk belanja."
            />

            <div className="flex flex-col gap-6 lg:flex-row">
                {/* Tabs Sidebar */}
                <div className="w-full shrink-0 lg:w-60">
                    <Card className="p-2">
                        <nav
                            className="flex flex-row gap-1 lg:flex-col"
                            aria-label="Kategori Pengaturan"
                        >
                            {tabs.map((tab) => {
                                const active = tab.id === activeTab;
                                const Icon = tab.icon;

                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            'flex flex-1 items-center gap-2.5 rounded-md px-3.5 py-2.5 text-left text-sm font-medium transition',
                                            active
                                                ? 'bg-emerald-700 text-white shadow-sm'
                                                : 'text-slate-700 hover:bg-slate-100',
                                        )}
                                    >
                                        <Icon className="h-4 w-4 shrink-0" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </Card>
                </div>

                {/* Form Content */}
                <div className="flex-1">
                    <Card className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {activeTab === 'general' && (
                                <div className="space-y-4">
                                    <h2 className="text-base font-semibold text-slate-900">
                                        Profil & Informasi Toko
                                    </h2>
                                    <TextField
                                        id="gen-title"
                                        label="Nama Bisnis / Toko"
                                        value={
                                            formData['general.app_title'] ?? ''
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                'general',
                                                'app_title',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <TextField
                                        id="gen-phone"
                                        label="Nomor Telepon Layanan Pelanggan"
                                        value={
                                            formData['general.company_phone'] ??
                                            ''
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                'general',
                                                'company_phone',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <TextField
                                        id="gen-address"
                                        label="Alamat Kantor Pusat"
                                        value={
                                            formData[
                                                'general.company_address'
                                            ] ?? ''
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                'general',
                                                'company_address',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-4">
                                    <h2 className="text-base font-semibold text-slate-900">
                                        Parameter Notifikasi Stok & Sistem
                                    </h2>
                                    <TextField
                                        id="notif-threshold"
                                        label="Batas Peringatan Stok Minimum Default (Pcs)"
                                        type="number"
                                        value={
                                            formData[
                                                'notifications.low_stock_threshold'
                                            ] ?? ''
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                'notifications',
                                                'low_stock_threshold',
                                                e.target.value,
                                            )
                                        }
                                        hint="Sistem akan mengirim peringatan jika stok produk kurang dari nilai ini."
                                    />
                                </div>
                            )}

                            {activeTab === 'receipt' && (
                                <div className="space-y-4">
                                    <h2 className="text-base font-semibold text-slate-900">
                                        Format Struk & Pajak Transaksi
                                    </h2>
                                    <TextField
                                        id="rec-tax"
                                        label="Tarif Pajak Penjualan (PPN %)"
                                        type="number"
                                        value={
                                            formData[
                                                'receipt.tax_percentage'
                                            ] ?? ''
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                'receipt',
                                                'tax_percentage',
                                                e.target.value,
                                            )
                                        }
                                        hint="Persentase PPN yang diterapkan pada transaksi kasir."
                                    />
                                    <TextField
                                        id="rec-footer"
                                        label="Pesan Kaki Struk (Footer)"
                                        value={
                                            formData['receipt.footer_note'] ??
                                            ''
                                        }
                                        onChange={(e) =>
                                            handleChange(
                                                'receipt',
                                                'footer_note',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Terima kasih atas kunjungan Anda!"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end border-t border-slate-100 pt-4">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className={buttonClass('primary')}
                                >
                                    <Save className="h-4 w-4" />
                                    <span>
                                        {form.processing
                                            ? 'Menyimpan...'
                                            : 'Simpan Pengaturan'}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </>
    );
}

SettingsIndex.layout = (page: ReactNode) => <AppLayout>{page}</AppLayout>;

export default SettingsIndex;
