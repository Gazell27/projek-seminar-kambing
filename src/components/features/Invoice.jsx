import React, { forwardRef } from 'react';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';
import { Star } from 'lucide-react';

const Invoice = forwardRef(({ data, settings }, ref) => {
    if (!data) return null;

    return (
        <div ref={ref} className="p-8 bg-white text-slate-900 mx-auto print:p-0 print:m-0 print:shadow-none w-full max-w-[210mm]">
            <style>
                {`
                @media print {
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print-avoid-break {
                        break-inside: avoid;
                    }
                }
                `}
            </style>
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-emerald-600 mb-1">{settings?.nama_peternakan || 'GoatFarm'}</h1>
                    <p className="text-slate-500 whitespace-pre-line">{settings?.alamat || 'Alamat tidak tersedia'}</p>
                    <p className="text-slate-500">Telp: {settings?.telepon || '-'}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-slate-800 uppercase tracking-wider mb-2">Invoice</h2>
                    <p className="text-slate-500">No: <span className="text-slate-900 font-semibold">{data.nomor_penjualan}</span></p>
                    <p className="text-slate-500">Tanggal: <span className="text-slate-900 font-semibold">{formatDate(data.tanggal_penjualan)}</span></p>
                </div>
            </div>

            {/* Buyer Info */}
            <div className="mb-8 p-4 bg-slate-50 rounded-xl">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">Ditujukan Kepada:</h3>
                <p className="text-lg font-bold text-slate-900">{data.nama_pembeli}</p>
                <p className="text-slate-600">{data.nomor_contact}</p>
                <p className="text-slate-600">{data.alamat_pembeli || '-'}</p>
            </div>

            {/* Items Table */}
            <div className="mb-8">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-slate-200 text-left">
                            <th className="py-3 px-2 font-bold text-slate-800 uppercase text-sm">Deskripsi Kambing</th>
                            <th className="py-3 px-2 font-bold text-slate-800 uppercase text-sm text-right">Harga</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.details?.map((item, index) => (
                            <tr key={index}>
                                <td className="py-4 px-2">
                                    <p className="font-semibold text-slate-900">{item.kambing?.kode_kambing || 'Kambing'}</p>
                                    <p className="text-sm text-slate-500">
                                        Ras: <span className="text-slate-700 font-medium">{item.kambing?.ras?.nama_ras || 'N/A'}</span>
                                        <span className="mx-2 text-slate-300">|</span>
                                        Berat: <span className="text-slate-700 font-medium">{item.range_berat || '-'} kg</span>
                                    </p>
                                </td>
                                <td className="py-4 px-2 text-right font-medium text-slate-900">
                                    {formatCurrency(item.harga_jual)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="flex justify-end pt-6 border-t-2 border-slate-200 print-avoid-break">
                <div className="w-64 space-y-3">
                    <div className="flex justify-between text-slate-500">
                        <span>Subtotal</span>
                        <span>{formatCurrency(data.total)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-slate-900 border-t border-slate-100 pt-3">
                        <span>Total Tagihan</span>
                        <span className="text-emerald-600">{formatCurrency(data.total)}</span>
                    </div>
                </div>
            </div>

            {/* Loyalty Points Section */}
            {data.customer && (
                <div className="mb-8 p-6 bg-amber-50 rounded-[2rem] border-2 border-amber-200 flex items-center justify-between print-avoid-break">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-400 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                            <Star size={24} fill="white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Program Loyalitas</p>
                            <h4 className="text-lg font-bold text-slate-900">Poin Belanja Anda</h4>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-black text-amber-600 leading-none mb-1">{data.customer.total_points}</p>
                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter">Total Akumulasi Poin</p>
                    </div>
                </div>
            )}

            {/* Payment Info */}
            <div className="mt-12 p-6 border-2 border-slate-100 rounded-[2rem] bg-slate-50/50 print-avoid-break">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Metode Pembayaran:</h3>
                <p className="text-slate-900 font-semibold capitalize">{data.metode_pembayaran}</p>
                {data.payment_method && (
                    <p className="text-slate-600">{data.payment_method.name} - {data.payment_method.account_number} ({data.payment_method.account_name})</p>
                )}
                <p className="mt-2 text-xs text-slate-400">Status: <span className={`uppercase font-bold ${data.payment_status === 'paid' ? 'text-emerald-500' : 'text-amber-500'}`}>{data.payment_status}</span></p>
            </div>

            {/* Footer */}
            <div className="mt-16 text-center text-slate-400 text-sm">
                <p>Terima kasih atas kepercayaan Anda bertransaksi di {settings?.nama_peternakan || 'GoatFarm'}</p>
                <div className="mt-4 pt-4 border-t border-slate-100 italic">
                    Invoice ini dihasilkan oleh sistem pada {new Date().toLocaleString('id-ID')}
                </div>
            </div>
        </div>
    );
});

export default Invoice;
