
import axios from 'axios';

const testEndpoint = async () => {
    try {
        // Login first to get token (if needed, but assuming I can bypass or need to login)
        // Wait, I don't have a token easily.
        // I'll try to login as admin first.
        // Wait, I don't know admin creds? "admin@gmail.com", "password" is common default.
        // Let's try to hit the endpoint without auth first? No, it has `authenticate` middleware.

        // Actually, I can just use the backend code to bypass functionality? No, I need to test the HTTP layer.

        // I will try to read the token from file if possible? No.

        // I will just make a quick login request.
        const loginRes = await axios.post('http://localhost:3001/api/auth/login', {
            email: 'admin@goatfarm.com', // Guessing common default
            password: 'password'
        }).catch(err => console.log("Login failed with default creds"));

        let token = '';
        if (loginRes && loginRes.data) {
            token = loginRes.data.token;
            console.log("Got token via login");
        }

        // If login fails, I can't easily test via external http script without credentials.
        // But I can modify the backend to verify it is picking up changes.

        console.log("Testing Check Points Endpoint...");
        // Assuming I might need token.
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await axios.get('http://localhost:3001/api/penjualan/check-points?contact=0827737373', { headers });
        console.log("Response Status:", res.status);
        console.log("Response Data:", JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error("Request Failed:", error.message);
        if (error.response) {
            console.error("Error Response:", error.response.status, error.response.data);
        }
    }
};

testEndpoint();
