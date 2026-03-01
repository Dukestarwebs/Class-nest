

import React, { useState, Fragment } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, Book, Users, Briefcase, UserCheck, Calendar, SlidersHorizontal, BarChart2, TrendingUp, DollarSign, CreditCard,
  LogOut, Menu, X, Settings, Megaphone, HelpCircle, ClipboardList, BookOpen, Archive, Mail, Award, MessageSquare, Code, Video
} from 'lucide-react';

const SchoolManagementLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>(['people', 'operations', 'analytics', 'finance', 'content']);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSection = (section: string) => {
    setOpenSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const baseNavLinkClass = "flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 text-gray-400 hover:text-white hover:bg-white/5 group";
  const activeNavLinkClass = "bg-primary/10 !text-primary border-l-4 border-primary";

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) => {
      return isActive ? `${baseNavLinkClass} ${activeNavLinkClass}` : baseNavLinkClass;
  };

  const navSections = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/school/dashboard', section: 'main' },
    { name: 'Live Class', icon: Video, path: '/teacher/live', section: 'main' },
    { name: 'Classes', icon: Book, path: '/school/classes', section: 'main' },
    {
      name: 'People', icon: Users, section: 'people',
      items: [
        { name: 'Teachers', icon: Briefcase, path: '/school/people/teachers' },
        { name: 'Students', icon: Users, path: '/school/people/students' },
      ]
    },
    {
      name: 'Content', icon: BookOpen, section: 'content',
      items: [
        { name: 'Notes', icon: ClipboardList, path: '/school/content/notes' },
        { name: 'Assignments', icon: Book, path: '/school/content/assignments' },
      ]
    },
    {
      name: 'Operations', icon: SlidersHorizontal, section: 'operations',
      items: [
        { name: 'Attendance', icon: Calendar, path: '/school/operations/attendance' },
        { name: 'Schedule', icon: Calendar, path: '/school/operations/schedule' },
        { name: 'History', icon: Code, path: '/school/operations/history' },
      ]
    },
    {
      name: 'Analytics', icon: BarChart2, section: 'analytics',
      items: [
        { name: 'Student Analysis', icon: BarChart2, path: '/school/analytics/students' },
        { name: 'Performance', icon: TrendingUp, path: '/school/analytics/performance' },
      ]
    },
    {
      name: 'Finance', icon: DollarSign, section: 'finance',
      items: [
        { name: 'Salaries', icon: CreditCard, path: '/school/finance/salaries' },
        { name: 'Subscription', icon: Award, path: '/school/finance/subscription' },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-bg-main text-white overflow-hidden">
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-bg-card border-r border-border-main flex flex-col h-full transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex justify-between items-center mb-4 border-b border-border-main">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/admin/dashboard')}>
                <div className="bg-primary text-white p-2 rounded-lg"><Book className="w-6 h-6" /></div>
                <span className="text-xl font-poppins font-bold text-white">Class Nest</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white"><X size={24} /></button>
        </div>

        <nav className="flex-grow px-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
          {navSections.map(section => (
            'items' in section ? (
              <div key={section.section}>
                <button onClick={() => toggleSection(section.section)} className="w-full flex justify-between items-center text-xs font-bold uppercase text-gray-500 tracking-wider px-4 py-2 hover:text-gray-300">
                  {section.name}
                </button>
                {openSections.includes(section.section) && section.items && (
                  <div className="pl-4 space-y-1 mt-1">
                    {section.items.map(item => (
                      <NavLink key={item.path} to={item.path} className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink key={section.path} to={section.path} className={getNavLinkClass} onClick={() => setIsSidebarOpen(false)}>
                <section.icon className="mr-3 h-5 w-5" />
                {section.name}
              </NavLink>
            )
          ))}
        </nav>
        
        <div className="p-4 bg-secondary/30 border-t border-border-main">
           <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold border-2 border-primary/50">
                        {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover rounded-full" /> : user?.name.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-bold text-white truncate text-sm">{user?.name}</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">School Admin</p>
                    </div>
                </div>
                 <button onClick={handleLogout} className="text-gray-500 hover:text-danger transition-colors p-2 rounded-lg hover:bg-danger/10">
                    <LogOut size={20} />
                </button>
           </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-full">
          <header className="bg-bg-card p-4 border-b border-border-main flex items-center justify-between md:hidden z-10 shrink-0">
              <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 hover:text-white mr-4"><Menu size={24} /></button>
              <span className="text-xl font-bold text-white font-poppins">School Panel</span>
          </header>

          <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto scrollbar-thin scrollbar-thumb-border-main">
            {children}
          </main>
      </div>
    </div>
  );
};

export default SchoolManagementLayout;