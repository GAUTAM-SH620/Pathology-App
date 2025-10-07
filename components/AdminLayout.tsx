import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { LayoutDashboard, FileText, PlusCircle, DollarSign, CreditCard, LogOut } from './icons';

const AdminLayout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: "/admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard" },
        { path: "/admin/reports", icon: <FileText className="w-5 h-5" />, label: "All Reports" },
        { path: "/admin/add-report", icon: <PlusCircle className="w-5 h-5" />, label: "Add Report" },
        { path: "/admin/pricing", icon: <DollarSign className="w-5 h-5" />, label: "Test Pricing" },
        { path: "/admin/billing", icon: <CreditCard className="w-5 h-5" />, label: "Generate Bill" },
    ];

    const NavItem: React.FC<{ path: string; icon: React.ReactNode; label: string }> = ({ path, icon, label }) => (
         <NavLink
            to={path}
            className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                        ? 'bg-brand-blue text-white'
                        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`
            }
        >
            {icon}
            <span className="ml-3">{label}</span>
        </NavLink>
    )

    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-brand-dark text-white flex flex-col">
                <div className="h-16 flex items-center justify-center border-b border-slate-700">
                    <h1 className="text-xl font-bold">PathoLab Pro</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => <NavItem key={item.path} {...item} />)}
                </nav>
                <div className="p-4 border-t border-slate-700">
                     <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="ml-3">Logout</span>
                    </button>
                </div>
            </aside>
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-6">
                    <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
                </header>
                <div className="flex-1 p-6 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;