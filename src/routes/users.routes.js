import express from 'express';
import { User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/roleGuard.js';
import { Op } from 'sequelize';

const router = express.Router();

// GET /api/users - List all users (Admin only)
router.get('/', authenticate, adminOnly, async (req, res) => {
    try {
        const { search, role, page = 1, limit = 10 } = req.query;

        const where = {};

        if (search) {
            where[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } },
                { kode_user: { [Op.like]: `%${search}%` } },
            ];
        }

        if (role) {
            where.role = role;
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await User.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
        });

        res.json({
            success: true,
            data: rows.map(u => u.toJSON()),
            pagination: {
                total: count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data users',
        });
    }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan',
            });
        }

        res.json({
            success: true,
            data: user.toJSON(),
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data user',
        });
    }
});

// POST /api/users - Create new user
router.post('/', authenticate, adminOnly, async (req, res) => {
    try {
        const { name, email, phone, role, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Nama, email, dan password wajib diisi',
            });
        }

        // Check if email exists
        const existing = await User.findOne({ where: { email } });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Email sudah terdaftar',
            });
        }

        // Generate kode_user
        const lastUser = await User.findOne({ order: [['id', 'DESC']] });
        const nextId = lastUser ? lastUser.id + 1 : 1;
        const kode_user = `USR${String(nextId).padStart(3, '0')}`;

        const user = await User.create({
            kode_user,
            name,
            email,
            phone,
            role: role || 'kasir',
            password,
            is_active: true,
        });

        res.status(201).json({
            success: true,
            message: 'User berhasil dibuat',
            data: user.toJSON(),
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat user',
        });
    }
});

// PUT /api/users/:id - Update user
router.put('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan',
            });
        }

        const { name, email, phone, role, is_active, password } = req.body;

        // Check email uniqueness if changed
        if (email && email !== user.email) {
            const existing = await User.findOne({ where: { email } });
            if (existing) {
                return res.status(400).json({
                    success: false,
                    message: 'Email sudah terdaftar',
                });
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;
        if (role) user.role = role;
        if (is_active !== undefined) user.is_active = is_active;
        if (password) user.password = password;

        await user.save();

        res.json({
            success: true,
            message: 'User berhasil diperbarui',
            data: user.toJSON(),
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui user',
        });
    }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User tidak ditemukan',
            });
        }

        // Prevent self-delete
        if (user.id === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Tidak dapat menghapus akun sendiri',
            });
        }

        await user.destroy();

        res.json({
            success: true,
            message: 'User berhasil dihapus',
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus user',
        });
    }
});

export default router;
