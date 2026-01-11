import { Search, Bell, Menu, User, CheckCircle2, Clock, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import GoatIcon from './GoatIcon';

const Navbar = () => {
    const { user } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        {
            id: 1,
            type: 'payment',
            title: 'Pembayaran Baru',
            message: 'Pembeli #TRX-123 menunggu konfirmasi',
            time: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
            isRead: false,
            icon: Clock,
            color: 'text-amber-500 bg-amber-50'
        },
        {
            id: 2,
            type: 'stock',
            title: 'Stok Menurun',
            message: 'Stok Kambing Boer tersisa 5 unit',
            time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            isRead: false,
            icon: AlertCircle,
            color: 'text-rose-500 bg-rose-50'
        },
        {
            id: 3,
            type: 'success',
            title: 'Sistem Terupdate',
            message: 'Dataset inventaris berhasil disinkronkan',
            time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            isRead: true,
            icon: CheckCircle2,
            color: 'text-emerald-500 bg-emerald-50'
        }
    ]);

    const notificationRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    return (
        <nav className="h-20 glass sticky top-0 z-40 px-8 flex items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                    <Search size={18} />
                </div>
                <input
                    type="text"
                    placeholder="Cari data, laporan atau transaksi..."
                    className="w-full bg-slate-100/50 border-none rounded-[1.25rem] pl-11 pr-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-500 font-medium"
                />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-5">
                {/* Notification Bell */}
                <div className="relative" ref={notificationRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className={`h-11 w-11 flex items-center justify-center rounded-2xl transition-all relative ${showNotifications ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                            }`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2.5 right-2.5 h-4 w-4 rounded-full bg-rose-500 border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-4 w-[22rem] bg-white rounded-[1.5rem] shadow-2xl border border-slate-100 overflow-hidden z-50"
                            >
                                <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                                    <h4 className="font-bold text-slate-900">Notifikasi</h4>
                                    <button
                                        onClick={markAllRead}
                                        className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider hover:text-emerald-700"
                                    >
                                        Tandai Semua Dibaca
                                    </button>
                                </div>
                                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                                    {notifications.length > 0 ? (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className={`p-4 flex gap-4 transition-colors hover:bg-slate-50 border-b border-slate-50 last:border-0 relative ${!notif.isRead ? 'bg-emerald-50/20' : ''}`}
                                            >
                                                <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center ${notif.color}`}>
                                                    <notif.icon size={18} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 leading-none mb-1">{notif.title}</p>
                                                    <p className="text-xs text-slate-500 line-clamp-2 mb-1.5 leading-relaxed">{notif.message}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={10} className="text-slate-400" />
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                                            {formatDistanceToNow(notif.time, { addSuffix: true, locale: id })}
                                                        </span>
                                                    </div>
                                                </div>
                                                {!notif.isRead && (
                                                    <div className="absolute top-5 right-4 h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-10 text-center">
                                            <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 text-slate-300">
                                                <Bell size={24} />
                                            </div>
                                            <p className="text-slate-400 font-bold text-sm">Tidak ada notifikasi baru</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-slate-50/50 border-t border-slate-100 text-center">
                                    <button className="text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors uppercase tracking-widest">
                                        Lihat Semua Aktivitas
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>

                <div className="flex items-center gap-3 pl-2">
                    <div className="hidden lg:block text-right">
                        <p className="text-sm font-extrabold text-slate-900 leading-none mb-1">{user?.name}</p>
                        <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest">{user?.role}</p>
                    </div>
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform cursor-pointer">
                        <GoatIcon size={24} />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
