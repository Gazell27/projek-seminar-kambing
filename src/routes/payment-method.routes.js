import express from 'express';
import { PaymentMethod } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/roleGuard.js';

const router = express.Router();

// GET /api/payment-methods - List all payment methods
router.get('/', authenticate, async (req, res) => {
    try {
        const methods = await PaymentMethod.findAll({
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
            message: 'Gagal mengambil data metode pembayaran',
        });
    }
});

// GET /api/payment-methods/:id - Get single
router.get('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const method = await PaymentMethod.findByPk(req.params.id);
        if (!method) {
            return res.status(404).json({
                success: false,
                message: 'Metode pembayaran tidak ditemukan',
            });
        }
        res.json({
            success: true,
            data: method,
        });
    } catch (error) {
        console.error('Get payment method error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data metode pembayaran',
        });
    }
});

// POST /api/payment-methods - Create (Admin only)
router.post('/', authenticate, adminOnly, async (req, res) => {
    try {
        const { name, type, account_name, account_number, logo, is_active } = req.body;

        if (!name || !type || !account_name || !account_number) {
            return res.status(400).json({
                success: false,
                message: 'Nama, tipe, nama akun, dan nomor akun wajib diisi',
            });
        }

        const method = await PaymentMethod.create({
            name,
            type,
            account_name,
            account_number,
            logo,
            is_active: is_active !== undefined ? is_active : true,
        });

        res.status(201).json({
            success: true,
            message: 'Metode pembayaran berhasil ditambahkan',
            data: method,
        });
    } catch (error) {
        console.error('Create payment method error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan metode pembayaran',
        });
    }
});

// PUT /api/payment-methods/:id - Update (Admin only)
router.put('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const method = await PaymentMethod.findByPk(req.params.id);
        if (!method) {
            return res.status(404).json({
                success: false,
                message: 'Metode pembayaran tidak ditemukan',
            });
        }

        const { name, type, account_name, account_number, logo, is_active } = req.body;

        if (name) method.name = name;
        if (type) method.type = type;
        if (account_name) method.account_name = account_name;
        if (account_number) method.account_number = account_number;
        if (logo !== undefined) method.logo = logo;
        if (is_active !== undefined) method.is_active = is_active;

        await method.save();

        res.json({
            success: true,
            message: 'Metode pembayaran berhasil diperbarui',
            data: method,
        });
    } catch (error) {
        console.error('Update payment method error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui metode pembayaran',
        });
    }
});

// DELETE /api/payment-methods/:id - Delete (Admin only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const method = await PaymentMethod.findByPk(req.params.id);
        if (!method) {
            return res.status(404).json({
                success: false,
                message: 'Metode pembayaran tidak ditemukan',
            });
        }

        await method.destroy();

        res.json({
            success: true,
            message: 'Metode pembayaran berhasil dihapus',
        });
    } catch (error) {
        console.error('Delete payment method error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus metode pembayaran',
        });
    }
});

export default router;
