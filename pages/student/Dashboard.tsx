import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Announcement, Note, Subject } from '../../types';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, History, Landmark, Download } from 'lucide-react';

type Tab = 'Announcements' | 'History' | 'Geography';

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('Announcements');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Fetch data from localStorage on component mount
    const storedAnnouncements: Announcement[] = JSON.parse(localStorage.getItem('classNestAnnouncements') || '[]');
    setAnnouncements(storedAnnouncements.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    const storedNotes: Note[] = JSON.parse(localStorage.getItem('classNestNotes') || '[]');
    setNotes(storedNotes.sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const filteredNotes = useMemo(() => {
    if (activeTab === 'Announcements') return []; // Don't compute for announcements tab
    return notes.filter(note => {
      if (note.subject !== activeTab) return false;
      if (searchTerm.trim() === '') return true;
      const lowerCaseSearch = searchTerm.toLowerCase();
      const titleMatch = note.title.toLowerCase().includes(lowerCaseSearch);
      const descriptionMatch = note.description.toLowerCase().includes(lowerCaseSearch);
      return titleMatch || descriptionMatch;
    });
  }, [notes, searchTerm, activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Announcements':
        return (
          <div className="space-y-4">
            {announcements.length > 0 ? announcements.map(ann => (
              <div key={ann.id} className="bg-white p-5 rounded-lg shadow-sm transition-transform transform hover:scale-105">
                <p className="text-text-primary">{ann.message}</p>
                <p className="text-sm text-gray-500 mt-2">
                  From: {ann.sender} - <span className="text-xs">{new Date(ann.date).toLocaleString()}</span>
                </p>
              </div>
            )) : <p className="text-center text-gray-500 py-10">No new announcements.</p>}
          </div>
        );
      case 'History':
      case 'Geography':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.length > 0 ? filteredNotes.map(note => (
              <div key={note.id} className="bg-white p-5 rounded-lg shadow-sm flex flex-col justify-between transition-shadow hover:shadow-xl">
                <div>
                    <div className="flex items-center mb-2">
                        {note.subject === 'History' ? <History className="text-orange-500 mr-2"/> : <Landmark className="text-green-500 mr-2"/>}
                        <h3 className="font-poppins font-bold text-lg text-primary">{note.title}</h3>
                    </div>
                  <p className="text-sm text-gray-600 mb-4">{note.description}</p>
                  <p className="text-xs text-gray-400">Uploaded: {new Date(note.uploadDate).toLocaleDateString()}</p>
                </div>
                <a
                  href={note.fileData}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={note.fileName}
                  className="mt-4 w-full flex items-center justify-center bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Download className="mr-2 h-4 w-4" />
                  View / Download PDF
                </a>
              </div>
            )) : <p className="text-center text-gray-500 py-10 col-span-full">No notes found for {activeTab}.</p>}
          </div>
        );
    }
  };

  const BottomNavButton: React.FC<{tabName: Tab, icon: string, isActive: boolean, onClick: () => void}> = ({tabName, icon, isActive, onClick}) => (
    <button onClick={onClick} className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 rounded-lg ${ isActive ? 'text-primary' : 'text-gray-500 hover:text-primary hover:bg-primary/10' }`}>
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium mt-1">{tabName}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-secondary pb-24">
      <header className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-md sticky top-4 mx-4 z-10">
        <div className="mb-4 md:mb-0">
            <h1 className="text-2xl sm:text-3xl font-poppins font-bold text-primary">📘 Class Nest</h1>
            <p className="text-gray-600">Welcome back, <span className="font-semibold">{user?.name}!</span></p>
        </div>
        <div className="flex items-center space-x-4">
             <div className="text-right">
                <p className="font-semibold">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
             </div>
            <button onClick={handleLogout} className="flex items-center bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-transform transform hover:scale-105">
              <LogOut className="mr-2 h-4 w-4"/>
              Logout
            </button>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
         {(activeTab === 'History' || activeTab === 'Geography') && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20}/>
            <input 
              type="text" 
              placeholder={`Search in ${activeTab} notes...`}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
        
        <div>
            {renderContent()}
        </div>
      </main>

       <footer className="text-center py-4 text-gray-500">
         © 2025 Class Nest — Developed for Teacher Sylvia by Dukestar ❤️
       </footer>
       
       <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] flex justify-around">
            <BottomNavButton tabName='Announcements' icon='📣' isActive={activeTab === 'Announcements'} onClick={() => setActiveTab('Announcements')}/>
            <BottomNavButton tabName='History' icon='🗿' isActive={activeTab === 'History'} onClick={() => setActiveTab('History')}/>
            <BottomNavButton tabName='Geography' icon='🏞️' isActive={activeTab === 'Geography'} onClick={() => setActiveTab('Geography')}/>
        </nav>
    </div>
  );
};

export default StudentDashboard;
