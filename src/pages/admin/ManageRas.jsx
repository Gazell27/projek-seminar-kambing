import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { rasAPI } from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal, { ModalBody, ModalFooter } from '../../components/common/Modal';
import toast from 'react-hot-toast';

const ManageRas = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [formData, setFormData] = useState({ nama_ras: '', keterangan: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [pagination.page, search]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await rasAPI.getAll({
                page: pagination.page,
                limit: pagination.limit,
                search
            });
            setData(response.data.data);
            if (response.data.pagination) {
                setPagination(prev => ({ ...prev, ...response.data.pagination }));
            }
        } catch (error) {
            toast.error('Gagal memuat data ras');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditData(null);
        setFormData({ nama_ras: '', keterangan: '' });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditData(item);
        setFormData({ nama_ras: item.nama_ras, keterangan: item.keterangan || '' });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.nama_ras.trim()) {
            toast.error('Nama ras wajib diisi');
            return;
        }

        setSaving(true);
        try {
            if (editData) {
                await rasAPI.update(editData.id, formData);
                toast.success('Ras berhasil diperbarui');
            } else {
                await rasAPI.create(formData);
                toast.success('Ras berhasil ditambahkan');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan ras');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`Hapus ras "${item.nama_ras}"?`)) return;

        try {
            await rasAPI.delete(item.id);
            toast.success('Ras berhasil dihapus');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus ras');
        }
    };

    const columns = [
        { header: 'Kode', accessor: 'kode_ras', width: '120px' },
        { header: 'Nama Ras', accessor: 'nama_ras' },
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Data Ras</h1>
                    <p className="mt-1 text-sm text-slate-500">Kelola data jenis ras kambing</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary">
                    <HiOutlinePlus className="h-5 w-5" />
                    Tambah Ras
                </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4">
                <input
                    type="text"
                    placeholder="Cari ras..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="form-input max-w-xs"
                />
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={data}
                loading={loading}
                pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                emptyMessage="Belum ada data ras"
            />

            {/* Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editData ? 'Edit Ras' : 'Tambah Ras'}
            >
                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <div className="space-y-4">
                            <div>
                                <label className="form-label">Nama Ras *</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={formData.nama_ras}
                                    onChange={(e) => setFormData({ ...formData, nama_ras: e.target.value })}
                                    placeholder="Masukkan nama ras"
                                />
                            </div>
                            <div>
                                <label className="form-label">Keterangan</label>
                                <textarea
                                    className="form-input"
                                    rows={3}
                                    value={formData.keterangan}
                                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                                    placeholder="Deskripsi ras (opsional)"
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

export default ManageRas;
