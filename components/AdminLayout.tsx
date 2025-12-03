

import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Book, Megaphone, Users, LogOut, HelpCircle, Menu, X, Settings, ClipboardList, UserPlus, Mail, LifeBuoy } from 'lucide-react';

const AdminLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const baseNavLinkClass = "flex items-center px-4 py-3 text-lg transition-colors duration-200 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20";
  const activeNavLinkClass = "bg-primary text-white shadow-md !text-white";

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
      return isActive ? `${baseNavLinkClass} ${activeNavLinkClass}` : baseNavLinkClass;
  };

  return (
    <div className="flex h-screen bg-secondary dark:bg-gray-900 overflow-hidden transition-colors duration-200">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col h-full
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <div className="bg-primary text-white p-2 rounded-lg">
                    <Book className="w-6 h-6" />
                </div>
                <span className="text-2xl font-poppins font-bold text-primary">Class Nest</span>
            </div>
            <button 
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            >
                <X size={24} />
            </button>
        </div>

        <nav className="flex-grow space-y-2 px-4 overflow-y-auto">
          <NavLink to="/admin/dashboard" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
            <Home className="mr-3 h-5 w-5" />
            Dashboard
          </NavLink>
          <NavLink to="/admin/notes" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
            <Book className="mr-3 h-5 w-5" />
            Manage Notes
          </NavLink>
          <NavLink to="/admin/assignments" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
            <ClipboardList className="mr-3 h-5 w-5" />
            Assignments
          </NavLink>
          <NavLink to="/admin/announcements" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
            <Megaphone className="mr-3 h-5 w-5" />
            Announcements
          </NavLink>
           <NavLink to="/admin/questions" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
            <HelpCircle className="mr-3 h-5 w-5" />
            Questions
          </NavLink>
          <NavLink to="/admin/students" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
            <Users className="mr-3 h-5 w-5" />
            Manage Students
          </NavLink>
          <NavLink to="/admin/pending" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
            <UserPlus className="mr-3 h-5 w-5" />
            New Registrants
          </NavLink>
          <NavLink to="/admin/invitations" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
            <Mail className="mr-3 h-5 w-5" />
            Invitations
          </NavLink>
          <NavLink to="/admin/feedback" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
            <LifeBuoy className="mr-3 h-5 w-5" />
            Student Feedback
          </NavLink>
          <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
          <NavLink to="/admin/settings" className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </NavLink>
        </nav>
        
        <div className="mt-auto p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
           <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600">
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold">
                                {user?.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-semibold font-poppins text-text-primary dark:text-gray-100 truncate">{user?.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                    </div>
                </div>
           </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-lg text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Mobile Header */}
          <header className="bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center justify-between md:hidden z-10 shrink-0 transition-colors duration-200">
              <div className="flex items-center">
                  <button 
                      onClick={() => setIsSidebarOpen(true)}
                      className="text-gray-600 dark:text-gray-300 hover:text-primary focus:outline-none mr-4"
                  >
                      <Menu size={24} />
                  </button>
                  <div className="flex items-center">
                     <div className="bg-primary text-white p-1.5 rounded-lg mr-2">
                        <Book className="w-5 h-5" />
                     </div>
                    <span className="text-xl font-bold text-primary font-poppins">Admin</span>
                  </div>
              </div>
          </header>

          <main className="flex-1 p-6 md:p-10 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {children}
          </main>
      </div>
    </div>
  );
};

export default AdminLayout;
