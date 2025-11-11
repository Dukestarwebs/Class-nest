
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Book, Megaphone, Users, LogOut } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center px-4 py-3 text-lg transition-colors duration-200 rounded-lg ${
      isActive
        ? 'bg-primary text-white shadow-md'
        : 'text-gray-600 hover:bg-primary/10 hover:text-primary'
    }`;

  return (
    <div className="flex h-screen bg-secondary">
      <aside className="w-64 flex-shrink-0 bg-white shadow-lg p-4 flex flex-col">
        <div className="text-2xl font-poppins font-bold text-primary mb-8 px-2">
          📘 Class Nest
        </div>
        <nav className="flex-grow space-y-2">
          <NavLink to="/admin/dashboard" className={navLinkClass}>
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </NavLink>
          <NavLink to="/admin/notes" className={navLinkClass}>
            <Book className="mr-3 h-5 w-5" />
            Upload Notes
          </NavLink>
          <NavLink to="/admin/announcements" className={navLinkClass}>
            <Megaphone className="mr-3 h-5 w-5" />
            Announcements
          </NavLink>
          <NavLink to="/admin/students" className={navLinkClass}>
            <Users className="mr-3 h-5 w-5" />
            Manage Students
          </NavLink>
        </nav>
        <div className="mt-auto">
           <div className="p-4 border-t border-gray-200">
             <p className="font-semibold font-poppins text-text-primary">{user?.name}</p>
             <p className="text-sm text-gray-500">{user?.email}</p>
           </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-lg text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
