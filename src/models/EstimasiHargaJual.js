import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const EstimasiHargaJual = sequelize.define('EstimasiHargaJual', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    kode_estimasi: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    range_berat: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    estimasi_harga: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    keterangan: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'estimasi_harga_jual',
    timestamps: true,
});

export default EstimasiHargaJual;
