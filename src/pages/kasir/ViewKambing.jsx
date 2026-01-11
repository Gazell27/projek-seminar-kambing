import { useState, useEffect } from 'react';
import { kambingAPI } from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import toast from 'react-hot-toast';

const ViewKambing = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

    useEffect(() => {
        fetchData();
    }, [pagination.page, search]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await kambingAPI.getAll({
                page: pagination.page,
                limit: pagination.limit,
                search,
                status: 'Tersedia',
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

    const columns = [
        { header: 'Kode', accessor: 'kode_kambing', width: '100px' },
        { header: 'Ras', render: (row) => row.ras?.nama_ras || '-' },
        { header: 'Jenis Kelamin', render: (row) => row.jenis_kelamin || '-' },
        { header: 'Tanggal Masuk', render: (row) => formatDate(row.tanggal_masuk) },
        {
            header: 'Estimasi Harga',
            render: (row) => (
                <span className="font-semibold text-emerald-600">
                    {formatCurrency(row.estimasiHarga?.estimasi_harga)}
                </span>
            )
        },
        { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Data Kambing</h1>
                <p className="mt-1 text-sm text-slate-500">Lihat kambing yang tersedia</p>
            </div>

            <input
                type="text"
                placeholder="Cari kambing..."
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
                emptyMessage="Tidak ada kambing tersedia"
            />
        </div>
    );
};

export default ViewKambing;
