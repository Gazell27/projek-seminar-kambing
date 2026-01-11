import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PenjualanHeader = sequelize.define('PenjualanHeader', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    nomor_penjualan: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
    },
    tanggal_penjualan: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    nama_pembeli: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    nomor_contact: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    alamat_pembeli: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    user_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    customer_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
            model: 'customers',
            key: 'id',
        },
    },
    total: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
    },
    points_redeemed: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    discount_amount: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
    },
    metode_pembayaran: {
        type: DataTypes.ENUM('cash', 'transfer', 'tempo'),
        defaultValue: 'cash',
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'rejected'),
        defaultValue: 'confirmed',
    },
}, {
    tableName: 'penjualan_header',
    timestamps: true,
});

export default PenjualanHeader;
