import { User, sequelize } from '../models/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const update = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected to database...');

        // Update Admin
        const admin = await User.findOne({ where: { email: 'admin@goatfarm.com' } });
        if (admin) {
            admin.password = 'password123'; // beforeUpdate hook will hash this
            await admin.save();
            console.log('✅ Updated admin password');
        }

        // Update Kasir
        const kasir = await User.findOne({ where: { email: 'kasir@goatfarm.com' } });
        if (kasir) {
            kasir.password = 'password123';
            await kasir.save();
            console.log('✅ Updated kasir password');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Update failed:', error);
        process.exit(1);
    }
};

update();
