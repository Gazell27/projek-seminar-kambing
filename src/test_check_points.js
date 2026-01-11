
const testCheckPoints = async () => {
    try {
        const response = await fetch('http://localhost:3001/api/penjualan/check-points?contact=0827737373');
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
};

testCheckPoints();
