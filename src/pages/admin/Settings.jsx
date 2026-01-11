import { useState, useEffect } from 'react';
import { settingsAPI } from '../../api/axios';
import toast from 'react-hot-toast';

const Settings = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await settingsAPI.getAll();
            setSettings(response.data.data || {});
        } catch (error) {
            toast.error('Gagal memuat pengaturan');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await settingsAPI.update(settings);
            toast.success('Pengaturan berhasil disimpan');
        } catch (error) {
            toast.error('Gagal menyimpan pengaturan');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Pengaturan</h1>
                <p className="mt-1 text-sm text-slate-500">Konfigurasi aplikasi</p>
            </div>

            <div className="card">
                <div className="card-body space-y-6">
                    <h3 className="font-semibold text-slate-800">Informasi Peternakan</h3>

                    <div>
                        <label className="form-label">Nama Peternakan</label>
                        <input
                            type="text"
                            className="form-input"
                            value={settings.nama_peternakan || ''}
                            onChange={(e) => handleChange('nama_peternakan', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="form-label">Alamat</label>
                        <textarea
                            className="form-input"
                            rows={2}
                            value={settings.alamat || ''}
                            onChange={(e) => handleChange('alamat', e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="form-label">Telepon</label>
                        <input
                            type="text"
                            className="form-input"
                            value={settings.telepon || ''}
                            onChange={(e) => handleChange('telepon', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-body space-y-6">
                    <h3 className="font-semibold text-slate-800">Notifikasi</h3>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-700">Email Notifikasi</p>
                            <p className="text-sm text-slate-500">Kirim notifikasi via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.email_notifikasi === '1'}
                                onChange={(e) => handleChange('email_notifikasi', e.target.checked ? '1' : '0')}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-700">Notifikasi Stok Rendah</p>
                            <p className="text-sm text-slate-500">Peringatan saat stok menipis</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.notif_stok_rendah === '1'}
                                onChange={(e) => handleChange('notif_stok_rendah', e.target.checked ? '1' : '0')}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-slate-700">Notifikasi Transaksi Baru</p>
                            <p className="text-sm text-slate-500">Pemberitahuan saat ada transaksi baru</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={settings.notif_transaksi_baru === '1'}
                                onChange={(e) => handleChange('notif_transaksi_baru', e.target.checked ? '1' : '0')}
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button onClick={handleSave} disabled={saving} className="btn-primary">
                    {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </button>
            </div>
        </div>
    );
};

export default Settings;
