import { User, Setting, PaymentMethod, sequelize } from '../models/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env from one level up
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seed = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database for seeding...');

        // Ensure tables exist
        await sequelize.sync();
        console.log('Database tables synchronized.');

        // 1. Create Admin User
        const adminExists = await User.findOne({ where: { role: 'admin' } });
        if (!adminExists) {
            await User.create({
                name: 'Administrator',
                email: 'admin@goatfarm.com',
                password: 'password123',
                role: 'admin',
                is_active: true,
                kode_user: 'ADM001',
            });
            console.log('✅ Admin user created: admin@goatfarm.com / password123');
        } else {
            console.log('ℹ️ Admin user already exists');
        }

        // 2. Create Kasir User
        const kasirExists = await User.findOne({ where: { role: 'kasir' } });
        if (!kasirExists) {
            await User.create({
                name: 'Kasir Satu',
                email: 'kasir@goatfarm.com',
                password: 'password123',
                role: 'kasir',
                is_active: true,
                kode_user: 'KSR001',
            });
            console.log('✅ Kasir user created: kasir@goatfarm.com / password123');
        }

        // 3. Seed Settings
        const defaultSettings = [
            { key: 'nama_peternakan', value: 'GoatFarm Mandiri' },
            { key: 'alamat', value: 'Jl. Peternakan No. 123, Bogor' },
            { key: 'telepon', value: '08123456789' },
            { key: 'email_notifikasi', value: '1' },
            { key: 'notif_stok_rendah', value: '1' },
            { key: 'notif_transaksi_baru', value: '1' },
        ];

        for (const s of defaultSettings) {
            const [setting, created] = await Setting.findOrCreate({
                where: { key: s.key },
                defaults: { value: s.value }
            });
            if (created) console.log(`✅ Setting created: ${s.key}`);
        }

        // 4. Seed Payment Methods
        const defaultMethods = [
            { name: 'Bank Central Asia (BCA)', account_number: '1234567890', account_name: 'GoatFarm Mandiri', type: 'bank', is_active: true },
            { name: 'Bank Mandiri', account_number: '0987654321', account_name: 'GoatFarm Mandiri', type: 'bank', is_active: true },
            { name: 'GoPay', account_number: '08123456789', account_name: 'GoatFarm Mandiri', type: 'ewallet', is_active: true },
            { name: 'OVO', account_number: '08123456789', account_name: 'GoatFarm Mandiri', type: 'ewallet', is_active: true },
        ];

        for (const m of defaultMethods) {
            const [method, created] = await PaymentMethod.findOrCreate({
                where: { name: m.name },
                defaults: m
            });
            if (created) console.log(`✅ Payment method created: ${m.name}`);
        }

        console.log('🚀 Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seed();
