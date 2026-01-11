import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { estimasiAPI } from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal, { ModalBody, ModalFooter } from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const ManageEstimasi = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [formData, setFormData] = useState({ range_berat: '', estimasi_harga: '', keterangan: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [pagination.page, search]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await estimasiAPI.getAll({
                page: pagination.page,
                limit: pagination.limit,
                search
            });
            setData(response.data.data);
            if (response.data.pagination) {
                setPagination(prev => ({ ...prev, ...response.data.pagination }));
            }
        } catch (error) {
            toast.error('Gagal memuat data estimasi');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditData(null);
        setFormData({ range_berat: '', estimasi_harga: '', keterangan: '' });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditData(item);
        setFormData({
            range_berat: item.range_berat,
            estimasi_harga: item.estimasi_harga,
            keterangan: item.keterangan || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.range_berat.trim() || !formData.estimasi_harga) {
            toast.error('Range berat dan estimasi harga wajib diisi');
            return;
        }

        setSaving(true);
        try {
            if (editData) {
                await estimasiAPI.update(editData.id, formData);
                toast.success('Estimasi berhasil diperbarui');
            } else {
                await estimasiAPI.create(formData);
                toast.success('Estimasi berhasil ditambahkan');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan estimasi');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`Hapus estimasi "${item.range_berat}"?`)) return;

        try {
            await estimasiAPI.delete(item.id);
            toast.success('Estimasi berhasil dihapus');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus estimasi');
        }
    };

    const columns = [
        { header: 'Kode', accessor: 'kode_estimasi', width: '120px' },
        { header: 'Range Berat', accessor: 'range_berat' },
        {
            header: 'Estimasi Harga',
            render: (row) => (
                <span className="font-semibold text-emerald-600">{formatCurrency(row.estimasi_harga)}</span>
            )
        },
        {
            header: 'Keterangan',
            render: (row) => (
                <span className="text-slate-500">{row.keterangan || '-'}</span>
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
                    <h1 className="text-2xl font-semibold text-slate-900">Estimasi Harga</h1>
                    <p className="mt-1 text-sm text-slate-500">Kelola estimasi harga berdasarkan berat</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary">
                    <HiOutlinePlus className="h-5 w-5" />
                    Tambah Estimasi
                </button>
            </div>

            <div className="flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Cari estimasi..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="form-input max-w-xs"
                />
            </div>

            <DataTable
                columns={columns}
                data={data}
                loading={loading}
                pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                emptyMessage="Belum ada data estimasi"
            />

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editData ? 'Edit Estimasi' : 'Tambah Estimasi'}
            >
                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <div className="space-y-4">
                            <div>
                                <label className="form-label">Range Berat *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.range_berat}
                                    onChange={(e) => setFormData({ ...formData, range_berat: e.target.value })}
                                    placeholder="Contoh: 20-25 kg"
                                />
                            </div>
                            <div>
                                <label className="form-label">Estimasi Harga *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.estimasi_harga}
                                    onChange={(e) => setFormData({ ...formData, estimasi_harga: e.target.value })}
                                    placeholder="Masukkan harga"
                                />
                            </div>
                            <div>
                                <label className="form-label">Keterangan</label>
                                <textarea
                                    className="form-input"
                                    rows={3}
                                    value={formData.keterangan}
                                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                                    placeholder="Deskripsi (opsional)"
                                />
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

export default ManageEstimasi;
