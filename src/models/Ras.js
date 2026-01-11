import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Ras = sequelize.define('Ras', {
    id: {
        type: DataTypes.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
    },
    kode_ras: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
    },
    nama_ras: {
        type: DataTypes.STRING(150),
        allowNull: false,
    },
    keterangan: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
}, {
    tableName: 'ras',
    timestamps: true,
});

export default Ras;
