
import sequelize from './config/database.js';
import './models/index.js';

const updateDb = async () => {
    try {
        await sequelize.sync({ alter: true });
        console.log('Database updated successfully');
        process.exit(0);
    } catch (error) {
        console.error('Failed to update database:', error);
        process.exit(1);
    }
};

updateDb();
