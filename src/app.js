import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Import database and models
import sequelize, { testConnection } from './config/database.js';
import './models/index.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import rasRoutes from './routes/ras.routes.js';
import estimasiRoutes from './routes/estimasi.routes.js';
import kambingRoutes from './routes/kambing.routes.js';
import penjualanRoutes from './routes/penjualan.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import paymentMethodRoutes from './routes/payment-method.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// ================================
// Middleware
// ================================

// CORS - Allow frontend to connect
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ================================
// API Routes
// ================================

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ras', rasRoutes);
app.use('/api/estimasi', estimasiRoutes);
app.use('/api/kambing', kambingRoutes);
app.use('/api/penjualan', penjualanRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// ================================
// Health Check
// ================================

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'GoatFarm API is running',
        timestamp: new Date().toISOString(),
    });
});

// ================================
// Error Handling
// ================================

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`,
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Multer file size error
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'Ukuran file terlalu besar. Maksimal 3MB.',
        });
    }

    // Multer file type error
    if (err.message && err.message.includes('file gambar')) {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});

// ================================
// Start Server
// ================================

const startServer = async () => {
    // Test database connection
    const connected = await testConnection();

    if (!connected) {
        console.error('❌ Failed to connect to database. Please check your configuration.');
        process.exit(1);
    }

    // Sync models (create tables if they don't exist)
    try {
        await sequelize.sync();
        console.log('✅ Database synchronized successfully');
    } catch (error) {
        console.error('❌ Failed to synchronize database:', error);
    }

    app.listen(PORT, () => {
        console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🐐 GoatFarm Backend API                                ║
║                                                          ║
║   Server running on: http://localhost:${PORT}              ║
║   Environment: ${process.env.NODE_ENV || 'development'}                           ║
║                                                          ║
║   API Endpoints:                                         ║
║   - Auth:      /api/auth                                 ║
║   - Users:     /api/users                                ║
║   - Ras:       /api/ras                                  ║
║   - Estimasi:  /api/estimasi                             ║
║   - Kambing:   /api/kambing                              ║
║   - Penjualan: /api/penjualan                            ║
║   - Payments:  /api/payments                             ║
║   - Settings:  /api/settings                             ║
║   - Dashboard: /api/dashboard                            ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    `);
    });
};

startServer();

export default app;
