import express from 'express';
import { Setting } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/roleGuard.js';

const router = express.Router();

// GET /api/settings - Get all settings (Admin only)
router.get('/', authenticate, adminOnly, async (req, res) => {
    try {
        const settings = await Setting.findAll();

        // Convert to key-value object
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });

        res.json({
            success: true,
            data: settingsObj,
        });
    } catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil pengaturan',
        });
    }
});

// PUT /api/settings - Update settings (Admin only)
router.put('/', authenticate, adminOnly, async (req, res) => {
    try {
        const updates = req.body;

        for (const [key, value] of Object.entries(updates)) {
            await Setting.upsert({
                key,
                value: String(value),
            });
        }

        // Get updated settings
        const settings = await Setting.findAll();
        const settingsObj = {};
        settings.forEach(s => {
            settingsObj[s.key] = s.value;
        });

        res.json({
            success: true,
            message: 'Pengaturan berhasil diperbarui',
            data: settingsObj,
        });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal memperbarui pengaturan',
        });
    }
});

export default router;
