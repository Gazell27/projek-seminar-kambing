import { useState, useEffect } from 'react';
import { HiOutlineDownload } from 'react-icons/hi';
import { dashboardAPI } from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate, formatDateInput } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const Laporan = () => {
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState({});
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchData();
    }, [pagination.page, startDate, endDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await dashboardAPI.getLaporan({
                page: pagination.page,
                limit: pagination.limit,
                start_date: startDate,
                end_date: endDate,
            });
            setData(response.data.data);
            setSummary(response.data.summary || {});
            if (response.data.pagination) {
                setPagination(prev => ({ ...prev, ...response.data.pagination }));
            }
        } catch (error) {
            toast.error('Gagal memuat laporan');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { header: 'No. Penjualan', accessor: 'nomor_penjualan', width: '130px' },
        { header: 'Tanggal', render: (row) => formatDate(row.tanggal_penjualan) },
        { header: 'Pembeli', accessor: 'nama_pembeli' },
        { header: 'Jumlah Kambing', render: (row) => row.details?.length || 0 },
        { header: 'Total', render: (row) => <span className="font-semibold">{formatCurrency(row.total)}</span> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Laporan Penjualan</h1>
                    <p className="mt-1 text-sm text-slate-500">Analisis penjualan dan keuntungan</p>
                </div>
                <button className="btn-secondary">
                    <HiOutlineDownload className="h-5 w-5" />
                    Export
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 flex-wrap">
                <div>
                    <label className="text-sm text-slate-500 block mb-1">Dari Tanggal</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => {
                            setStartDate(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="form-input"
                    />
                </div>
                <div>
                    <label className="text-sm text-slate-500 block mb-1">Sampai Tanggal</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                            setEndDate(e.target.value);
                            setPagination(prev => ({ ...prev, page: 1 }));
                        }}
                        className="form-input"
                    />
                </div>
                <button
                    onClick={() => {
                        setStartDate('');
                        setEndDate('');
                        setPagination(prev => ({ ...prev, page: 1 }));
                    }}
                    className="btn-ghost mt-6"
                >
                    Reset
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card card-body">
                    <p className="text-sm text-slate-500">Total Transaksi</p>
                    <p className="text-2xl font-bold text-slate-800">{summary.totalTransaksi || 0}</p>
                </div>
                <div className="card card-body">
                    <p className="text-sm text-slate-500">Total Kambing Terjual</p>
                    <p className="text-2xl font-bold text-slate-800">{summary.totalKambing || 0}</p>
                </div>
                <div className="card card-body">
                    <p className="text-sm text-slate-500">Total Pendapatan</p>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.totalPendapatan || 0)}</p>
                </div>
                <div className="card card-body">
                    <p className="text-sm text-slate-500">Total Keuntungan</p>
                    <p className={`text-2xl font-bold ${(summary.totalKeuntungan || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(summary.totalKeuntungan || 0)}
                    </p>
                </div>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={data}
                loading={loading}
                pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                emptyMessage="Tidak ada data penjualan"
            />
        </div>
    );
};

export default Laporan;
