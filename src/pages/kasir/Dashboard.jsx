import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    HiOutlineTag,
    HiOutlineShoppingCart,
    HiOutlineCash,
    HiOutlinePlus,
} from 'react-icons/hi';
import { dashboardAPI } from '../../api/axios';
import StatsCard from '../../components/common/StatsCard';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const KasirDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ totalKambing: 0 });
    const [recentSales, setRecentSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, recentRes] = await Promise.all([
                dashboardAPI.getStats(),
                dashboardAPI.getRecentSales(),
            ]);
            setStats(statsRes.data.data);
            setRecentSales(recentRes.data.data);
        } catch (error) {
            toast.error('Gagal memuat data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
                <p className="mt-1 text-sm text-slate-500">Selamat datang, {user?.name}!</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatsCard
                    title="Kambing Tersedia"
                    value={stats?.totalKambing || 0}
                    subtitle="Stok siap jual"
                    icon={HiOutlineTag}
                    color="cyan"
                />
                <StatsCard
                    title="Transaksi Saya"
                    value={recentSales.length}
                    subtitle="Hari ini"
                    icon={HiOutlineShoppingCart}
                    color="amber"
                />
                <StatsCard
                    title="Total Penjualan"
                    value={formatCurrency(recentSales.reduce((sum, s) => sum + s.total, 0))}
                    subtitle="Hari ini"
                    icon={HiOutlineCash}
                    color="emerald"
                />
            </div>

            {/* Quick Action */}
            <Link
                to="/kasir/penjualan"
                className="block rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white hover:shadow-xl transition-shadow"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold">Buat Transaksi Baru</h3>
                        <p className="text-emerald-100 mt-1">Klik untuk mencatat penjualan kambing</p>
                    </div>
                    <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center">
                        <HiOutlinePlus className="h-8 w-8" />
                    </div>
                </div>
            </Link>

            {/* Recent Sales */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="text-lg font-semibold text-slate-900">Transaksi Terakhir Saya</h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {recentSales.length > 0 ? (
                        recentSales.map((sale) => (
                            <div key={sale.id} className="flex items-center justify-between p-4 hover:bg-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                                        {sale.nama_pembeli?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="font-medium text-slate-900">{sale.nama_pembeli}</div>
                                        <div className="text-xs text-slate-500">{formatDate(sale.tanggal_penjualan)} • {sale.details?.length} kambing</div>
                                    </div>
                                </div>
                                <div className="font-bold text-emerald-600">{formatCurrency(sale.total)}</div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            Belum ada transaksi hari ini
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KasirDashboard;
