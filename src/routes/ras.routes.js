import express from 'express';
import { Ras, Kambing } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/roleGuard.js';
import { Op } from 'sequelize';

const router = express.Router();

// GET /api/ras - List all ras
router.get('/', authenticate, async (req, res) => {
    try {
        const { search, page, limit = 10 } = req.query;

        const where = {};

        if (search) {
            where[Op.or] = [
                { kode_ras: { [Op.like]: `%${search}%` } },
                { nama_ras: { [Op.like]: `%${search}%` } },
            ];
        }

        // If no pagination, return all
        if (!page) {
            const ras = await Ras.findAll({ where, order: [['nama_ras', 'ASC']] });
            return res.json({
                success: true,
                data: ras,
            });
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await Ras.findAndCountAll({
            where,
            order: [['kode_ras', 'ASC']],
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
        console.error('Get ras error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data ras',
        });
    }
});

// GET /api/ras/:id - Get ras by ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const ras = await Ras.findByPk(req.params.id, {
            include: [{ model: Kambing, as: 'kambing' }],
        });

        if (!ras) {
            return res.status(404).json({
                success: false,
                message: 'Ras tidak ditemukan',
            });
        }

        res.json({
            success: true,
            data: ras,
        });
    } catch (error) {
        console.error('Get ras error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data ras',
        });
    }
});

// POST /api/ras - Create new ras (Admin only)
router.post('/', authenticate, adminOnly, async (req, res) => {
    try {
        const { nama_ras, keterangan } = req.body;

        if (!nama_ras) {
            return res.status(400).json({
                success: false,
                message: 'Nama ras wajib diisi',
            });
        }

        // Generate kode_ras based on maximum numeric suffix
        const rasList = await Ras.findAll({ attributes: ['kode_ras'] });
        let nextNumber = 1;
        if (rasList.length > 0) {
            const numbers = rasList.map(r => {
                const match = r.kode_ras.match(/\d+/);
                return match ? parseInt(match[0]) : 0;
            });
            nextNumber = Math.max(...numbers) + 1;
        }
        const kode_ras = `RAS${String(nextNumber).padStart(3, '0')}`;

        const ras = await Ras.create({
            kode_ras,
            nama_ras,
            keterangan,
        });

        res.status(201).json({
            success: true,
            message: 'Ras berhasil dibuat',
            data: ras,
        });
    } catch (error) {
        console.error('Create ras error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat ras',
        });
    }
});

// PUT /api/ras/:id - Update ras (Admin only)
router.put('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const ras = await Ras.findByPk(req.params.id);

        if (!ras) {
            return res.status(404).json({
                success: false,
                message: 'Ras tidak ditemukan',
            });
        }

        const { nama_ras, keterangan } = req.body;

        if (nama_ras) ras.nama_ras = nama_ras;
        if (keterangan !== undefined) ras.keterangan = keterangan;

        await ras.save();

        res.json({
            success: true,
            message: 'Ras berhasil diperbarui',
            data: ras,
        });
    } catch (error) {
        console.error('Update ras error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui ras',
        });
    }
});

// DELETE /api/ras/:id - Delete ras (Admin only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const ras = await Ras.findByPk(req.params.id);

        if (!ras) {
            return res.status(404).json({
                success: false,
                message: 'Ras tidak ditemukan',
            });
        }

        // Check if ras is used by kambing
        const kambingCount = await Kambing.count({ where: { ras_id: ras.id } });
        if (kambingCount > 0) {
            return res.status(400).json({
                success: false,
                message: `Tidak dapat menghapus ras yang masih digunakan oleh ${kambingCount} kambing`,
            });
        }

        await ras.destroy();

        res.json({
            success: true,
            message: 'Ras berhasil dihapus',
        });
    } catch (error) {
        console.error('Delete ras error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus ras',
        });
    }
});

export default router;
