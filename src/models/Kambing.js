import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Kambing = sequelize.define('Kambing', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    kode_kambing: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    ras_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
            model: 'ras',
            key: 'id',
        },
    },
    tanggal_masuk: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    range_berat: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    harga_beli: {
        type: DataTypes.BIGINT.UNSIGNED,
        defaultValue: 0,
    },
    jenis_kelamin: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'Tersedia',
    },
    estimasi_harga_id: {
        type: DataTypes.BIGINT.UNSIGNED,
        allowNull: true,
        references: {
            model: 'estimasi_harga_jual',
            key: 'id',
        },
    },
}, {
    tableName: 'kambing',
    timestamps: true,
});

export default Kambing;
