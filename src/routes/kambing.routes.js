import express from 'express';
import { Kambing, Ras, EstimasiHargaJual } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/roleGuard.js';
import { Op } from 'sequelize';

const router = express.Router();

// GET /api/kambing - List all kambing
router.get('/', authenticate, async (req, res) => {
    try {
        const { search, status, ras_id, page, limit = 10 } = req.query;

        const where = {};

        if (search) {
            where[Op.or] = [
                { kode_kambing: { [Op.like]: `%${search}%` } },
            ];
        }

        if (status) {
            where.status = status;
        }

        if (ras_id) {
            where.ras_id = ras_id;
        }

        const include = [
            { model: Ras, as: 'ras' },
            { model: EstimasiHargaJual, as: 'estimasiHarga' },
        ];

        // If no pagination, return all
        if (!page) {
            const kambing = await Kambing.findAll({
                where,
                include,
                order: [['kode_kambing', 'ASC']]
            });
            return res.json({
                success: true,
                data: kambing,
            });
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await Kambing.findAndCountAll({
            where,
            include,
            order: [['kode_kambing', 'ASC']],
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
        console.error('Get kambing error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data kambing',
        });
    }
});

// GET /api/kambing/tersedia - List available kambing
router.get('/tersedia', authenticate, async (req, res) => {
    try {
        const kambing = await Kambing.findAll({
            where: { status: 'Tersedia' },
            include: [
                { model: Ras, as: 'ras' },
                { model: EstimasiHargaJual, as: 'estimasiHarga' },
            ],
            order: [['kode_kambing', 'ASC']],
        });

        res.json({
            success: true,
            data: kambing,
        });
    } catch (error) {
        console.error('Get kambing tersedia error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data kambing tersedia',
        });
    }
});

// GET /api/kambing/:id
router.get('/:id', authenticate, async (req, res) => {
    try {
        const kambing = await Kambing.findByPk(req.params.id, {
            include: [
                { model: Ras, as: 'ras' },
                { model: EstimasiHargaJual, as: 'estimasiHarga' },
            ],
        });

        if (!kambing) {
            return res.status(404).json({
                success: false,
                message: 'Kambing tidak ditemukan',
            });
        }

        res.json({
            success: true,
            data: kambing,
        });
    } catch (error) {
        console.error('Get kambing error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data kambing',
        });
    }
});

// POST /api/kambing - Create (Admin only)
router.post('/', authenticate, adminOnly, async (req, res) => {
    try {
        const {
            ras_id,
            tanggal_masuk,
            range_berat,
            harga_beli,
            jenis_kelamin,
            estimasi_harga_id
        } = req.body;

        if (!ras_id) {
            return res.status(400).json({
                success: false,
                message: 'Ras wajib dipilih',
            });
        }

        // Generate kode_kambing based on max suffix
        const kambingList = await Kambing.findAll({ attributes: ['kode_kambing'] });
        let nextNumber = 1;
        if (kambingList.length > 0) {
            const numbers = kambingList.map(k => {
                const match = k.kode_kambing.match(/\d+/);
                return match ? parseInt(match[0]) : 0;
            });
            nextNumber = Math.max(...numbers) + 1;
        }
        const kode_kambing = `KMB${String(nextNumber).padStart(3, '0')}`;

        const kambing = await Kambing.create({
            kode_kambing,
            ras_id,
            tanggal_masuk: tanggal_masuk || new Date(),
            range_berat,
            harga_beli: harga_beli || 0,
            jenis_kelamin,
            estimasi_harga_id,
            status: 'Tersedia',
        });

        // Reload with associations
        await kambing.reload({
            include: [
                { model: Ras, as: 'ras' },
                { model: EstimasiHargaJual, as: 'estimasiHarga' },
            ],
        });

        res.status(201).json({
            success: true,
            message: 'Kambing berhasil ditambahkan',
            data: kambing,
        });
    } catch (error) {
        console.error('Create kambing error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan kambing',
        });
    }
});

// PUT /api/kambing/:id (Admin only)
router.put('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const kambing = await Kambing.findByPk(req.params.id);

        if (!kambing) {
            return res.status(404).json({
                success: false,
                message: 'Kambing tidak ditemukan',
            });
        }

        const {
            ras_id,
            tanggal_masuk,
            range_berat,
            harga_beli,
            jenis_kelamin,
            estimasi_harga_id,
            status
        } = req.body;

        if (ras_id) kambing.ras_id = ras_id;
        if (tanggal_masuk) kambing.tanggal_masuk = tanggal_masuk;
        if (range_berat !== undefined) kambing.range_berat = range_berat;
        if (harga_beli !== undefined) kambing.harga_beli = harga_beli;
        if (jenis_kelamin !== undefined) kambing.jenis_kelamin = jenis_kelamin;
        if (estimasi_harga_id !== undefined) kambing.estimasi_harga_id = estimasi_harga_id;
        if (status) kambing.status = status;

        await kambing.save();

        // Reload with associations
        await kambing.reload({
            include: [
                { model: Ras, as: 'ras' },
                { model: EstimasiHargaJual, as: 'estimasiHarga' },
            ],
        });

        res.json({
            success: true,
            message: 'Kambing berhasil diperbarui',
            data: kambing,
        });
    } catch (error) {
        console.error('Update kambing error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui kambing',
        });
    }
});

// DELETE /api/kambing/:id (Admin only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const kambing = await Kambing.findByPk(req.params.id);

        if (!kambing) {
            return res.status(404).json({
                success: false,
                message: 'Kambing tidak ditemukan',
            });
        }

        if (kambing.status !== 'Tersedia') {
            return res.status(400).json({
                success: false,
                message: 'Tidak dapat menghapus kambing yang sudah terjual atau dipesan',
            });
        }

        await kambing.destroy();

        res.json({
            success: true,
            message: 'Kambing berhasil dihapus',
        });
    } catch (error) {
        console.error('Delete kambing error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus kambing',
        });
    }
});

export default router;
