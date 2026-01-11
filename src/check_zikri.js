
import { Customer } from './models/index.js';

const checkZikri = async () => {
    try {
        const zikri = await Customer.findAll({
            where: {
                name: 'Zikri'
            }
        });
        zikri.forEach(z => {
            console.log(`Name: '${z.name}', Contact: '${z.contact}', Points: ${z.total_points}`);
        });
    } catch (error) {
        console.error(error);
    }
    process.exit();
};

checkZikri();
