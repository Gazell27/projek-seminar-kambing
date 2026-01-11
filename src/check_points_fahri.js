
import { Customer } from './models/index.js';

const checkPoints = async () => {
    try {
        const contact = '0827737373';
        const customer = await Customer.findOne({
            where: {
                contact: contact
            }
        });
        if (customer) {
            console.log(`Contact: ${contact} => Points: ${customer.total_points}`);
        } else {
            console.log(`Contact: ${contact} => NOT FOUND`);
        }
    } catch (error) {
        console.error(error);
    }
    process.exit();
};

checkPoints();
