import express from 'express';
import {
    Payment,
    PaymentMethod,
    PenjualanHeader,
    PenjualanDetail,
    Kambing,
    User,
    Customer,
    sequelize
} from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/roleGuard.js';
import { Op } from 'sequelize';

const router = express.Router();

// GET /api/payments - List pending payments (Admin)
router.get('/', authenticate, adminOnly, async (req, res) => {
    try {
        const { status = 'pending', page = 1, limit = 10 } = req.query;

        const where = {};
        if (status) {
            where.status = status;
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await Payment.findAndCountAll({
            where,
            include: [
                {
                    model: PenjualanHeader,
                    as: 'penjualanHeader',
                    include: [
                        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                        { model: PenjualanDetail, as: 'details' },
                    ]
                },
                { model: PaymentMethod, as: 'paymentMethod' },
                { model: User, as: 'confirmedByUser', attributes: ['id', 'name'] },
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            success: true,
            data: rows,
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data pembayaran',
        });
    }
});

// PUT /api/payments/:id/approve - Approve transfer payment (Admin)
router.put('/:id/approve', authenticate, adminOnly, async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const payment = await Payment.findByPk(req.params.id, {
            include: [
                {
                    model: PenjualanHeader,
                    as: 'penjualanHeader',
                    include: [{ model: PenjualanDetail, as: 'details' }]
                },
            ],
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Pembayaran tidak ditemukan',
            });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Pembayaran sudah diproses sebelumnya',
            });
        }

        // Update payment
        payment.status = 'confirmed';
        payment.confirmed_by = req.user.id;
        payment.confirmed_at = new Date();
        payment.notes = req.body.notes || null;
        await payment.save({ transaction: t });

        // Update penjualan header
        await PenjualanHeader.update(
            { payment_status: 'confirmed' },
            { where: { id: payment.penjualan_header_id }, transaction: t }
        );

        // Update kambing status from 'Dipesan' to 'Terjual'
        for (const detail of payment.penjualanHeader.details) {
            await Kambing.update(
                { status: 'Terjual' },
                { where: { id: detail.kambing_id, status: 'Dipesan' }, transaction: t }
            );
        }

        // Add points to customer after approval
        const header = payment.penjualanHeader;
        if (header.customer_id) {
            const customer = await Customer.findByPk(header.customer_id, { transaction: t });
            if (customer) {
                const pointsToEarn = Math.floor(header.total / 100000);
                customer.total_points += pointsToEarn;
                customer.total_spent = BigInt(customer.total_spent || 0) + BigInt(header.total);
                customer.transaction_count += 1;
                await customer.save({ transaction: t });
            }
        }

        await t.commit();

        res.json({
            success: true,
            message: 'Pembayaran berhasil dikonfirmasi',
        });
    } catch (error) {
        await t.rollback();
        console.error('Approve payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengkonfirmasi pembayaran',
        });
    }
});

// PUT /api/payments/:id/reject - Reject transfer payment (Admin)
router.put('/:id/reject', authenticate, adminOnly, async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const payment = await Payment.findByPk(req.params.id, {
            include: [
                {
                    model: PenjualanHeader,
                    as: 'penjualanHeader',
                    include: [{ model: PenjualanDetail, as: 'details' }]
                },
            ],
        });

        if (!payment) {
            return res.status(404).json({
                success: false,
                message: 'Pembayaran tidak ditemukan',
            });
        }

        if (payment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Pembayaran sudah diproses sebelumnya',
            });
        }

        const { notes } = req.body;
        if (!notes) {
            return res.status(400).json({
                success: false,
                message: 'Alasan penolakan wajib diisi',
            });
        }

        // Update payment
        payment.status = 'rejected';
        payment.confirmed_by = req.user.id;
        payment.confirmed_at = new Date();
        payment.notes = notes;
        await payment.save({ transaction: t });

        // Update penjualan header
        await PenjualanHeader.update(
            { payment_status: 'rejected' },
            { where: { id: payment.penjualan_header_id }, transaction: t }
        );

        // Restore kambing status from 'Dipesan' to 'Tersedia'
        for (const detail of payment.penjualanHeader.details) {
            await Kambing.update(
                { status: 'Tersedia' },
                { where: { id: detail.kambing_id, status: 'Dipesan' }, transaction: t }
            );
        }

        await t.commit();

        res.json({
            success: true,
            message: 'Pembayaran ditolak',
        });
    } catch (error) {
        await t.rollback();
        console.error('Reject payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menolak pembayaran',
        });
    }
});

// GET /api/payment-methods - List active payment methods
router.get('/methods', authenticate, async (req, res) => {
    try {
        const methods = await PaymentMethod.findAll({
            where: { is_active: true },
            order: [['type', 'ASC'], ['name', 'ASC']],
        });

        res.json({
            success: true,
            data: methods,
        });
    } catch (error) {
        console.error('Get payment methods error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil metode pembayaran',
        });
    }
});

export default router;
