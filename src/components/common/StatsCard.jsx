import { motion } from 'framer-motion';

const StatsCard = ({ title, value, subtitle, icon: Icon, color = 'emerald', trend, delay = 0 }) => {
    const colors = {
        emerald: 'from-emerald-400 to-teal-600 shadow-emerald-200',
        blue: 'from-blue-400 to-indigo-600 shadow-blue-200',
        purple: 'from-purple-400 to-violet-600 shadow-purple-200',
        amber: 'from-amber-400 to-orange-600 shadow-amber-200',
        rose: 'from-rose-400 to-pink-600 shadow-rose-200',
        cyan: 'from-cyan-400 to-sky-600 shadow-cyan-200',
    };

    const bgColors = {
        emerald: 'bg-emerald-50 text-emerald-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        amber: 'bg-amber-50 text-amber-600',
        rose: 'bg-rose-50 text-rose-600',
        cyan: 'bg-cyan-50 text-cyan-600',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            className="card group hover:-translate-y-1"
        >
            <div className="card-body">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
                        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
                        {subtitle && (
                            <p className="text-xs font-semibold text-slate-400 mt-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                                <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                                {subtitle}
                                {trend && (
                                    <span className={`ml-1 ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                                    </span>
                                )}
                            </p>
                        )}
                    </div>
                    <div className={`h-14 w-14 rounded-[1.25rem] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-xl bg-gradient-to-br ${colors[color]} text-white`}>
                        {Icon && <Icon size={28} strokeWidth={2.5} />}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StatsCard;
