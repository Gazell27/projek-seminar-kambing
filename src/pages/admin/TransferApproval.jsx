import { useState, useEffect } from 'react';
import { HiOutlineCheck, HiOutlineX, HiOutlineEye } from 'react-icons/hi';
import { paymentAPI } from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal, { ModalBody, ModalFooter } from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const TransferApproval = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('pending');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    const [showProofModal, setShowProofModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [rejectNotes, setRejectNotes] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchData();
    }, [pagination.page, status]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await paymentAPI.getAll({
                page: pagination.page,
                limit: pagination.limit,
                status,
            });
            setData(response.data.data);
            if (response.data.pagination) {
                setPagination(prev => ({ ...prev, ...response.data.pagination }));
            }
        } catch (error) {
            toast.error('Gagal memuat data pembayaran');
        } finally {
            setLoading(false);
        }
    };

    const viewProof = (payment) => {
        setSelectedPayment(payment);
        setShowProofModal(true);
    };

    const handleApprove = async (payment) => {
        if (!confirm('Konfirmasi pembayaran ini?')) return;

        setProcessing(true);
        try {
            await paymentAPI.approve(payment.id);
            toast.success('Pembayaran berhasil dikonfirmasi');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal mengkonfirmasi');
        } finally {
            setProcessing(false);
        }
    };

    const openRejectModal = (payment) => {
        setSelectedPayment(payment);
        setRejectNotes('');
        setShowRejectModal(true);
    };

    const handleReject = async () => {
        if (!rejectNotes.trim()) {
            toast.error('Alasan penolakan wajib diisi');
            return;
        }

        setProcessing(true);
        try {
            await paymentAPI.reject(selectedPayment.id, rejectNotes);
            toast.success('Pembayaran ditolak');
            setShowRejectModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menolak');
        } finally {
            setProcessing(false);
        }
    };

    const columns = [
        {
            header: 'No. Penjualan',
            render: (row) => row.penjualanHeader?.nomor_penjualan || '-'
        },
        {
            header: 'Pembeli',
            render: (row) => row.penjualanHeader?.nama_pembeli || '-'
        },
        {
            header: 'Metode',
            render: (row) => (
                <span className="capitalize">{row.paymentMethod?.name || row.method}</span>
            )
        },
        {
            header: 'Jumlah',
            render: (row) => (
                <span className="font-semibold text-emerald-600">{formatCurrency(row.amount)}</span>
            )
        },
        {
            header: 'Tanggal',
            render: (row) => formatDate(row.created_at)
        },
        {
            header: 'Status',
            render: (row) => <StatusBadge status={row.status} />
        },
        {
            header: 'Aksi',
            width: '180px',
            render: (row) => (
                <div className="flex items-center gap-2">
                    {row.proof_path && (
                        <button
                            onClick={() => viewProof(row)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Lihat Bukti"
                        >
                            <HiOutlineEye className="h-4 w-4" />
                        </button>
                    )}
                    {row.status === 'pending' && (
                        <>
                            <button
                                onClick={() => handleApprove(row)}
                                disabled={processing}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                title="Konfirmasi"
                            >
                                <HiOutlineCheck className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => openRejectModal(row)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                title="Tolak"
                            >
                                <HiOutlineX className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Konfirmasi Pembayaran</h1>
                <p className="mt-1 text-sm text-slate-500">Konfirmasi pembayaran transfer</p>
            </div>

            <div className="flex gap-2">
                {['pending', 'confirmed', 'rejected'].map(s => (
                    <button
                        key={s}
                        onClick={() => {
                            setStatus(s);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${status === s
                                ? 'bg-emerald-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {s === 'pending' ? 'Pending' : s === 'confirmed' ? 'Dikonfirmasi' : 'Ditolak'}
                    </button>
                ))}
            </div>

            <DataTable
                columns={columns}
                data={data}
                loading={loading}
                pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                emptyMessage="Tidak ada data pembayaran"
            />

            {/* Proof Modal */}
            <Modal isOpen={showProofModal} onClose={() => setShowProofModal(false)} title="Bukti Transfer" size="md">
                <ModalBody>
                    {selectedPayment?.proof_path && (
                        <img
                            src={`http://localhost:3001/${selectedPayment.proof_path}`}
                            alt="Bukti Transfer"
                            className="w-full rounded-xl"
                        />
                    )}
                </ModalBody>
            </Modal>

            {/* Reject Modal */}
            <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Tolak Pembayaran">
                <ModalBody>
                    <div>
                        <label className="form-label">Alasan Penolakan *</label>
                        <textarea
                            className="form-input"
                            rows={3}
                            value={rejectNotes}
                            onChange={(e) => setRejectNotes(e.target.value)}
                            placeholder="Masukkan alasan penolakan"
                        />
                    </div>
                </ModalBody>
                <ModalFooter>
                    <button onClick={() => setShowRejectModal(false)} className="btn-secondary">Batal</button>
                    <button onClick={handleReject} disabled={processing} className="btn-danger">
                        {processing ? 'Memproses...' : 'Tolak Pembayaran'}
                    </button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default TransferApproval;
