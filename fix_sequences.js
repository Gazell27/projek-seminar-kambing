import { Ras, EstimasiHargaJual, Kambing, sequelize } from './src/models/index.js';

async function fixSequences() {
    const transaction = await sequelize.transaction();
    try {
        // 1. Fix Ras
        const rasList = await Ras.findAll({ order: [['id', 'ASC']], transaction });
        let rasCounter = 1;
        for (const ras of rasList) {
            const newCode = `RAS${String(rasCounter).padStart(3, '0')}`;
            ras.kode_ras = newCode;
            await ras.save({ transaction });
            rasCounter++;
        }
        console.log(`✅ Fixed ${rasList.length} Ras codes`);

        // 2. Fix Estimasi
        const estimasiList = await EstimasiHargaJual.findAll({ order: [['id', 'ASC']], transaction });
        let estCounter = 1;
        for (const est of estimasiList) {
            const newCode = `EST${String(estCounter).padStart(3, '0')}`;
            est.kode_estimasi = newCode;
            await est.save({ transaction });
            estCounter++;
        }
        console.log(`✅ Fixed ${estimasiList.length} Estimasi codes`);

        // 3. Fix Kambing
        const kambingList = await Kambing.findAll({ order: [['id', 'ASC']], transaction });
        let kmbCounter = 1;
        for (const kmb of kambingList) {
            const newCode = `KMB${String(kmbCounter).padStart(3, '0')}`;
            kmb.kode_kambing = newCode;
            await kmb.save({ transaction });
            kmbCounter++;
        }
        console.log(`✅ Fixed ${kambingList.length} Kambing codes`);

        await transaction.commit();
        process.exit(0);
    } catch (e) {
        await transaction.rollback();
        console.error('❌ Failed to fix sequences:', e);
        process.exit(1);
    }
}

fixSequences();
