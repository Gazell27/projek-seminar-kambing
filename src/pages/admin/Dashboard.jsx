import { useState, useEffect } from 'react';
import {
    Users,
    ShoppingCart,
    TrendingUp,
    Package,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Layers,
    TrendingDown
} from 'lucide-react';
import { dashboardAPI } from '../../api/axios';
import StatsCard from '../../components/common/StatsCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [salesTrend, setSalesTrend] = useState([]);
    const [stockDistribution, setStockDistribution] = useState([]);
    const [recentSales, setRecentSales] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, trendRes, stockRes, recentRes] = await Promise.all([
                dashboardAPI.getStats(),
                dashboardAPI.getSalesChart(),
                dashboardAPI.getStockChart(),
                dashboardAPI.getRecentSales(),
            ]);
            setStats(statsRes.data.data);
            setSalesTrend(trendRes.data.data);
            setStockDistribution(stockRes.data.data);
            setRecentSales(recentRes.data.data);
        } catch (error) {
            toast.error('Gagal memuat data dashboard');
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <div className="spinner mb-4" />
                <p className="text-slate-500 font-medium">Meyiapkan data dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h1>
                    <p className="mt-1 text-slate-500 font-medium">Pantau performa peternakan Anda secara real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200 flex items-center gap-2 text-sm font-bold text-slate-600">
                        <Calendar size={18} className="text-emerald-500" />
                        {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <button onClick={fetchData} className="btn-secondary px-4">
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total Pendapatan"
                    value={formatCurrency(stats?.totalPendapatan || 0)}
                    subtitle="Bulan ini"
                    icon={TrendingUp}
                    color="emerald"
                    delay={0.1}
                />
                <StatsCard
                    title="Unit Terjual"
                    value={stats?.totalTerjual || 0}
                    subtitle="Bulan ini"
                    icon={ShoppingCart}
                    color="blue"
                    delay={0.2}
                />
                <StatsCard
                    title="Total Kambing"
                    value={stats?.totalKambing || 0}
                    subtitle="Stok Saat Ini"
                    icon={Package}
                    color="amber"
                    delay={0.3}
                />
                <StatsCard
                    title="Total Staff"
                    value={stats?.totalUser || 0}
                    subtitle="Aktif"
                    icon={Users}
                    color="purple"
                    delay={0.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Sales Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="lg:col-span-2 card bg-white overflow-hidden"
                >
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Tren Penjualan</h3>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Performa 12 bulan terakhir</p>
                        </div>
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="p-6 h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesTrend}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="bulan"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                                    tickFormatter={(value) => value === 0 ? '0' : `${value / 1000000} Jt`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '16px',
                                        border: 'none',
                                        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                        padding: '12px'
                                    }}
                                    formatter={(value) => [formatCurrency(value), 'Pendapatan']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="total"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorTotal)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Stock Distribution */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="card"
                >
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Distribusi Ras</h3>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Persentase stok kambing</p>
                        </div>
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                            <Layers size={20} />
                        </div>
                    </div>
                    <div className="p-6 h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stockDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="jumlah"
                                    nameKey="nama_ras"
                                    stroke="none"
                                >
                                    {stockDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                />
                                <Legend iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="card overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">Transaksi Terakhir</h3>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Update penjualan terbaru</p>
                    </div>
                    <button className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1">
                        Lihat Semua <ArrowUpRight size={16} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="table-head">
                            <tr>
                                <th className="table-th">Pembeli</th>
                                <th className="table-th text-center">Tanggal</th>
                                <th className="table-th text-center">Metode</th>
                                <th className="table-th text-right">Total</th>
                                <th className="table-th text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {recentSales.map((sale, idx) => (
                                <tr key={sale.id} className="table-tr">
                                    <td className="table-td">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-extrabold text-xs">
                                                {sale.nama_pembeli?.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 leading-none mb-1">{sale.nama_pembeli}</p>
                                                <p className="text-[10px] font-bold text-slate-400 tracking-wider">#{sale.nomor_penjualan}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="table-td text-center font-semibold text-slate-500">{formatDate(sale.tanggal_penjualan)}</td>
                                    <td className="table-td text-center">
                                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                                            {sale.metode_pembayaran}
                                        </span>
                                    </td>
                                    <td className="table-td text-right">
                                        <span className="font-extrabold text-emerald-600">{formatCurrency(sale.total)}</span>
                                    </td>
                                    <td className="table-td text-center">
                                        <StatusBadge status={sale.payment_status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {recentSales.length === 0 && (
                        <div className="p-20 text-center">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300 mb-4">
                                <ShoppingCart size={32} />
                            </div>
                            <p className="text-slate-500 font-bold">Belum ada transaksi hari ini</p>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Dashboard;
