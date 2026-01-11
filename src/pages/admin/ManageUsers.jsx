import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { usersAPI } from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal, { ModalBody, ModalFooter } from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const ManageUsers = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', role: 'kasir', password: '', is_active: true
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, [pagination.page, search]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await usersAPI.getAll({ page: pagination.page, limit: pagination.limit, search });
            setData(response.data.data);
            if (response.data.pagination) setPagination(prev => ({ ...prev, ...response.data.pagination }));
        } catch (error) {
            toast.error('Gagal memuat data users');
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditData(null);
        setFormData({ name: '', email: '', phone: '', role: 'kasir', password: '', is_active: true });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditData(item);
        setFormData({ name: item.name, email: item.email, phone: item.phone || '', role: item.role, password: '', is_active: item.is_active });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email) {
            toast.error('Nama dan email wajib diisi');
            return;
        }
        if (!editData && !formData.password) {
            toast.error('Password wajib diisi untuk user baru');
            return;
        }

        setSaving(true);
        try {
            const payload = { ...formData };
            if (!payload.password) delete payload.password;

            if (editData) {
                await usersAPI.update(editData.id, payload);
                toast.success('User berhasil diperbarui');
            } else {
                await usersAPI.create(payload);
                toast.success('User berhasil ditambahkan');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan user');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`Hapus user "${item.name}"?`)) return;
        try {
            await usersAPI.delete(item.id);
            toast.success('User berhasil dihapus');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus user');
        }
    };

    const columns = [
        { header: 'Kode', accessor: 'kode_user', width: '100px' },
        { header: 'Nama', accessor: 'name' },
        { header: 'Email', accessor: 'email' },
        { header: 'Role', render: (row) => <StatusBadge status={row.role} /> },
        { header: 'Status', render: (row) => <StatusBadge status={row.is_active ? 'active' : 'inactive'} /> },
        {
            header: 'Aksi', width: '120px',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => openEditModal(row)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg">
                        <HiOutlinePencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(row)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
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
                    <h1 className="text-2xl font-semibold text-slate-900">Manajemen Users</h1>
                    <p className="mt-1 text-sm text-slate-500">Kelola akun pengguna</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary">
                    <HiOutlinePlus className="h-5 w-5" />
                    Tambah User
                </button>
            </div>

            <input type="text" placeholder="Cari user..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPagination(prev => ({ ...prev, page: 1 })); }}
                className="form-input max-w-xs" />

            <DataTable columns={columns} data={data} loading={loading} pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))} emptyMessage="Belum ada user" />

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit User' : 'Tambah User'}>
                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <div className="space-y-4">
                            <div>
                                <label className="form-label">Nama *</label>
                                <input type="text" className="form-input" value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="form-label">Email *</label>
                                <input type="email" className="form-input" value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                            <div>
                                <label className="form-label">Phone</label>
                                <input type="text" className="form-input" value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="form-label">Role</label>
                                <select className="form-input" value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="kasir">Kasir</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">{editData ? 'Password (kosongkan jika tidak diubah)' : 'Password *'}</label>
                                <input type="password" className="form-input" value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" id="is_active" checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} />
                                <label htmlFor="is_active" className="text-sm">Aktif</label>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Batal</button>
                        <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan'}</button>
                    </ModalFooter>
                </form>
            </Modal>
        </div>
    );
};

export default ManageUsers;
