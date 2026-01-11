import { useState, useEffect } from 'react';
import { estimasiAPI } from '../../api/axios';
import DataTable from '../../components/common/DataTable';
import { formatCurrency } from '../../utils/formatCurrency';
import toast from 'react-hot-toast';

const ViewEstimasi = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await estimasiAPI.getAll();
            setData(response.data.data);
        } catch (error) {
            toast.error('Gagal memuat data estimasi');
        } finally {
            setLoading(false);
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
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Estimasi Harga</h1>
                <p className="mt-1 text-sm text-slate-500">Daftar harga berdasarkan berat</p>
            </div>

            <DataTable
                columns={columns}
                data={data}
                loading={loading}
                emptyMessage="Belum ada data estimasi"
            />
        </div>
    );
};

export default ViewEstimasi;
