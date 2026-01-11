import sequelize from '../config/database.js';
import User from './User.js';
import Ras from './Ras.js';
import EstimasiHargaJual from './EstimasiHargaJual.js';
import Kambing from './Kambing.js';
import PenjualanHeader from './PenjualanHeader.js';
import PenjualanDetail from './PenjualanDetail.js';
import PaymentMethod from './PaymentMethod.js';
import Payment from './Payment.js';
import Setting from './Setting.js';
import Customer from './Customer.js';

// ============================================
// Define Associations
// ============================================

// Ras - Kambing (One to Many)
Ras.hasMany(Kambing, { foreignKey: 'ras_id', as: 'kambing' });
Kambing.belongsTo(Ras, { foreignKey: 'ras_id', as: 'ras' });

// EstimasiHargaJual - Kambing (One to Many)
EstimasiHargaJual.hasMany(Kambing, { foreignKey: 'estimasi_harga_id', as: 'kambing' });
Kambing.belongsTo(EstimasiHargaJual, { foreignKey: 'estimasi_harga_id', as: 'estimasiHarga' });

// User - PenjualanHeader (One to Many)
User.hasMany(PenjualanHeader, { foreignKey: 'user_id', as: 'penjualan' });
PenjualanHeader.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// PenjualanHeader - PenjualanDetail (One to Many)
PenjualanHeader.hasMany(PenjualanDetail, { foreignKey: 'penjualan_header_id', as: 'details' });
PenjualanDetail.belongsTo(PenjualanHeader, { foreignKey: 'penjualan_header_id', as: 'penjualanHeader' });

// Kambing - PenjualanDetail (One to Many)
Kambing.hasMany(PenjualanDetail, { foreignKey: 'kambing_id', as: 'penjualanDetails' });
PenjualanDetail.belongsTo(Kambing, { foreignKey: 'kambing_id', as: 'kambing' });

// PenjualanHeader - Payment (One to One/Many)
PenjualanHeader.hasOne(Payment, { foreignKey: 'penjualan_header_id', as: 'payment' });
Payment.belongsTo(PenjualanHeader, { foreignKey: 'penjualan_header_id', as: 'penjualanHeader' });

// PaymentMethod - Payment (One to Many)
PaymentMethod.hasMany(Payment, { foreignKey: 'payment_method_id', as: 'payments' });
Payment.belongsTo(PaymentMethod, { foreignKey: 'payment_method_id', as: 'paymentMethod' });

User.hasMany(Payment, { foreignKey: 'confirmed_by', as: 'confirmedPayments' });
Payment.belongsTo(User, { foreignKey: 'confirmed_by', as: 'confirmedByUser' });

// Customer - PenjualanHeader (One to Many)
Customer.hasMany(PenjualanHeader, { foreignKey: 'customer_id', as: 'penjualan' });
PenjualanHeader.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

// ============================================
// Export all models
// ============================================
export {
    sequelize,
    User,
    Ras,
    EstimasiHargaJual,
    Kambing,
    PenjualanHeader,
    PenjualanDetail,
    PaymentMethod,
    Payment,
    Setting,
    Customer,
};

export default {
    sequelize,
    User,
    Ras,
    EstimasiHargaJual,
    Kambing,
    PenjualanHeader,
    PenjualanDetail,
    PaymentMethod,
    Payment,
    Setting,
    Customer,
};
