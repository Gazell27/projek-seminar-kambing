const StatusBadge = ({ status }) => {
    const getStatusStyles = (status) => {
        const s = status?.toLowerCase();

        // User Roles
        if (s === 'admin') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (s === 'kasir') return 'bg-blue-100 text-blue-700 border-blue-200';

        // Kambing Status
        if (s === 'tersedia') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (s === 'terjual') return 'bg-slate-100 text-slate-600 border-slate-200';
        if (s === 'sakit') return 'bg-amber-100 text-amber-700 border-amber-200';
        if (s === 'mati') return 'bg-rose-100 text-rose-700 border-rose-200';

        // Payment Status
        if (s === 'paid' || s === 'confirmed' || s === 'lunas') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (s === 'pending' || s === 'menunggu') return 'bg-amber-100 text-amber-700 border-amber-200';
        if (s === 'rejected' || s === 'ditolak' || s === 'failed') return 'bg-rose-100 text-rose-700 border-rose-200';

        // Default
        if (s === 'true' || s === 'active') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (s === 'false' || s === 'inactive') return 'bg-slate-100 text-slate-600 border-slate-200';

        return 'bg-slate-100 text-slate-600 border-slate-200';
    };

    const label = status?.charAt(0).toUpperCase() + status?.slice(1);

    return (
        <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full border ${getStatusStyles(status)} shadow-sm`}>
            {label}
        </span>
    );
};

export default StatusBadge;
