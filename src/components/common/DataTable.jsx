import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Inbox, Filter, Search } from 'lucide-react';

const DataTable = ({
    columns,
    data,
    loading,
    pagination,
    onPageChange,
    emptyMessage = 'Tidak ada data ditemukan'
}) => {
    return (
        <div className="table-container">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="table-head">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className="table-th text-[10px] font-bold uppercase tracking-widest text-slate-500"
                                    style={{ width: column.width }}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    {columns.map((_, j) => (
                                        <td key={j} className="px-6 py-5">
                                            <div className="h-4 bg-slate-100 rounded-lg w-3/4"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length > 0 ? (
                            <AnimatePresence mode="popLayout">
                                {data.map((row, i) => (
                                    <motion.tr
                                        key={row.id || i}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3, delay: i * 0.05 }}
                                        className="table-tr group"
                                    >
                                        {columns.map((column, j) => (
                                            <td key={j} className="table-td">
                                                {column.render ? column.render(row) : row[column.accessor]}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-16 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-300">
                                        <Inbox size={48} className="mb-4 stroke-[1.5]" />
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{emptyMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Halaman <span className="text-slate-900">{pagination.page}</span> dari <span className="text-slate-900">{pagination.totalPages}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                            className="h-10 w-10 btn-secondary p-0 flex items-center justify-center disabled:opacity-30 rounded-xl"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div className="flex items-center gap-1 mx-1">
                            {[...Array(pagination.totalPages)].map((_, i) => {
                                const p = i + 1;
                                // Simple pagination logic (show current, first, last, and dots)
                                if (p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1) {
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => onPageChange(p)}
                                            className={`h-10 w-10 flex items-center justify-center text-sm font-bold rounded-xl transition-all ${pagination.page === p
                                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                                                    : 'text-slate-500 hover:bg-white hover:text-slate-900'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                } else if (Math.abs(p - pagination.page) === 2) {
                                    return <span key={p} className="px-1 text-slate-300">...</span>;
                                }
                                return null;
                            })}
                        </div>
                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.totalPages}
                            className="h-10 w-10 btn-secondary p-0 flex items-center justify-center disabled:opacity-30 rounded-xl"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
