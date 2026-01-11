import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Customer = sequelize.define('Customer', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    contact: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    total_points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    total_spent: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
    },
    transaction_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
}, {
    tableName: 'customers',
    timestamps: true,
});

export default Customer;
