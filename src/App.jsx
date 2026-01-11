import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ProtectedRoute, GuestRoute } from './routes/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import KasirLayout from './layouts/KasirLayout';

// Auth Pages
import Login from './pages/auth/Login';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageRas from './pages/admin/ManageRas';
import ManageEstimasi from './pages/admin/ManageEstimasi';
import ManageKambing from './pages/admin/ManageKambing';
import ManagePenjualan from './pages/admin/ManagePenjualan';
import TransferApproval from './pages/admin/TransferApproval';
import Laporan from './pages/admin/Laporan';
import ManageUsers from './pages/admin/ManageUsers';
import ManagePaymentMethod from './pages/admin/ManagePaymentMethod';
import Settings from './pages/admin/Settings';
import LoyaltyProgram from './pages/admin/LoyaltyProgram';

// Kasir Pages
import KasirDashboard from './pages/kasir/Dashboard';
import KasirPenjualan from './pages/kasir/Penjualan';
import ViewKambing from './pages/kasir/ViewKambing';
import ViewLaporan from './pages/kasir/ViewLaporan';
import ViewEstimasi from './pages/kasir/ViewEstimasi';
import KasirLoyaltyProgram from './pages/kasir/LoyaltyProgram';

function App() {
    const { loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="spinner mx-auto mb-4" />
                    <p className="text-slate-500">Memuat...</p>
                </div>
            </div>
        );
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route
                path="/login"
                element={
                    <GuestRoute>
                        <Login />
                    </GuestRoute>
                }
            />

            {/* Admin Routes */}
            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<AdminDashboard />} />
                <Route path="ras" element={<ManageRas />} />
                <Route path="estimasi" element={<ManageEstimasi />} />
                <Route path="kambing" element={<ManageKambing />} />
                <Route path="penjualan" element={<ManagePenjualan />} />
                <Route path="pembayaran" element={<TransferApproval />} />
                <Route path="laporan" element={<Laporan />} />
                <Route path="users" element={<ManageUsers />} />
                <Route path="metode-pembayaran" element={<ManagePaymentMethod />} />
                <Route path="settings" element={<Settings />} />
                <Route path="loyalty" element={<LoyaltyProgram />} />
            </Route>

            {/* Kasir Routes */}
            <Route
                path="/kasir"
                element={
                    <ProtectedRoute allowedRoles={['kasir']}>
                        <KasirLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<KasirDashboard />} />
                <Route path="penjualan" element={<KasirPenjualan />} />
                <Route path="kambing" element={<ViewKambing />} />
                <Route path="laporan" element={<ViewLaporan />} />
                <Route path="estimasi" element={<ViewEstimasi />} />
                <Route path="loyalty" element={<KasirLoyaltyProgram />} />
            </Route>

            {/* Redirect root to login */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* 404 - Redirect to login */}
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

export default App;
