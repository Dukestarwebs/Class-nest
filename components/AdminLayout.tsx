

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, User, UserCheck, LogOut, Menu, X, Book, ClipboardList, Megaphone, HelpCircle, Settings,
  Archive, FileText, DollarSign, CreditCard, Mail, Award, MessageSquare, Briefcase, Building, Video
} from 'lucide-react';

const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const baseNavLinkClass = "flex items-center px-4 py-2.5 text-sm transition-colors duration-200 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";
  const activeNavLinkClass = "bg-primary text-white font-semibold shadow-md";

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
      return isActive ? `${baseNavLinkClass} ${activeNavLinkClass}` : baseNavLinkClass;
  };

  const navLinks = [
    { to: "/admin/dashboard", icon: <LayoutDashboard size={18}/>, text: "Dashboard" },
    { to: "/admin/students", icon: <User size={18}/>, text: "Students" },
    { to: "/admin/teachers", icon: <Briefcase size={18}/>, text: "Teachers" },
    { to: "/admin/schools", icon: <Building size={18}/>, text: "Manage Schools" },
    { to: "/admin/pending", icon: <UserCheck size={18}/>, text: "Pending Users" },
    { to: "/admin/notes", icon: <Book size={18}/>, text: "Notes" },
    { to: "/admin/assignments", icon: <ClipboardList size={18}/>, text: "Assignments" },
    { to: "/admin/announcements", icon: <Megaphone size={18}/>, text: "Announcements" },
    { to: "/admin/questions", icon: <HelpCircle size={18}/>, text: "Questions" },
    { to: "/admin/drafts", icon: <FileText size={18}/>, text: "Drafts" },
    { to: "/admin/archive", icon: <Archive size={18}/>, text: "Archive" },
    { to: "/admin/payments", icon: <DollarSign size={18}/>, text: "Payments" },
    { to: "/admin/subscription-fee", icon: <CreditCard size={18}/>, text: "Subscription Fee" },
    { to: "/admin/invitations", icon: <Mail size={18}/>, text: "Invitations" },
    { to: "/admin/feedback", icon: <MessageSquare size={18}/>, text: "Feedback" },
    { to: "/admin/careers", icon: <Award size={18}/>, text: "Careers" },
    { to: "/admin/live-sessions", icon: <Video size={18}/>, text: "Live Sessions" },
    { to: "/admin/settings", icon: <Settings size={18}/>, text: "Settings" }
  ];

  return (
    <div className="flex h-screen bg-secondary dark:bg-gray-900 overflow-hidden transition-colors duration-200">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col h-full transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex justify-between items-center border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-3">
                <div className="bg-primary text-white p-2 rounded-lg"><Book className="w-6 h-6" /></div>
                <span className="text-2xl font-poppins font-bold text-primary">Class Nest</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 dark:text-gray-400"><X size={24} /></button>
        </div>
        <nav className="flex-grow space-y-1 px-4 py-4 overflow-y-auto">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
              <span className="mr-3">{link.icon}</span>{link.text}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center font-bold">{user?.name.charAt(0)}</div>
            <div>
              <p className="font-semibold text-text-primary dark:text-gray-100">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Platform Admin</p>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors">
            <LogOut className="mr-3 h-4 w-4" />Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 h-full">
          <header className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center justify-between md:hidden z-10">
              <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600 dark:text-gray-300"><Menu size={24} /></button>
              <span className="text-xl font-bold text-primary font-poppins">Admin Panel</span>
          </header>
          <main className="flex-1 p-6 md:p-10 overflow-y-auto">
            {children}
          </main>
      </div>
    </div>
  );
};

export default AdminLayout;