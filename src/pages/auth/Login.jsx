import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Lock,
    Mail,
    ArrowRight,
    Loader2,
    ShieldCheck,
    ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error('Email dan password wajib diisi');
            return;
        }

        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success('Selamat datang kembali!');

            if (user.role === 'admin') navigate('/admin');
            else navigate('/kasir');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login gagal, periksa email/password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6 overflow-hidden relative">
            {/* Dynamic Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-emerald-600/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-teal-600/20 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="w-full max-w-[1100px] flex rounded-[2.5rem] overflow-hidden glass-dark relative z-10 shadow-2xl"
            >
                {/* Left Side: Visual/Branding */}
                <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-800 p-16 flex-col justify-between">
                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="flex items-center gap-3 mb-12"
                        >
                            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                <ShieldCheck className="text-white h-7 w-7" />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">GoatFarm <span className="text-emerald-300">Mandiri</span></span>
                        </motion.div>

                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.6 }}
                            className="text-5xl font-bold text-white leading-[1.1] mb-6"
                        >
                            Efisienkan <br />
                            <span className="text-emerald-300">Pengelolaan</span> <br />
                            Peternakan Anda.
                        </motion.h1>

                        <motion.p
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.6 }}
                            className="text-lg text-emerald-100/80 max-w-md leading-relaxed"
                        >
                            Platform terpadu untuk manajemen inventaris, penjualan, dan pelaporan kambing secara modern dan transparan.
                        </motion.p>
                    </div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.6 }}
                        className="relative z-10 flex gap-10"
                    >
                        <div>
                            <div className="text-2xl font-bold text-white">100%</div>
                            <div className="text-sm text-emerald-100/60 uppercase tracking-widest font-semibold">Aman</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-white">Real-time</div>
                            <div className="text-sm text-emerald-100/60 uppercase tracking-widest font-semibold">Tracking</div>
                        </div>
                    </motion.div>

                    {/* Decorative shapes */}
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/10 blur-[60px] rounded-full" />
                    <div className="absolute top-1/2 -right-20 w-60 h-60 bg-emerald-400/20 blur-[50px] rounded-full" />
                </div>

                {/* Right Side: Form */}
                <div className="w-full lg:w-2/5 p-8 sm:p-12 md:p-16 flex flex-col justify-center bg-[#111111]/40">
                    <div className="mb-10">
                        <h2 className="text-3xl font-bold text-white mb-2">Selamat Datang</h2>
                        <p className="text-slate-400">Masuk untuk melanjutkan ke dashboard.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-600 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all duration-300"
                                    placeholder="name@company.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-sm font-semibold text-slate-300">Password</label>
                                <a href="#" className="text-xs text-emerald-500 hover:text-emerald-400 transition-colors font-medium">Lupa Password?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder:text-slate-600 outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all duration-300"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={loading}
                            className="w-full btn-primary py-4 rounded-2xl text-lg flex items-center justify-center gap-3"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin h-5 w-5" />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </motion.button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-sm">
                            Belum punya akun? Hubungi Admin untuk pendaftaran petugas baru.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Footer info */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600 text-xs font-medium uppercase tracking-[0.2em] z-10">
                © 2024 GoatFarm Mandiri • Premium Livestock Solutions
            </div>
        </div>
    );
};

export default Login;
