import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PaymentMethod = sequelize.define('PaymentMethod', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    type: {
        type: DataTypes.ENUM('bank', 'ewallet'),
        allowNull: false,
    },
    account_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    account_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    logo: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
}, {
    tableName: 'payment_methods',
    timestamps: true,
    scopes: {
        active: {
            where: { is_active: true },
        },
    },
});

export default PaymentMethod;
