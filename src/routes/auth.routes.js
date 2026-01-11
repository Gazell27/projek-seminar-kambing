import express from 'express';
import { User } from '../models/index.js';
import { authenticate, generateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email dan password wajib diisi',
            });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah',
            });
        }

        if (!user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Akun tidak aktif. Hubungi administrator.',
            });
        }

        const isValidPassword = await user.validatePassword(password);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah',
            });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login berhasil',
            data: {
                user: user.toJSON(),
                token,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan server',
        });
    }
});

// POST /api/auth/logout
router.post('/logout', authenticate, (req, res) => {
    // In JWT, logout is handled client-side by removing the token
    res.json({
        success: true,
        message: 'Logout berhasil',
    });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
    res.json({
        success: true,
        data: req.user.toJSON(),
    });
});

// PUT /api/auth/profile
router.put('/profile', authenticate, async (req, res) => {
    try {
        const { name, phone } = req.body;
        const user = req.user;

        if (name) user.name = name;
        if (phone) user.phone = phone;

        await user.save();

        res.json({
            success: true,
            message: 'Profil berhasil diperbarui',
            data: user.toJSON(),
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui profil',
        });
    }
});

// PUT /api/auth/password
router.put('/password', authenticate, async (req, res) => {
    try {
        const { current_password, new_password } = req.body;
        const user = req.user;

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: 'Password lama dan baru wajib diisi',
            });
        }

        const isValid = await user.validatePassword(current_password);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Password lama salah',
            });
        }

        user.password = new_password;
        await user.save();

        res.json({
            success: true,
            message: 'Password berhasil diperbarui',
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui password',
        });
    }
});

export default router;
