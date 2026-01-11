import { useState, useEffect } from 'react';
import { Trophy, Star, TrendingUp, UserCheck, Phone } from 'lucide-react';
import { dashboardAPI } from '../../api/axios';
import { formatCurrency } from '../../utils/formatCurrency';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const LoyaltyProgram = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const response = await dashboardAPI.getLoyalty();
            setLeaderboard(response.data.data);
        } catch (error) {
            toast.error('Gagal memuat data loyalitas');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-10 w-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header section with appreciation message */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2.5rem] p-8 md:p-12 text-white overflow-hidden relative shadow-2xl shadow-emerald-200">
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Apresiasi Pembeli Setia</h1>
                    <p className="text-emerald-50 max-w-2xl text-lg leading-relaxed">
                        Terima kasih kepada para mitra peternak dan pembeli setia kami. Setiap transaksi adalah poin yang membawa Anda lebih dekat ke berbagai keuntungan spesial dari GoatFarm!
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-100 mb-1">Total Points</p>
                            <p className="text-2xl font-black">{leaderboard.reduce((sum, b) => sum + b.total_points, 0)}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20">
                            <p className="text-xs font-bold uppercase tracking-widest text-emerald-100 mb-1">Total Buyers tracked</p>
                            <p className="text-2xl font-black">{leaderboard.length}</p>
                        </div>
                    </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
                    <Trophy size={300} strokeWidth={1} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top 3 Spotlight */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-slate-800">Peringkat Teratas</h2>
                    </div>

                    <div className="space-y-4">
                        {leaderboard.map((buyer, index) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                key={buyer.id}
                                className={`group bg-white p-6 rounded-[2rem] border-2 transition-all hover:shadow-xl ${index === 0 ? 'border-amber-200 bg-amber-50/10' :
                                    index === 1 ? 'border-slate-200' :
                                        index === 2 ? 'border-orange-200' : 'border-transparent hover:border-slate-100'
                                    }`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${index === 0 ? 'bg-amber-100 text-amber-600 ring-4 ring-amber-50' :
                                        index === 1 ? 'bg-slate-100 text-slate-600 ring-4 ring-slate-50' :
                                            index === 2 ? 'bg-orange-100 text-orange-600 ring-4 ring-orange-50' :
                                                'bg-slate-50 text-slate-400'
                                        }`}>
                                        {index < 3 ? (
                                            <Trophy size={32} />
                                        ) : (
                                            <span className="text-xl font-black">{index + 1}</span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{buyer.name}</h3>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-500">
                                                        <Phone size={14} className="text-slate-400" />
                                                        {buyer.contact}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                                        <TrendingUp size={14} />
                                                        {buyer.transaction_count} Transaksi
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center justify-end gap-2 mb-1">
                                                    <Star size={20} className="text-amber-400 fill-amber-400" />
                                                    <span className="text-3xl font-black text-slate-900 leading-none">{buyer.total_points}</span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Points Loyalty</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {leaderboard.length === 0 && (
                            <div className="bg-white rounded-[2rem] p-12 text-center border-2 border-dashed border-slate-100">
                                <UserCheck className="mx-auto text-slate-200 mb-4" size={64} />
                                <p className="text-slate-400 font-bold">Belum ada data pembeli</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Info Card */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-slate-800">Cara Dapat Poin</h2>
                    <div className="bg-white rounded-[2rem] p-8 shadow-lg shadow-slate-100 border border-slate-100 space-y-8 relative overflow-hidden">
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-black">1</div>
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1">Belanja Kambing</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">Poin diberikan untuk setiap transaksi yang dikonfirmasi pembayarannya.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-black">2</div>
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1">Akumulasi Nilai</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">Anda mendapatkan <span className="font-black text-emerald-600">1 Poin</span> untuk setiap kelipatan <span className="font-bold text-slate-800">Rp 100.000</span>.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-black">3</div>
                                <div>
                                    <h4 className="font-bold text-slate-800 mb-1">Tukar Reward</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed">Nilai <span className="font-black text-emerald-600">1 Poin = Rp 1.000</span>. Kumpulkan poin untuk ditukarkan dengan voucher belanja!</p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 text-emerald-500/5 -mr-8 -mb-8">
                            <TrendingUp size={240} />
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
                        <h4 className="text-amber-400 font-black uppercase tracking-widest text-xs mb-4">Pesan Dari Admin</h4>
                        <p className="text-slate-300 text-sm leading-relaxed italic">
                            "Keberhasilan peternakan kami tidak lepas dari dukungan Anda. Sistem poin ini adalah cara kami mengucapkan terima kasih secara nyata."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoyaltyProgram;
