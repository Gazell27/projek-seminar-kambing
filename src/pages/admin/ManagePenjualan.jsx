import { useState, useEffect, useRef } from 'react';
import { HiOutlinePlus, HiOutlineEye, HiOutlineTrash, HiOutlinePrinter } from 'react-icons/hi';
import { penjualanAPI, kambingAPI, paymentAPI, settingsAPI } from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import Modal, { ModalBody, ModalFooter } from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';
import { useReactToPrint } from 'react-to-print';
import Invoice from '../../components/features/Invoice';

const ManagePenjualan = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    // Create Sale Modal
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [kambingList, setKambingList] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);

    // Form data
    const [formData, setFormData] = useState({
        nama_pembeli: '',
        nomor_contact: '',
        alamat_pembeli: '',
        items: [],
        metode_pembayaran: 'cash',
        payment_method_id: '',
        bukti_transfer: null,
    });
    const [saving, setSaving] = useState(false);

    // Detail Modal
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [detailData, setDetailData] = useState(null);
    const [settings, setSettings] = useState({});

    const invoiceRef = useRef();
    const handlePrint = useReactToPrint({
        contentRef: invoiceRef,
    });

    useEffect(() => {
        fetchData();
        fetchSettings();
    }, [pagination.page, search]);

    const fetchSettings = async () => {
        try {
            const response = await settingsAPI.getAll();
            setSettings(response.data.data || {});
        } catch (error) {
            console.error('Failed to fetch settings');
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await penjualanAPI.getAll({
                page: pagination.page,
                limit: pagination.limit,
                search,
            });
            setData(response.data.data);
            if (response.data.pagination) {
                setPagination(prev => ({ ...prev, ...response.data.pagination }));
            }
        } catch (error) {
            toast.error('Gagal memuat data penjualan');
        } finally {
            setLoading(false);
        }
    };

    const fetchOptions = async () => {
        try {
            const [kambingRes, methodsRes] = await Promise.all([
                kambingAPI.getTersedia(),
                paymentAPI.getMethods(),
            ]);
            setKambingList(kambingRes.data.data);
            setPaymentMethods(methodsRes.data.data);
        } catch (error) {
            console.error('Failed to fetch options');
        }
    };

    const openCreateModal = () => {
        setCurrentStep(1);
        setFormData({
            nama_pembeli: '',
            nomor_contact: '',
            alamat_pembeli: '',
            items: [],
            metode_pembayaran: 'cash',
            payment_method_id: '',
            bukti_transfer: null,
        });
        fetchOptions();
        setShowModal(true);
    };

    const [memberPoints, setMemberPoints] = useState(0);
    const [memberName, setMemberName] = useState('');
    const [usePoints, setUsePoints] = useState(false);
    const [checkingPoints, setCheckingPoints] = useState(false);

    const checkMemberPoints = async () => {
        if (!formData.nomor_contact) return;
        setCheckingPoints(true);
        try {
            // Remove non-digits to match backend logic
            const contact = formData.nomor_contact.replace(/\D/g, '');
            const res = await penjualanAPI.checkPoints(contact);
            if (res.data.success && res.data.data.exists) {
                setMemberPoints(res.data.data.points);
                setMemberName(res.data.data.name);
                if (res.data.data.points > 0) {
                    toast.success(`Member ${res.data.data.name} memiliki ${res.data.data.points} poin`);
                }
            } else {
                setMemberPoints(0);
                setMemberName('');
            }
        } catch (err) {
            console.error(err);
            setMemberPoints(0);
            setMemberName('');
        } finally {
            setCheckingPoints(false);
        }
    };

    const nextStep = () => {
        if (currentStep === 1) {
            if (!formData.nama_pembeli || !formData.nomor_contact) {
                toast.error('Nama pembeli dan nomor kontak wajib diisi');
                return;
            }
            // Check points when finishing Step 1 (Buyer Data)
            checkMemberPoints();
            setCurrentStep(2);
        } else if (currentStep === 2) {
            if (formData.items.length === 0) {
                toast.error('Pilih minimal 1 kambing');
                return;
            }
            setCurrentStep(3);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const addKambing = (kambing) => {
        if (formData.items.find(i => i.kambing_id === kambing.id)) {
            toast.error('Kambing sudah dipilih');
            return;
        }
        const hargaJual = kambing.estimasiHarga?.estimasi_harga || 0;
        setFormData({
            ...formData,
            items: [...formData.items, {
                kambing_id: kambing.id,
                kode_kambing: kambing.kode_kambing,
                ras: kambing.ras?.nama_ras,
                jenis_kelamin: kambing.jenis_kelamin,
                harga_jual: hargaJual,
            }],
        });
    };

    const removeKambing = (index) => {
        setFormData({
            ...formData,
            items: formData.items.filter((_, i) => i !== index),
        });
    };

    const calculateTotals = () => {
        const subtotal = formData.items.reduce((sum, item) => sum + item.harga_jual, 0);

        let discount = 0;
        let pointsUsed = 0;

        if (usePoints && memberPoints > 0) {
            const maxValue = memberPoints * 1000;
            if (maxValue >= subtotal) {
                discount = subtotal;
                pointsUsed = Math.ceil(subtotal / 1000);
            } else {
                discount = maxValue;
                pointsUsed = memberPoints;
            }
        }

        const total = subtotal - discount;
        return { subtotal, discount, total, pointsUsed };
    };

    const { subtotal, discount, total, pointsUsed } = calculateTotals();

    const handleSubmit = async () => {
        if (formData.metode_pembayaran === 'transfer') {
            if (!formData.payment_method_id) {
                toast.error('Pilih metode pembayaran');
                return;
            }
            if (!formData.bukti_transfer) {
                toast.error('Upload bukti transfer');
                return;
            }
        }

        setSaving(true);
        try {
            await penjualanAPI.create({
                ...formData,
                points_redeemed: pointsUsed
            });
            toast.success(
                formData.metode_pembayaran === 'cash'
                    ? 'Transaksi berhasil!'
                    : 'Transaksi dibuat, menunggu konfirmasi admin'
            );
            setShowModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal membuat transaksi');
        } finally {
            setSaving(false);
        }
    };

    // ... (rest of logic) ...


    const handleDelete = async (item) => {
        if (!confirm(`Hapus penjualan ${item.nomor_penjualan}?`)) return;

        try {
            await penjualanAPI.delete(item.id);
            toast.success('Penjualan berhasil dihapus');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Gagal menghapus');
        }
    };

    const viewDetail = async (item) => {
        try {
            const response = await penjualanAPI.getById(item.id);
            setDetailData(response.data.data);
            setShowDetailModal(true);
        } catch (error) {
            toast.error('Gagal memuat detail');
        }
    };

    const handlePrintFromTable = async (item) => {
        try {
            const response = await penjualanAPI.getById(item.id);
            setDetailData(response.data.data);
            // We need to wait for the state to update and the component to render
            // But ReactToPrint handles its own trigger. 
            // However, to print directly from table without opening modal, 
            // we might need a hidden component or use the same detailData state.
        } catch (error) {
            toast.error('Gagal memuat data cetak');
        }
    };

    const columns = [
        { header: 'No. Penjualan', accessor: 'nomor_penjualan', width: '130px' },
        { header: 'Tanggal', render: (row) => formatDate(row.tanggal_penjualan) },
        { header: 'Pembeli', accessor: 'nama_pembeli' },
        { header: 'Jumlah', render: (row) => `${row.details?.length || 0} kambing` },
        { header: 'Total', render: (row) => <span className="font-semibold text-emerald-600">{formatCurrency(row.total)}</span> },
        { header: 'Status', render: (row) => <StatusBadge status={row.payment_status} /> },
        {
            header: 'Aksi',
            width: '120px',
            render: (row) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => viewDetail(row)} title="Tampilkan Detail" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                        <HiOutlineEye className="h-4 w-4" />
                    </button>
                    <button
                        onClick={async () => {
                            const response = await penjualanAPI.getById(row.id);
                            setDetailData(response.data.data);
                            // SetTimeout to ensure state is updated and DOM is ready
                            setTimeout(() => {
                                handlePrint();
                            }, 100);
                        }}
                        title="Cetak Invoice"
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                    >
                        <HiOutlinePrinter className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(row)} title="Hapus" className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <HiOutlineTrash className="h-4 w-4" />
                    </button>
                </div>
            ),
        },
    ];

    const bankMethods = paymentMethods.filter(m => m.type === 'bank');
    const ewalletMethods = paymentMethods.filter(m => m.type === 'ewallet');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Penjualan</h1>
                    <p className="mt-1 text-sm text-slate-500">Kelola transaksi penjualan</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary">
                    <HiOutlinePlus className="h-5 w-5" />
                    Buat Transaksi
                </button>
            </div>

            <input
                type="text"
                placeholder="Cari penjualan..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="form-input max-w-xs"
            />

            <DataTable
                columns={columns}
                data={data}
                loading={loading}
                pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                emptyMessage="Belum ada data penjualan"
            />

            {/* Create Sale Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Buat Transaksi" size="lg">
                <ModalBody>
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-4 mb-6">
                        {[1, 2, 3].map(step => (
                            <div key={step} className="flex items-center gap-2">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= step ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                                    }`}>
                                    {step}
                                </div>
                                <span className={`text-sm ${currentStep >= step ? 'text-slate-800' : 'text-slate-400'}`}>
                                    {step === 1 ? 'Data Pembeli' : step === 2 ? 'Pilih Kambing' : 'Pembayaran'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Buyer Data */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <div>
                                <label className="form-label">Nama Pembeli *</label>
                                <input type="text" className="form-input" value={formData.nama_pembeli}
                                    onChange={(e) => setFormData({ ...formData, nama_pembeli: e.target.value })} />
                            </div>
                            <div>
                                <label className="form-label">Nomor Kontak *</label>
                                <input type="text" className="form-input" value={formData.nomor_contact}
                                    onChange={(e) => setFormData({ ...formData, nomor_contact: e.target.value })} />
                            </div>
                            <div>
                                <label className="form-label">Alamat</label>
                                <textarea className="form-input" rows={2} value={formData.alamat_pembeli}
                                    onChange={(e) => setFormData({ ...formData, alamat_pembeli: e.target.value })} />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Select Kambing */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <div className="border rounded-xl p-4 max-h-48 overflow-y-auto">
                                <p className="text-sm text-slate-500 mb-2">Pilih kambing:</p>
                                <div className="space-y-2">
                                    {kambingList.filter(k => !formData.items.find(i => i.kambing_id === k.id)).map(kambing => (
                                        <div key={kambing.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                            <div>
                                                <span className="font-medium">{kambing.kode_kambing}</span>
                                                <span className="text-slate-500 text-sm ml-2">{kambing.ras?.nama_ras}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-emerald-600 font-medium">{formatCurrency(kambing.estimasiHarga?.estimasi_harga)}</span>
                                                <button onClick={() => addKambing(kambing)} className="btn-primary py-1 px-3 text-xs">Pilih</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {formData.items.length > 0 && (
                                <div className="border rounded-xl p-4 space-y-4">
                                    <p className="text-sm font-medium mb-2">Kambing dipilih:</p>
                                    <div className="space-y-2">
                                        {formData.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 bg-emerald-50 rounded-lg">
                                                <span>{item.kode_kambing} - {item.ras}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-medium">{formatCurrency(item.harga_jual)}</span>
                                                    <button onClick={() => removeKambing(idx)} className="text-red-500 hover:text-red-700">×</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Member Points Section in Step 2 */}
                                    <div className={`p-3 rounded-lg border transition-colors ${memberPoints > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${memberPoints > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                                                    ★
                                                </span>
                                                <span className={`font-semibold text-sm ${memberPoints > 0 ? 'text-amber-900' : 'text-slate-500'}`}>
                                                    {checkingPoints ? 'Mengecek poin...' :
                                                        memberName ? `Poin Member (${memberName}): ${memberPoints}` :
                                                            `Poin Member: ${memberPoints}`}
                                                </span>
                                            </div>
                                            {!checkingPoints && (
                                                <span className={`font-bold text-sm ${memberPoints > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                                                    {formatCurrency(memberPoints * 1000)}
                                                </span>
                                            )}
                                        </div>

                                        {!checkingPoints && memberPoints > 0 && (
                                            <label className="flex items-center gap-2 cursor-pointer select-none mt-2">
                                                <input
                                                    type="checkbox"
                                                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                                                    checked={usePoints}
                                                    onChange={(e) => setUsePoints(e.target.checked)}
                                                />
                                                <span className="text-sm font-medium text-slate-700">Gunakan Voucher Poin</span>
                                            </label>
                                        )}

                                        {!checkingPoints && memberPoints === 0 && (
                                            <p className="text-xs text-slate-400 mt-1 italic">Tidak ada poin tersedia untuk ditukarkan.</p>
                                        )}
                                    </div>

                                    <div className="pt-3 border-t">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-500">Subtotal</span>
                                            <span>{formatCurrency(subtotal)}</span>
                                        </div>
                                        {usePoints && discount > 0 && (
                                            <div className="flex justify-between text-sm text-emerald-600 font-medium mb-1">
                                                <span>Voucher ({pointsUsed} Poin)</span>
                                                <span>-{formatCurrency(discount)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold text-lg mt-2">
                                            <span>Total</span>
                                            <span className="text-emerald-600">{formatCurrency(total)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Payment */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <div>
                                <label className="form-label">Metode Pembayaran</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2">
                                        <input type="radio" name="metode" value="cash" checked={formData.metode_pembayaran === 'cash'}
                                            onChange={(e) => setFormData({ ...formData, metode_pembayaran: e.target.value, payment_method_id: '', bukti_transfer: null })} />
                                        <span>Cash</span>
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input type="radio" name="metode" value="transfer" checked={formData.metode_pembayaran === 'transfer'}
                                            onChange={(e) => setFormData({ ...formData, metode_pembayaran: e.target.value })} />
                                        <span>Transfer</span>
                                    </label>
                                </div>
                            </div>

                            {formData.metode_pembayaran === 'transfer' && (
                                <>
                                    <div>
                                        <label className="form-label">Pilih Bank/E-Wallet</label>
                                        <select className="form-input" value={formData.payment_method_id}
                                            onChange={(e) => setFormData({ ...formData, payment_method_id: e.target.value })}>
                                            <option value="">Pilih</option>
                                            <optgroup label="Bank">
                                                {bankMethods.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name} - {m.account_number}</option>
                                                ))}
                                            </optgroup>
                                            <optgroup label="E-Wallet">
                                                {ewalletMethods.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name} - {m.account_number}</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Upload Bukti Transfer</label>
                                        <input type="file" accept="image/*" className="form-input"
                                            onChange={(e) => setFormData({ ...formData, bukti_transfer: e.target.files[0] })} />
                                    </div>
                                </>
                            )}



                            <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(subtotal)}</span>
                                </div>
                                {usePoints && discount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-600 font-bold bg-emerald-50 p-2 rounded">
                                        <span>Voucher ({pointsUsed} Poin)</span>
                                        <span>-{formatCurrency(discount)}</span>
                                    </div>
                                )}
                                <div className="pt-3 border-t flex justify-between items-center">
                                    <span className="text-slate-500 font-medium">Total Pembayaran</span>
                                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(total)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    {currentStep > 1 && (
                        <button onClick={prevStep} className="btn-secondary">Kembali</button>
                    )}
                    {currentStep < 3 ? (
                        <button onClick={nextStep} className="btn-primary">Lanjut</button>
                    ) : (
                        <button onClick={handleSubmit} disabled={saving} className="btn-primary">
                            {saving ? 'Menyimpan...' : 'Simpan Transaksi'}
                        </button>
                    )}
                </ModalFooter>
            </Modal>

            {/* Detail Modal */}
            <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Detail Penjualan" size="lg">
                {detailData && (
                    <ModalBody>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><span className="text-slate-500">No. Penjualan:</span> <span className="font-medium">{detailData.nomor_penjualan}</span></div>
                                <div><span className="text-slate-500">Tanggal:</span> <span className="font-medium">{formatDate(detailData.tanggal_penjualan)}</span></div>
                                <div><span className="text-slate-500">Pembeli:</span> <span className="font-medium">{detailData.nama_pembeli}</span></div>
                                <div><span className="text-slate-500">Kontak:</span> <span className="font-medium">{detailData.nomor_contact}</span></div>
                            </div>
                            <div className="border-t pt-4">
                                <p className="font-medium mb-2">Detail Kambing:</p>
                                <div className="space-y-2">
                                    {detailData.details?.map((d, i) => (
                                        <div key={i} className="flex justify-between p-2 bg-slate-50 rounded">
                                            <span>{d.kambing?.kode_kambing} - {d.range_berat}</span>
                                            <span className="font-medium">{formatCurrency(d.harga_jual)}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between mt-3 pt-3 border-t font-semibold">
                                    <span>Total</span>
                                    <span className="text-emerald-600">{formatCurrency(detailData.total)}</span>
                                </div>
                            </div>
                        </div>
                    </ModalBody>
                )}
                <ModalFooter>
                    {detailData && (
                        <button
                            onClick={() => handlePrint()}
                            className="btn-primary flex items-center gap-2"
                        >
                            <HiOutlinePrinter className="h-5 w-5" />
                            Cetak Invoice
                        </button>
                    )}
                    <button onClick={() => setShowDetailModal(false)} className="btn-secondary">
                        Tutup
                    </button>
                </ModalFooter>
            </Modal>

            {/* Hidden Invoice for Printing */}
            <div className="hidden">
                <Invoice ref={invoiceRef} data={detailData} settings={settings} />
            </div>
        </div>
    );
};

export default ManagePenjualan;
