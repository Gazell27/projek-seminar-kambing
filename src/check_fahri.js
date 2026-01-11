
import { Customer } from './models/index.js';

const checkFahri = async () => {
    try {
        const customers = await Customer.findAll({
            where: {
                name: 'Fahri'
            }
        });
        console.log('Found customers named Fahri:', customers.length);
        customers.forEach(c => {
            console.log(`ID: ${c.id}, Name: '${c.name}', Contact: '${c.contact}' (Length: ${c.contact.length}), Points: ${c.total_points}`);
            // Check for hidden characters
            console.log(`Contact char codes: ${c.contact.split('').map(x => x.charCodeAt(0)).join(',')}`);
        });
    } catch (error) {
        console.error(error);
    }
    process.exit();
};

checkFahri();
