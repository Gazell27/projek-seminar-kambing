import { Ras, EstimasiHargaJual, sequelize } from './src/models/index.js';

async function check() {
    try {
        const ras = await Ras.findAll({ order: [['id', 'ASC']] });
        console.log('--- DATA RAS ---');
        ras.forEach(r => console.log(`ID: ${r.id}, Kode: ${r.kode_ras}, Nama: ${r.nama_ras}`));

        const estimasi = await EstimasiHargaJual.findAll({ order: [['id', 'ASC']] });
        console.log('\n--- DATA ESTIMASI ---');
        estimasi.forEach(e => console.log(`ID: ${e.id}, Kode: ${e.kode_estimasi}, Range: ${e.range_berat}`));

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

check();
