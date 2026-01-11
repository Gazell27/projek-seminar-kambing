import express from 'express';
import {
    Ras,
    Kambing,
    PenjualanHeader,
    PenjualanDetail,
    User,
    Customer,
    sequelize
} from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { Op } from 'sequelize';

const router = express.Router();

// GET /api/dashboard/stats - Dashboard statistics
router.get('/stats', authenticate, async (req, res) => {
    try {
        // Basic counts
        const totalRas = await Ras.count();
        const totalKambing = await Kambing.count({ where: { status: 'Tersedia' } });

        // Sales data (only confirmed)
        const totalTerjual = await PenjualanDetail.count({
            include: [{
                model: PenjualanHeader,
                as: 'penjualanHeader',
                where: { payment_status: 'confirmed' },
                required: true,
            }],
        });

        const totalTransaksi = await PenjualanHeader.count({
            where: { payment_status: 'confirmed' },
        });

        // Profit this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const endOfMonth = new Date();
        endOfMonth.setHours(23, 59, 59, 999);

        // Get this month's confirmed sales with harga_beli
        const monthSales = await PenjualanDetail.findAll({
            include: [
                {
                    model: PenjualanHeader,
                    as: 'penjualanHeader',
                    where: {
                        payment_status: 'confirmed',
                        tanggal_penjualan: {
                            [Op.between]: [startOfMonth, endOfMonth],
                        },
                    },
                    required: true,
                },
                {
                    model: Kambing,
                    as: 'kambing',
                },
            ],
        });

        let totalPendapatan = 0;
        let totalModalBulanIni = 0;

        monthSales.forEach(sale => {
            totalPendapatan += parseInt(sale.harga_jual || 0);
            totalModalBulanIni += parseInt(sale.kambing?.harga_beli || 0);
        });

        const totalKeuntungan = totalPendapatan - totalModalBulanIni;
        const marginPercentage = totalPendapatan > 0
            ? Math.round((totalKeuntungan / totalPendapatan) * 100)
            : 0;

        const totalUser = await User.count();

        res.json({
            success: true,
            data: {
                totalRas,
                totalKambing,
                totalTerjual,
                totalTransaksi,
                totalPendapatan,
                totalKeuntungan,
                marginPercentage,
                totalUser,
            },
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil statistik',
        });
    }
});

// GET /api/dashboard/chart/sales - Monthly sales for chart
router.get('/chart/sales', authenticate, async (req, res) => {
    try {
        const months = [];

        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);

            const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
            const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);

            const total = await PenjualanHeader.sum('total', {
                where: {
                    payment_status: 'confirmed',
                    tanggal_penjualan: {
                        [Op.between]: [startOfMonth, endOfMonth],
                    },
                },
            });

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

            months.push({
                bulan: monthNames[date.getMonth()],
                total: parseInt(total) || 0,
            });
        }

        res.json({
            success: true,
            data: months,
        });
    } catch (error) {
        console.error('Get sales chart error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data chart penjualan',
        });
    }
});

// GET /api/dashboard/chart/stock - Stock per ras for chart
router.get('/chart/stock', authenticate, async (req, res) => {
    try {
        const stock = await Kambing.findAll({
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('Kambing.id')), 'jumlah'],
            ],
            include: [{
                model: Ras,
                as: 'ras',
                attributes: ['nama_ras'],
            }],
            where: { status: 'Tersedia' },
            group: ['ras.id', 'ras.nama_ras'],
            order: [[sequelize.fn('COUNT', sequelize.col('Kambing.id')), 'DESC']],
            limit: 5,
            raw: true,
            nest: true,
        });

        const data = stock.map(item => ({
            nama_ras: item.ras?.nama_ras || 'Unknown',
            jumlah: parseInt(item.jumlah) || 0,
        }));

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error('Get stock chart error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data chart stok',
        });
    }
});

// GET /api/dashboard/recent-sales - Recent sales list
router.get('/recent-sales', authenticate, async (req, res) => {
    try {
        const where = { payment_status: 'confirmed' };

        // Kasir only sees their own
        if (req.user.role === 'kasir') {
            where.user_id = req.user.id;
        }

        const recentSales = await PenjualanHeader.findAll({
            where,
            include: [{ model: PenjualanDetail, as: 'details' }],
            order: [['tanggal_penjualan', 'DESC']],
            limit: 5,
        });

        res.json({
            success: true,
            data: recentSales,
        });
    } catch (error) {
        console.error('Get recent sales error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil penjualan terbaru',
        });
    }
});

// GET /api/laporan - Sales report with filters
router.get('/laporan', authenticate, async (req, res) => {
    try {
        const { start_date, end_date, page = 1, limit = 10 } = req.query;

        const where = { payment_status: 'confirmed' };

        // Kasir only sees their own
        if (req.user.role === 'kasir') {
            where.user_id = req.user.id;
        }

        if (start_date && end_date) {
            where.tanggal_penjualan = {
                [Op.between]: [new Date(start_date), new Date(end_date)],
            };
        } else if (start_date) {
            where.tanggal_penjualan = {
                [Op.gte]: new Date(start_date),
            };
        } else if (end_date) {
            where.tanggal_penjualan = {
                [Op.lte]: new Date(end_date),
            };
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await PenjualanHeader.findAndCountAll({
            where,
            include: [
                {
                    model: PenjualanDetail,
                    as: 'details',
                    include: [{ model: Kambing, as: 'kambing' }]
                },
            ],
            order: [['tanggal_penjualan', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true,
        });

        // Calculate totals
        const allSales = await PenjualanHeader.findAll({
            where,
            include: [
                {
                    model: PenjualanDetail,
                    as: 'details',
                    include: [{ model: Kambing, as: 'kambing' }]
                },
            ],
        });

        let totalPendapatan = 0;
        let totalModal = 0;
        let totalKambing = 0;

        allSales.forEach(sale => {
            totalPendapatan += parseInt(sale.total || 0);
            sale.details.forEach(detail => {
                totalModal += parseInt(detail.kambing?.harga_beli || 0);
                totalKambing++;
            });
        });

        const totalKeuntungan = totalPendapatan - totalModal;

        res.json({
            success: true,
            data: rows,
            summary: {
                totalPendapatan,
                totalModal,
                totalKeuntungan,
                totalKambing,
                totalTransaksi: count,
            },
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error('Get laporan error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil laporan',
        });
    }
});

// GET /api/dashboard/loyalty - Customer loyalty points leaderboard
router.get('/loyalty', authenticate, async (req, res) => {
    try {
        const topBuyers = await Customer.findAll({
            where: {
                total_points: {
                    [Op.gt]: 0
                }
            },
            order: [['total_points', 'DESC']],
            limit: 10,
        });

        res.json({
            success: true,
            data: topBuyers,
        });
    } catch (error) {
        console.error('Get loyalty leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data loyalitas',
        });
    }
});

export default router;
