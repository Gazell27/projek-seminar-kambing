import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Filter, Search, Download, ClipboardList } from 'lucide-react';
import { kambingAPI, rasAPI, estimasiAPI } from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal, { ModalBody, ModalFooter } from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ManageKambing = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    const [showModal, setShowModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [formData, setFormData] = useState({
        kode_kambing: '',
        ras_id: '',
        tanggal_masuk: '',
        range_berat: '',
        harga_beli: '',
        jenis_kelamin: 'Jantan',
        status: 'Tersedia',
        estimasi_harga_id: '',
    });
    const [saving, setSaving] = useState(false);

    // Options
    const [rasOptions, setRasOptions] = useState([]);
    const [estimasiOptions, setEstimasiOptions] = useState([]);

    useEffect(() => {
        fetchData();
    }, [pagination.page, search, statusFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await kambingAPI.getAll({
                page: pagination.page,
                limit: pagination.limit,
                search,
                status: statusFilter,
            });
            setData(response.data.data);
            if (response.data.pagination) {
                setPagination(prev => ({ ...prev, ...response.data.pagination }));
            }
        } catch (error) {
            toast.error('Gagal memuat data kambing');
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            const [rasRes, estimasiRes] = await Promise.all([
                rasAPI.getAll({ limit: 100 }),
                estimasiAPI.getAll()
            ]);
            setRasOptions(rasRes.data.data);
            setEstimasiOptions(estimasiRes.data.data);
        } catch (error) {
            toast.error('Gagal memuat opsi pilihan');
        }
    };

    const openCreateModal = () => {
        setEditData(null);
        setFormData({
            kode_kambing: '',
            ras_id: '',
            tanggal_masuk: new Date().toISOString().split('T')[0],
            range_berat: '',
            harga_beli: '',
            jenis_kelamin: 'Jantan',
            status: 'Tersedia',
            estimasi_harga_id: '',
        });
        fetchOptions();
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditData(item);
        setFormData({
            kode_kambing: item.kode_kambing,
            ras_id: item.ras_id,
            tanggal_masuk: item.tanggal_masuk.split('T')[0],
            range_berat: item.range_berat,
            harga_beli: item.harga_beli,
            jenis_kelamin: item.jenis_kelamin,
            status: item.status,
            estimasi_harga_id: item.estimasi_harga_id,
        });
        fetchOptions();
        setShowModal(true);
    };

    const handleRangeChange = (e) => {
        const rangeValue = e.target.value;
        const selectedEstimasi = estimasiOptions.find(opt => opt.range_berat === rangeValue);

        setFormData(prev => ({
            ...prev,
            range_berat: rangeValue,
            estimasi_harga_id: selectedEstimasi ? selectedEstimasi.id : prev.estimasi_harga_id
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editData) {
                await kambingAPI.update(editData.id, formData);
                toast.success('Data kambing berhasil diperbarui');
            } else {
                await kambingAPI.create(formData);
                toast.success('Kambing berhasil ditambahkan');
            }
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menyimpan data');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`Hapus data kambing ${item.kode_kambing}?`)) return;

        try {
            await kambingAPI.delete(item.id);
            toast.success('Data berhasil dihapus');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus');
        }
    };

    const columns = [
        {
            header: 'Keluarga / Ras',
            render: (row) => (
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                        <ClipboardList size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900 leading-none mb-1">{row.kode_kambing}</p>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{row.ras?.nama_ras || 'Unknown'}</p>
                    </div>
                </div>
            )
        },
        { header: 'Gender', render: (row) => <span className="text-sm font-bold text-slate-600">{row.jenis_kelamin}</span> },
        { header: 'Tgl Masuk', render: (row) => <span className="text-sm font-semibold text-slate-500">{formatDate(row.tanggal_masuk)}</span> },
        { header: 'Berat (Kg)', accessor: 'range_berat' },
        {
            header: 'Estimasi Jual',
            render: (row) => <span className="font-bold text-emerald-600">{formatCurrency(row.estimasiHarga?.estimasi_harga)}</span>
        },
        { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
        {
            header: 'Aksi',
            width: '120px',
            render: (row) => (
                <div className="flex items-center gap-1">
                    <button onClick={() => openEditModal(row)} className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 transition-all">
                        <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(row)} className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Data Kambing</h1>
                    <p className="mt-1 text-slate-500 font-medium">Kelola seluruh stok kambing di peternakan.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary px-4">
                        <Download size={18} />
                        Export
                    </button>
                    <button onClick={openCreateModal} className="btn-primary">
                        <Plus size={20} strokeWidth={2.5} />
                        Tambah Kambing
                    </button>
                </div>
            </div>

            {/* Filters Card */}
            <div className="card bg-white/50 backdrop-blur-sm shadow-sm border-slate-200/50">
                <div className="card-body p-4 flex flex-col md:flex-row items-center gap-4">
                    <div className="relative flex-1 w-full max-w-md group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari kode atau ras..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPagination(prev => ({ ...prev, page: 1 }));
                            }}
                            className="w-full bg-white border border-slate-200 rounded-[1.25rem] pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500/50 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                            {['', 'Tersedia', 'Terjual', 'Sakit'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setStatusFilter(s)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${statusFilter === s
                                        ? 'bg-white text-emerald-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {s === '' ? 'Semua' : s}
                                </button>
                            ))}
                        </div>
                        <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <DataTable
                columns={columns}
                data={data}
                loading={loading}
                pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                emptyMessage="Data kambing tidak ditemukan"
            />

            {/* Form Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editData ? 'Edit Data Kambing' : 'Tambah Kambing Baru'}
                size="lg"
            >
                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-6">
                                <div>
                                    <label className="form-label">Kode Kambing</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: KMB-001"
                                        className="form-input"
                                        value={formData.kode_kambing}
                                        onChange={(e) => setFormData({ ...formData, kode_kambing: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Jenis Ras</label>
                                    <select
                                        required
                                        className="form-input form-select"
                                        value={formData.ras_id}
                                        onChange={(e) => setFormData({ ...formData, ras_id: e.target.value })}
                                    >
                                        <option value="">Pilih Ras</option>
                                        {rasOptions.map(r => (
                                            <option key={r.id} value={r.id}>{r.nama_ras}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Jenis Kelamin</label>
                                        <div className="flex p-1 bg-slate-100 rounded-xl">
                                            {['Jantan', 'Betina'].map(g => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, jenis_kelamin: g })}
                                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${formData.jenis_kelamin === g
                                                        ? 'bg-white text-emerald-600 shadow-sm'
                                                        : 'text-slate-500'
                                                        }`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="form-label">Range Berat (Kg)</label>
                                        <select
                                            required
                                            className="form-input form-select"
                                            value={formData.range_berat}
                                            onChange={handleRangeChange}
                                        >
                                            <option value="">Pilih Range</option>
                                            {[...new Set(estimasiOptions.map(e => e.range_berat))].map(range => (
                                                <option key={range} value={range}>{range} Kg</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="form-label">Tanggal Masuk</label>
                                    <input
                                        type="date"
                                        required
                                        className="form-input"
                                        value={formData.tanggal_masuk}
                                        onChange={(e) => setFormData({ ...formData, tanggal_masuk: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="form-label">Harga Beli Peternak</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold group-focus-within:text-emerald-600">Rp</div>
                                        <input
                                            type="number"
                                            required
                                            placeholder="0"
                                            className="form-input pl-11"
                                            value={formData.harga_beli}
                                            onChange={(e) => setFormData({ ...formData, harga_beli: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Estimasi Harga Jual</label>
                                    <select
                                        required
                                        className="form-input form-select"
                                        value={formData.estimasi_harga_id}
                                        onChange={(e) => setFormData({ ...formData, estimasi_harga_id: e.target.value })}
                                    >
                                        <option value="">Pilih Estimasi</option>
                                        {estimasiOptions.map(e => (
                                            <option key={e.id} value={e.id}>{e.range_berat} - {formatCurrency(e.estimasi_harga)}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="form-label">Status Unit</label>
                                    <select
                                        className="form-input form-select"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Tersedia">Tersedia</option>
                                        <option value="Terjual">Terjual</option>
                                        <option value="Sakit">Sakit</option>
                                        <option value="Mati">Mati</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                            Batal
                        </button>
                        <button type="submit" disabled={saving} className="btn-primary min-w-[140px]">
                            {saving ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    Menyimpan
                                </div>
                            ) : 'Simpan Data'}
                        </button>
                    </ModalFooter>
                </form>
            </Modal>
        </div>
    );
};

export default ManageKambing;
