import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';

const AdminLayout = () => {
    return (
        <div className="min-h-screen flex bg-slate-50">
            <Sidebar />
            <div className="flex-1 ml-72">
                <Navbar />
                <main className="p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
