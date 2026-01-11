import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const PenjualanDetail = sequelize.define('PenjualanDetail', {
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
    kambing_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
        references: {
            model: 'kambing',
            key: 'id',
        },
    },
    harga_jual: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
    range_berat: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    estimasi_harga: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
    },
}, {
    tableName: 'penjualan_detail',
    timestamps: true,
});

export default PenjualanDetail;
