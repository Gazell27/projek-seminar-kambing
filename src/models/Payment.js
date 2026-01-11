import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    penjualan_header_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: 'penjualan_header',
            key: 'id',
        },
    },
    method: {
        type: DataTypes.ENUM('cash', 'transfer'),
        defaultValue: 'cash',
    },
    payment_method_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
            model: 'payment_methods',
            key: 'id',
        },
    },
    amount: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'rejected'),
        defaultValue: 'pending',
    },
    proof_path: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    confirmed_by: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    confirmed_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'payments',
    timestamps: true,
});

export default Payment;
