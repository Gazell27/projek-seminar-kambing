import { User, Ras, EstimasiHargaJual, Kambing, PenjualanHeader, PenjualanDetail, sequelize } from '../models/index.js';

const safeSeed = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connected');

        const admin = await User.findOne({ where: { role: 'admin' } });
        console.log('Admin:', admin?.email);

        const ras = await Ras.findOne();
        const est = await EstimasiHargaJual.findOne();

        // Try creating a Kambing
        console.log('--- Step 1: Kambing ---');
        try {
            await Kambing.create({
                kode_kambing: 'DBG-' + Math.floor(Math.random() * 100000),
                ras_id: ras?.id,
                tanggal_masuk: new Date().toISOString().split('T')[0],
                range_berat: '25-30 Kg',
                harga_beli: 1000000,
                jenis_kelamin: 'Jantan',
                status: 'Tersedia',
                estimasi_harga_id: est?.id
            });
            console.log('✅ Kambing OK');
        } catch (e) {
            console.log('❌ Kambing Failed');
            if (e.errors) e.errors.forEach(err => console.log(`Field: ${err.path}, Msg: ${err.message}, Key: ${err.validatorKey}`));
            else console.log(e.message);
        }

        // Try creating a Sale
        console.log('--- Step 2: Sale Header ---');
        let headerId = null;
        try {
            const h = await PenjualanHeader.create({
                user_id: admin?.id,
                nomor_penjualan: 'SO-DBG-' + Math.floor(Math.random() * 100000),
                nama_pembeli: 'Debug Buyer',
                tanggal_penjualan: new Date().toISOString().split('T')[0],
                total: 3000000,
                metode_pembayaran: 'cash',
                payment_status: 'confirmed'
            });
            headerId = h.id;
            console.log('✅ Header OK');
        } catch (e) {
            console.log('❌ Header Failed');
            if (e.errors) e.errors.forEach(err => console.log(`Field: ${err.path}, Msg: ${err.message}, Key: ${err.validatorKey}`));
            else console.log(e.message);
        }

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
safeSeed();
