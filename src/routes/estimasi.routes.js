import express from 'express';
import { EstimasiHargaJual, Kambing } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/roleGuard.js';
import { Op } from 'sequelize';

const router = express.Router();

// GET /api/estimasi - List all estimasi
router.get('/', authenticate, async (req, res) => {
    try {
        const { search, page, limit = 10 } = req.query;

        const where = {};

        if (search) {
            where[Op.or] = [
                { kode_estimasi: { [Op.like]: `%${search}%` } },
                { range_berat: { [Op.like]: `%${search}%` } },
            ];
        }

        // If no pagination, return all
        if (!page) {
            const estimasi = await EstimasiHargaJual.findAll({
                where,
                order: [['estimasi_harga', 'ASC']]
            });
            return res.json({
                success: true,
                data: estimasi,
            });
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await EstimasiHargaJual.findAndCountAll({
            where,
            order: [['kode_estimasi', 'ASC']],
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
        console.error('Get estimasi error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data estimasi',
        });
    }
});

// GET /api/estimasi/:id
router.get('/:id', authenticate, async (req, res) => {
    try {
        const estimasi = await EstimasiHargaJual.findByPk(req.params.id);

        if (!estimasi) {
            return res.status(404).json({
                success: false,
                message: 'Estimasi tidak ditemukan',
            });
        }

        res.json({
            success: true,
            data: estimasi,
        });
    } catch (error) {
        console.error('Get estimasi error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data estimasi',
        });
    }
});

// POST /api/estimasi - Create (Admin only)
router.post('/', authenticate, adminOnly, async (req, res) => {
    try {
        const { range_berat, estimasi_harga, keterangan } = req.body;

        if (!range_berat || !estimasi_harga) {
            return res.status(400).json({
                success: false,
                message: 'Range berat dan estimasi harga wajib diisi',
            });
        }

        // Generate kode_estimasi based on max suffix
        const estimasiList = await EstimasiHargaJual.findAll({ attributes: ['kode_estimasi'] });
        let nextNumber = 1;
        if (estimasiList.length > 0) {
            const numbers = estimasiList.map(e => {
                const match = e.kode_estimasi.match(/\d+/);
                return match ? parseInt(match[0]) : 0;
            });
            nextNumber = Math.max(...numbers) + 1;
        }
        const kode_estimasi = `EST${String(nextNumber).padStart(3, '0')}`;

        const estimasi = await EstimasiHargaJual.create({
            kode_estimasi,
            range_berat,
            estimasi_harga,
            keterangan,
        });

        res.status(201).json({
            success: true,
            message: 'Estimasi berhasil dibuat',
            data: estimasi,
        });
    } catch (error) {
        console.error('Create estimasi error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat estimasi',
        });
    }
});

// PUT /api/estimasi/:id (Admin only)
router.put('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const estimasi = await EstimasiHargaJual.findByPk(req.params.id);

        if (!estimasi) {
            return res.status(404).json({
                success: false,
                message: 'Estimasi tidak ditemukan',
            });
        }

        const { range_berat, estimasi_harga, keterangan } = req.body;

        if (range_berat) estimasi.range_berat = range_berat;
        if (estimasi_harga) estimasi.estimasi_harga = estimasi_harga;
        if (keterangan !== undefined) estimasi.keterangan = keterangan;

        await estimasi.save();

        res.json({
            success: true,
            message: 'Estimasi berhasil diperbarui',
            data: estimasi,
        });
    } catch (error) {
        console.error('Update estimasi error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui estimasi',
        });
    }
});

// DELETE /api/estimasi/:id (Admin only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const estimasi = await EstimasiHargaJual.findByPk(req.params.id);

        if (!estimasi) {
            return res.status(404).json({
                success: false,
                message: 'Estimasi tidak ditemukan',
            });
        }

        // Check if used by kambing
        const kambingCount = await Kambing.count({ where: { estimasi_harga_id: estimasi.id } });
        if (kambingCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Tidak dapat menghapus estimasi yang masih digunakan oleh ${kambingCount} kambing`,
            });
        }

        await estimasi.destroy();

        res.json({
            success: true,
            message: 'Estimasi berhasil dihapus',
        });
    } catch (error) {
        console.error('Delete estimasi error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus estimasi',
        });
    }
});

export default router;
