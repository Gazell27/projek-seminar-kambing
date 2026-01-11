import express from 'express';
import {
    PenjualanHeader,
    PenjualanDetail,
    Kambing,
    Ras,
    EstimasiHargaJual,
    Payment,
    PaymentMethod,
    User,
    Customer,
    sequelize
} from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { adminOnly } from '../middleware/roleGuard.js';
import { uploadBuktiTransfer } from '../middleware/upload.js';
import { Op } from 'sequelize';

const router = express.Router();

// GET /api/penjualan - List penjualan
router.get('/', authenticate, async (req, res) => {
    try {
        const { search, status, page = 1, limit = 10 } = req.query;

        const where = {};

        // Kasir can only see their own transactions
        if (req.user.role === 'kasir') {
            where.user_id = req.user.id;
        }

        if (search) {
            where[Op.or] = [
                { nomor_penjualan: { [Op.like]: `%${search}%` } },
                { nama_pembeli: { [Op.like]: `%${search}%` } },
            ];
        }

        if (status) {
            where.payment_status = status;
        }

        const offset = (page - 1) * limit;

        const { count, rows } = await PenjualanHeader.findAndCountAll({
            where,
            include: [
                {
                    model: PenjualanDetail,
                    as: 'details',
                    include: [
                        { model: Kambing, as: 'kambing' }
                    ]
                },
                {
                    model: Payment,
                    as: 'payment',
                    include: [
                        { model: PaymentMethod, as: 'paymentMethod' }
                    ]
                },
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true,
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
        console.error('Get penjualan error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data penjualan',
        });
    }
});

// GET /api/penjualan/check-points
router.get('/check-points', authenticate, async (req, res) => {
    try {
        const { contact } = req.query;
        if (!contact) {
            return res.status(400).json({
                success: false,
                message: 'Nomor kontak wajib diisi'
            });
        }

        // Remove all non-digit characters for flexible matching
        const cleanContact = contact.replace(/\D/g, '');

        // Try to find exact match first, or potential match if needed
        // For now, assuming DB stores clean numbers
        const customer = await Customer.findOne({ where: { contact: cleanContact } });

        if (!customer) {
            return res.json({
                success: true,
                data: {
                    points: 0,
                    value: 0,
                    exists: false
                }
            });
        }

        res.json({
            success: true,
            data: {
                points: customer.total_points,
                value: customer.total_points * 1000,
                name: customer.name,
                exists: true
            }
        });
    } catch (error) {
        console.error('Check points error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengecek poin',
        });
    }
});

// GET /api/penjualan/:id
router.get('/:id', authenticate, async (req, res) => {
    try {
        const where = { id: req.params.id };

        // Kasir can only see their own
        if (req.user.role === 'kasir') {
            where.user_id = req.user.id;
        }

        const penjualan = await PenjualanHeader.findOne({
            where,
            include: [
                {
                    model: PenjualanDetail,
                    as: 'details',
                    include: [
                        {
                            model: Kambing,
                            as: 'kambing',
                            include: [
                                { model: Ras, as: 'ras' },
                                { model: EstimasiHargaJual, as: 'estimasiHarga' },
                            ]
                        }
                    ]
                },
                {
                    model: Payment,
                    as: 'payment',
                    include: [
                        { model: PaymentMethod, as: 'paymentMethod' }
                    ]
                },
                { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
                { model: Customer, as: 'customer' },

            ],
        });

        if (!penjualan) {
            return res.status(404).json({
                success: false,
                message: 'Penjualan tidak ditemukan',
            });
        }

        res.json({
            success: true,
            data: penjualan,
        });
    } catch (error) {
        console.error('Get penjualan error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data penjualan',
        });
    }
});



// POST /api/penjualan - Create new sale
router.post('/', authenticate, uploadBuktiTransfer.single('bukti_transfer'), async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const {
            nama_pembeli,
            nomor_contact,
            alamat_pembeli,
            items, // Array of { kambing_id, harga_jual }
            metode_pembayaran,
            payment_method_id,
            points_redeemed = 0
        } = req.body;

        // Parse items if string
        const parsedItems = typeof items === 'string' ? JSON.parse(items) : items;

        // Strip non-digits from nomor_contact for consistent lookup
        const cleanContact = nomor_contact ? nomor_contact.replace(/\D/g, '') : nomor_contact;
        const finalContact = cleanContact; // we'll use this for customer lookup

        if (!nama_pembeli || !nomor_contact) {
            return res.status(400).json({
                success: false,
                message: 'Nama pembeli dan nomor kontak wajib diisi',
            });
        }

        if (!parsedItems || parsedItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Pilih minimal 1 kambing untuk dijual',
            });
        }

        // Validate transfer payment
        if (metode_pembayaran === 'transfer') {
            if (!payment_method_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Pilih metode pembayaran transfer',
                });
            }
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Upload bukti transfer',
                });
            }
        }

        // Generate nomor penjualan
        const last = await PenjualanHeader.findOne({ order: [['id', 'DESC']] });
        const nextId = last ? last.id + 1 : 1;
        const nomor_penjualan = `PJL${String(nextId).padStart(3, '0')}`;

        // Calculate total
        let total = parsedItems.reduce((sum, item) => sum + parseInt(item.harga_jual || 0), 0);
        const originalTotal = total;
        let discountAmount = 0;

        // Handle Point Redemption
        if (parseInt(points_redeemed) > 0) {
            const customerCheck = await Customer.findOne({
                where: { contact: cleanContact },
                transaction: t
            });

            if (!customerCheck) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Data member tidak ditemukan untuk penukaran poin',
                });
            }

            if (customerCheck.total_points < points_redeemed) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Poin tidak mencukupi',
                });
            }

            discountAmount = parseInt(points_redeemed) * 1000;

            if (discountAmount > originalTotal) {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Nilai voucher melebihi total belanja',
                });
            }

            total = originalTotal - discountAmount;

            // Deduct points immediatelly (locked)
            // If transaction fails or rejected later, logic to restore points might be needed,
            // but for now we assume if created successfully, points are used.
            // If payment is pending, points are effectively "reserved".
            customerCheck.total_points -= parseInt(points_redeemed);
            await customerCheck.save({ transaction: t });
        }

        // Determine payment status
        const paymentStatus = metode_pembayaran === 'cash' ? 'confirmed' : 'pending';

        // Create or update customer for points earning (POINTS ARE EARNED BASED ON FINAL PAID AMOUNT)
        let customer = await Customer.findOne({
            where: { contact: cleanContact },
            transaction: t
        });

        // Use total (after discount) for calculating NEW points earned
        const pointsToEarn = Math.floor(total / 100000); // 1 point per Rp 100.000

        if (customer) {
            customer.name = nama_pembeli;
            customer.address = alamat_pembeli;
            if (paymentStatus === 'confirmed') {
                customer.total_points += pointsToEarn;
                customer.total_spent = BigInt(customer.total_spent || 0) + BigInt(total);
                customer.transaction_count += 1;
            }
            await customer.save({ transaction: t });
        } else {
            customer = await Customer.create({
                name: nama_pembeli,
                contact: cleanContact,
                address: alamat_pembeli,
                total_points: paymentStatus === 'confirmed' ? pointsToEarn : 0,
                total_spent: paymentStatus === 'confirmed' ? total : 0,
                transaction_count: paymentStatus === 'confirmed' ? 1 : 0,
            }, { transaction: t });
        }

        // Create header
        const header = await PenjualanHeader.create({
            nomor_penjualan,
            tanggal_penjualan: new Date(),
            nama_pembeli,
            nomor_contact: cleanContact,
            alamat_pembeli,
            user_id: req.user.id,
            customer_id: customer.id, // Link to customer
            total,
            points_redeemed: parseInt(points_redeemed) || 0,
            discount_amount: discountAmount,
            metode_pembayaran: metode_pembayaran || 'cash',
            payment_status: paymentStatus,
        }, { transaction: t });

        // Create details and update kambing status
        for (const item of parsedItems) {
            const kambing = await Kambing.findByPk(item.kambing_id, {
                include: [{ model: EstimasiHargaJual, as: 'estimasiHarga' }],
                transaction: t,
            });

            if (!kambing || kambing.status !== 'Tersedia') {
                await t.rollback();
                return res.status(400).json({
                    success: false,
                    message: `Kambing ${item.kambing_id} tidak tersedia`,
                });
            }

            await PenjualanDetail.create({
                penjualan_header_id: header.id,
                kambing_id: item.kambing_id,
                harga_jual: item.harga_jual,
                range_berat: kambing.estimasiHarga?.range_berat,
                estimasi_harga: kambing.estimasiHarga?.estimasi_harga,
            }, { transaction: t });

            // Update kambing status
            kambing.status = paymentStatus === 'confirmed' ? 'Terjual' : 'Dipesan';
            await kambing.save({ transaction: t });
        }

        // Create payment record
        await Payment.create({
            penjualan_header_id: header.id,
            method: metode_pembayaran || 'cash',
            payment_method_id: metode_pembayaran === 'transfer' ? payment_method_id : null,
            amount: total,
            status: paymentStatus,
            proof_path: req.file ? req.file.path.replace(/\\/g, '/') : null,
        }, { transaction: t });

        await t.commit();

        // Reload with associations
        const result = await PenjualanHeader.findByPk(header.id, {
            include: [
                { model: PenjualanDetail, as: 'details' },
                { model: Payment, as: 'payment' },
            ],
        });

        const message = paymentStatus === 'confirmed'
            ? 'Transaksi berhasil disimpan!'
            : 'Transaksi berhasil dibuat. Menunggu konfirmasi admin.';

        res.status(201).json({
            success: true,
            message,
            data: result,
        });
    } catch (error) {
        await t.rollback();
        console.error('Create penjualan error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal membuat transaksi: ' + error.message,
        });
    }
});

// DELETE /api/penjualan/:id (Admin only)
router.delete('/:id', authenticate, adminOnly, async (req, res) => {
    const t = await sequelize.transaction();

    try {
        const penjualan = await PenjualanHeader.findByPk(req.params.id, {
            include: [{ model: PenjualanDetail, as: 'details' }],
        });

        if (!penjualan) {
            return res.status(404).json({
                success: false,
                message: 'Penjualan tidak ditemukan',
            });
        }

        // Restore kambing status
        for (const detail of penjualan.details) {
            await Kambing.update(
                { status: 'Tersedia' },
                { where: { id: detail.kambing_id }, transaction: t }
            );
        }

        // Delete payment, details, then header
        await Payment.destroy({ where: { penjualan_header_id: penjualan.id }, transaction: t });
        await PenjualanDetail.destroy({ where: { penjualan_header_id: penjualan.id }, transaction: t });
        await penjualan.destroy({ transaction: t });

        await t.commit();

        res.json({
            success: true,
            message: 'Penjualan berhasil dihapus',
        });
    } catch (error) {
        await t.rollback();
        console.error('Delete penjualan error:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus penjualan',
        });
    }
});

export default router;
