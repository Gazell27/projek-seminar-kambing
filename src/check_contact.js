
import { Customer } from './models/index.js';

const checkContact = async () => {
    try {
        const contact = '0827737373';
        const c = await Customer.findOne({
            where: {
                contact: contact
            }
        });
        if (c) {
            console.log(`FOUND: ID: ${c.id}, Name: '${c.name}', Contact: '${c.contact}', Points: ${c.total_points}`);
        } else {
            console.log(`Contact '${contact}' NOT FOUND.`);
            // Try like search
            const likeC = await Customer.findOne({
                where: {
                    contact: { [Symbol.for('like')]: `%${contact}%` } // Pseudo code, fixing below
                }
            });
            // RAW QUERY might be safer to debug exact string matching
        }

        const all = await Customer.findAll();
        console.log("--- Dumping all contacts ---");
        all.forEach(cust => {
            console.log(`'${cust.name}': '${cust.contact}'`);
        });

    } catch (error) {
        console.error(error);
    }
    process.exit();
};

checkContact();
