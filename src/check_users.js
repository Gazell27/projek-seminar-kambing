
import { User } from './models/index.js';
import bcrypt from 'bcryptjs';

const checkUsers = async () => {
    try {
        const users = await User.findAll();
        console.log('Total users:', users.length);
        for (const u of users) {
            console.log(`User: ${u.email}, Role: ${u.role}, Password Hash: ${u.password ? u.password.substring(0, 10) + '...' : 'NULL'}`);
            // Verify default password
            if (u.email === 'admin@goatfarm.com') {
                const isMatch = await bcrypt.compare('password', u.password);
                console.log(`Password 'password' matches for admin: ${isMatch}`);
            }
        }
    } catch (error) {
        console.error(error);
    }
    process.exit();
};

checkUsers();
