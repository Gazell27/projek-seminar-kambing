import { User, Setting, PaymentMethod, sequelize } from '../models/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const seed = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database...');
        await sequelize.sync();

        // Reset users if they exist to be absolutely sure
        await User.destroy({ where: {}, truncate: true, force: true });
        console.log('Cleared existing users.');

        // 1. Create Admin User
        await User.create({
            name: 'Administrator',
            email: 'admin@goatfarm.com',
            password: 'password123',
            role: 'admin',
            is_active: true,
            kode_user: 'ADM001',
        });
        console.log('✅ Admin user created: admin@goatfarm.com / password123');

        // 2. Create Kasir User
        await User.create({
            name: 'Kasir Satu',
            email: 'kasir@goatfarm.com',
            password: 'password123',
            role: 'kasir',
            is_active: true,
            kode_user: 'KSR001',
        });
        console.log('✅ Kasir user created: kasir@goatfarm.com / password123');

        console.log('🚀 Seeding completed for login fix!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seed();
