import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Binary,
    TrendingUp,
    Scale,
    ShoppingCart,
    CreditCard,
    FileText,
    Users,
    Settings,
    LogOut,
    ChevronRight,
    ShieldCheck,
    Package,
    Eye,
    Wallet,
    Trophy
} from 'lucide-react';
import GoatIcon from './GoatIcon';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const adminMenu = [
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { name: 'Data Ras', path: '/admin/ras', icon: Binary },
        { name: 'Estimasi Harga', path: '/admin/estimasi', icon: TrendingUp },
        { name: 'Data Kambing', path: '/admin/kambing', icon: Scale },
        { name: 'Penjualan', path: '/admin/penjualan', icon: ShoppingCart },
        { name: 'Pembayaran', path: '/admin/pembayaran', icon: CreditCard },
        { name: 'Laporan', path: '/admin/laporan', icon: FileText },
        { name: 'Manajemen User', path: '/admin/users', icon: Users },
        { name: 'Metode Pembayaran', path: '/admin/metode-pembayaran', icon: Wallet },
        { name: 'Program Loyalitas', path: '/admin/loyalty', icon: Trophy },
        { name: 'Pengaturan', path: '/admin/settings', icon: Settings },
    ];

    const kasirMenu = [
        { name: 'Dashboard', path: '/kasir', icon: LayoutDashboard },
        { name: 'Penjualan', path: '/kasir/penjualan', icon: ShoppingCart },
        { name: 'Data Kambing', path: '/kasir/kambing', icon: Eye },
        { name: 'Laporan Saya', path: '/kasir/laporan', icon: FileText },
        { name: 'Cek Harga', path: '/kasir/estimasi', icon: TrendingUp },
        { name: 'Program Loyalitas', path: '/kasir/loyalty', icon: Trophy },
    ];

    const menuItems = user?.role === 'admin' ? adminMenu : kasirMenu;

    const handleLogout = () => {
        if (window.confirm('Apakah Anda yakin ingin keluar?')) {
            logout();
            navigate('/login');
        }
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 bg-[#0d0d0d] text-slate-400 border-r border-white/5 flex flex-col z-50">
            {/* Sidebar Header */}
            <div className="p-8">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <ShieldCheck className="text-white h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold text-white tracking-tight">GoatFarm</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/admin' || item.path === '/kasir'}
                        className={({ isActive }) => `
              group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300
              ${isActive
                                ? 'bg-emerald-500/10 text-emerald-400 font-semibold shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]'
                                : 'hover:bg-white/5 hover:text-slate-100'
                            }
            `}
                    >
                        {({ isActive }) => (
                            <>
                                <div className="flex items-center gap-3.5">
                                    <item.icon size={20} className={`${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`} />
                                    <span className="text-[15px]">{item.name}</span>
                                </div>
                                {isActive && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Sidebar Footer */}
            <div className="p-6 bg-white/[0.02] border-t border-white/5">
                <div className="flex items-center gap-4 mb-6 px-2">
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-lg border border-white/10 shadow-xl">
                        <GoatIcon size={24} />
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <h4 className="text-sm font-bold text-white truncate">{user?.name}</h4>
                        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">
                            {user?.role === 'admin' ? 'System Admin' : 'Staff Kasir'}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2.5 px-4 py-3 text-sm font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-400/5 rounded-2xl transition-all duration-300 border border-transparent hover:border-rose-400/20"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
