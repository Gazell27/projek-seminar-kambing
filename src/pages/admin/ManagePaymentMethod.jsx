import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { paymentMethodAPI } from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal, { ModalBody, ModalFooter } from '../../components/common/Modal';
import toast from 'react-hot-toast';

const ManagePaymentMethod = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'bank',
        account_name: '',
        account_number: '',
        is_active: true
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await paymentMethodAPI.getAll();
            setData(response.data.data);
        } catch (error) {
            toast.error('Gagal memuat data metode pembayaran');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditData(null);
        setFormData({
            name: '',
            type: 'bank',
            account_name: '',
            account_number: '',
            is_active: true
        });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditData(item);
        setFormData({
            name: item.name,
            type: item.type,
            account_name: item.account_name,
            account_number: item.account_number,
            is_active: item.is_active
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.account_name.trim() || !formData.account_number.trim()) {
            toast.error('Semua field wajib diisi');
            return;
        }

        setSaving(true);
        try {
            if (editData) {
                await paymentMethodAPI.update(editData.id, formData);
                toast.success('Metode pembayaran berhasil diperbarui');
            } else {
                await paymentMethodAPI.create(formData);
                toast.success('Metode pembayaran berhasil ditambahkan');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan metode pembayaran');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`Hapus metode pembayaran "${item.name}"?`)) return;

        try {
            await paymentMethodAPI.delete(item.id);
            toast.success('Metode pembayaran berhasil dihapus');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus metode pembayaran');
        }
    };

    const columns = [
        { header: 'Nama', accessor: 'name' },
        {
            header: 'Tipe',
            render: (row) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.type === 'bank' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                    {row.type === 'bank' ? 'Bank' : 'E-Wallet'}
                </span>
            )
        },
        { header: 'Nama Akun', accessor: 'account_name' },
        { header: 'Nomor Akun', accessor: 'account_number' },
        {
            header: 'Status',
            render: (row) => (
                <div className="flex items-center gap-1">
                    {row.is_active ? (
                        <><HiCheckCircle className="text-emerald-500 h-5 w-5" /> <span className="text-emerald-600 text-sm">Aktif</span></>
                    ) : (
                        <><HiXCircle className="text-slate-400 h-5 w-5" /> <span className="text-slate-500 text-sm">Non-aktif</span></>
                    )}
                </div>
            )
        },
        {
            header: 'Aksi',
            width: '120px',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => openEditModal(row)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                        <HiOutlinePencil className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(row)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <HiOutlineTrash className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Metode Pembayaran</h1>
                    <p className="mt-1 text-sm text-slate-500">Kelola akun bank dan e-wallet untuk pembayaran</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary">
                    <HiOutlinePlus className="h-5 w-5" />
                    Tambah Metode
                </button>
            </div>

            <DataTable
                columns={columns}
                data={data}
                loading={loading}
                emptyMessage="Belum ada data metode pembayaran"
            />

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editData ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}
            >
                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <div className="space-y-4">
                            <div>
                                <label className="form-label">Nama (Contoh: BCA / Dana) *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Tipe *</label>
                                <select
                                    className="form-input"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="bank">Bank</option>
                                    <option value="ewallet">E-Wallet</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Atas Nama *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.account_name}
                                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label">Nomor Rekening / HP *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.account_number}
                                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                />
                                <label htmlFor="is_active" className="text-sm text-slate-700">Aktifkan metode pembayaran ini</label>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                            Batal
                        </button>
                        <button type="submit" disabled={saving} className="btn-primary">
                            {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </ModalFooter>
                </form>
            </Modal>
        </div>
    );
};

export default ManagePaymentMethod;
