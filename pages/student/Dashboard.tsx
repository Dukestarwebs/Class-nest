
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Note, Subject, Assignment, Announcement, Question } from '../../types';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  Book, 
  ClipboardList, 
  Megaphone, 
  HelpCircle, 
  Settings as SettingsIcon, 
  Menu, 
  X, 
  BookOpen, 
  Calculator, 
  Microscope, 
  Globe, 
  History as HistoryIcon,
  MessageCircle,
  FileText,
  User as UserIcon,
  ChevronRight,
  Search,
  Send,
  Bell,
  Clock,
  RefreshCw,
  CreditCard,
  AlertTriangle,
  Wallet,
  MessageSquare,
  Video
} from 'lucide-react';
import { getNotes, getAssignments, getAnnouncements, getQuestionsByStudent, addQuestion, getSystemSettings } from '../../data';
import ChatRoom from '../ChatRoom';

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'assignments' | 'announcements' | 'questions' | 'chat'>('notes');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subscriptionFee, setSubscriptionFee] = useState<number>(10000);

  const fetchData = async (showSync = false) => {
    if (!user) return;
    if (showSync) setSyncing(true);
    else setLoading(true);

    try {
      const [allNotes, allAssignments, allAnnouncements, allQuestions, settings] = await Promise.all([
        getNotes(),
        getAssignments(),
        getAnnouncements(),
        getQuestionsByStudent(user.id),
        getSystemSettings()
      ]);

      setSubscriptionFee(settings.studentFee);

      const studentClass = user.classLevel?.toString().toUpperCase() || '';
      
      setNotes(allNotes.filter(n => 
        (n.classLevel?.toString().toUpperCase() === studentClass) && !n.isArchived
      ));
      
      setAssignments(allAssignments.filter(a => 
        (a.classLevel?.toString().toUpperCase() === studentClass) && !a.isArchived
      ));
      
      setAnnouncements(allAnnouncements.filter(ann => 
        ann.classLevel === 'All' || ann.classLevel?.toString().toUpperCase() === studentClass
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      
      setQuestions(allQuestions.sort((a, b) => new Date(b.questionDate).getTime() - new Date(a.questionDate).getTime()));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleManualSync = () => {
      fetchData(true);
  };

  const handleSendQuestion = async () => {
    if (!newQuestion.trim() || !user) return;
    try {
      await addQuestion({
        studentId: user.id,
        studentName: user.name,
        questionText: newQuestion,
        questionDate: new Date().toISOString(),
        isAnswered: false,
      });
      setNewQuestion('');
      fetchData(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getCount = (subject: Subject, type: 'notes' | 'assignments') => {
    if (type === 'notes') return notes.filter(n => n.subject === subject).length;
    return assignments.filter(a => a.subject === subject).length;
  };

  const subjectConfig = [
    { name: Subject.Mathematics, icon: <Calculator size={24} />, color: 'bg-blue-600', subject: Subject.Mathematics },
    { name: Subject.English, icon: <Book size={24} />, color: 'bg-red-600', subject: Subject.English },
    { name: Subject.Physics, icon: <Microscope size={24} />, color: 'bg-purple-600', subject: Subject.Physics },
    { name: Subject.Chemistry, icon: <Microscope size={24} />, color: 'bg-purple-600', subject: Subject.Chemistry },
    { name: Subject.Biology, icon: <Microscope size={24} />, color: 'bg-purple-600', subject: Subject.Biology },
    { name: Subject.History, icon: <HistoryIcon size={24} />, color: 'bg-orange-600', subject: Subject.History },
    { name: Subject.Geography, icon: <Globe size={24} />, color: 'bg-green-600', subject: Subject.Geography },
    { name: Subject.Entrepreneurship, icon: <BookOpen size={24} />, color: 'bg-teal-600', subject: Subject.Entrepreneurship },
  ];

  const sidebarItems = [
    { id: 'notes', label: 'My Notes', icon: <BookOpen size={20} />, active: activeTab === 'notes' },
    { id: 'assignments', label: 'Assignments', icon: <ClipboardList size={20} />, active: activeTab === 'assignments' },
    { id: 'chat', label: 'Class Chat', icon: <MessageSquare size={20} />, active: activeTab === 'chat' },
    { id: 'live', label: 'Live Class', icon: <Video size={20} />, active: false },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone size={20} />, active: activeTab === 'announcements' },
    { id: 'questions', label: 'My Questions', icon: <HelpCircle size={20} />, active: activeTab === 'questions' },
    { id: 'subscription', label: 'Subscription', icon: <CreditCard size={20} />, active: false },
    { id: 'help', label: 'Help & Feedback', icon: <MessageCircle size={20} />, active: false },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={20} />, active: false },
  ];

  const handleSidebarClick = (id: string) => {
    if (id === 'help') navigate('/student/help');
    else if (id === 'settings') navigate('/student/settings');
    else if (id === 'subscription') navigate('/student/subscription');
    else if (id === 'live') navigate('/student/live');
    else {
      setActiveTab(id as any);
      setSelectedSubject(null);
    }
    setIsSidebarOpen(false);
  };

  const expiryDate = user?.subscription_expiry ? new Date(user.subscription_expiry) : new Date(0);
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const isExpired = diffDays <= 0;
  const isNearingExpiry = !isExpired && diffDays <= 3;

  return (
    <div className="flex h-screen bg-bg-main text-white transition-colors duration-200 overflow-hidden font-roboto">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-bg-card border-r border-border-main flex flex-col h-full transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8 flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-primary text-white p-2 rounded-lg shadow-primary/20 shadow-lg">
            <Book className="w-6 h-6" />
          </div>
          <span className="text-2xl font-poppins font-bold text-white tracking-tight">Class Nest</span>
        </div>

        <nav className="flex-grow px-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSidebarClick(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-bold uppercase tracking-wider rounded-xl transition-all relative ${
                item.active 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="mr-4">{item.icon}</span>
              {item.label}
              {item.id === 'subscription' && (isExpired || isNearingExpiry) && (
                <AlertTriangle size={14} className={`ml-auto ${isExpired ? 'text-danger' : 'text-highlight'}`} />
              )}
              {item.active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-highlight rounded-r-full"></div>}
            </button>
          ))}
        </nav>

        <div className="mt-auto border-t border-border-main p-6 bg-secondary/50">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-bg-main flex items-center justify-center text-gray-400 font-bold overflow-hidden border-2 border-primary/50">
              {user?.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : user?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-primary font-bold uppercase tracking-widest">{user?.classLevel} Student</p>
            </div>
          </div>
          <button 
            onClick={async () => { await logout(); navigate('/login'); }} 
            className="flex items-center text-danger hover:text-red-400 font-bold uppercase text-xs tracking-widest transition-colors"
          >
            <LogOut className="mr-3 h-4 w-4" /> Logout Account
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden bg-bg-card h-16 border-b border-border-main flex items-center px-6 shrink-0 z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 hover:text-white mr-4">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold font-poppins text-primary">Class Nest</h1>
        </header>

        <main className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 scrollbar-thin scrollbar-thumb-border-main">
          
          {/* Expiry Alerts */}
          {isExpired ? (
            <div className="bg-danger/10 border-l-4 border-danger p-6 rounded-r-card flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center text-center md:text-left">
                    <div className="bg-danger p-3 rounded-2xl mr-4 shadow-lg shadow-danger/20 hidden md:block">
                      <AlertTriangle className="text-white" size={24} />
                    </div>
                    <div>
                        <p className="font-bold text-red-100 text-xl font-poppins">Access Restricted</p>
                        <p className="text-red-400 font-medium">Your access has expired. Pay UGX {subscriptionFee.toLocaleString()} now to unlock materials.</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/student/subscription')}
                    className="bg-danger text-white px-10 py-3 rounded-xl font-bold hover:bg-red-700 transition-all text-sm shadow-xl shadow-danger/25 active:scale-95 whitespace-nowrap"
                >
                    Pay Access Fee
                </button>
            </div>
          ) : isNearingExpiry ? (
            <div className="bg-highlight/10 border-l-4 border-highlight p-6 rounded-r-card flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="flex items-center text-center md:text-left">
                    <div className="bg-highlight p-3 rounded-2xl mr-4 shadow-lg shadow-highlight/20 hidden md:block">
                      <Clock className="text-white" size={24} />
                    </div>
                    <div>
                        <p className="font-bold text-orange-100 text-xl font-poppins">Subscription Alert</p>
                        <p className="text-orange-300 font-medium">You have <span className="font-bold underline">{diffDays} days</span> left. Add funds to avoid interruption.</p>
                    </div>
                </div>
                <button 
                    onClick={() => navigate('/student/subscription')}
                    className="bg-highlight text-bg-main px-10 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all text-sm shadow-xl shadow-highlight/25 active:scale-95 flex items-center whitespace-nowrap"
                >
                    <Wallet size={16} className="mr-2" /> Top Up Now
                </button>
            </div>
          ) : null}

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex flex-col gap-2">
                <h1 className="text-4xl md:text-5xl font-poppins font-bold text-white tracking-tight">
                  {activeTab === 'chat' ? 'Classroom Hub' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
                <p className="text-gray-400 text-lg font-medium">Welcome back, @{user?.username}!</p>
              </div>
              <button 
                onClick={handleManualSync}
                disabled={syncing || loading}
                className="flex items-center px-6 py-2.5 bg-bg-card border border-border-main rounded-full text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
              >
                <RefreshCw size={14} className={`mr-2 ${syncing ? 'animate-spin text-primary' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync System'}
              </button>
          </div>

          {/* Views */}
          {(activeTab === 'notes' || activeTab === 'assignments') && !selectedSubject && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {subjectConfig.map((item) => (
                    <div 
                        key={item.name}
                        onClick={() => {
                            if(isExpired) {
                                navigate('/student/subscription');
                            } else {
                                setSelectedSubject(item.subject);
                            }
                        }}
                        className={`${item.color} p-10 rounded-card shadow-2xl cursor-pointer hover:scale-[1.02] transition-all relative overflow-hidden group ${isExpired ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                    >
                        <div className="relative z-10 flex flex-col h-full">
                        <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
                            {item.icon}
                        </div>
                        <h3 className="text-2xl font-bold font-poppins mb-1">{item.name}</h3>
                        <p className="text-white/80 font-bold text-sm uppercase tracking-widest">
                            {getCount(item.subject, activeTab)} {activeTab}
                        </p>
                        </div>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-125 transition-transform duration-500"></div>
                    </div>
                    ))}
                </div>
            </div>
          )}

          {(activeTab === 'notes' || activeTab === 'assignments') && selectedSubject && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <button 
                  onClick={() => setSelectedSubject(null)}
                  className="flex items-center text-primary hover:text-highlight transition-colors font-bold uppercase tracking-widest text-sm"
                >
                  <X size={18} className="mr-2" /> Back to Subject List
                </button>
                <div className="relative w-full max-w-xs">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" 
                    placeholder={`Filter ${activeTab}...`} 
                    className="w-full bg-bg-card border border-border-main rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              <h2 className="text-3xl font-bold font-poppins text-highlight">{selectedSubject}</h2>
              
              {loading || syncing ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>
              ) : (
                activeTab === 'notes' ? (
                  notes.filter(n => n.subject === selectedSubject).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {notes.filter(n => n.subject === selectedSubject).map(note => (
                        <div 
                          key={note.id} 
                          onClick={() => {
                              if(isExpired) navigate('/student/subscription');
                              else navigate(`/student/notes/${note.id}`);
                          }}
                          className="bg-bg-card p-8 rounded-card border border-border-main hover:border-primary/50 cursor-pointer transition-all hover:shadow-2xl group relative overflow-hidden"
                        >
                          <div className="flex justify-between items-start mb-8">
                            <div className="bg-primary/10 p-4 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                              <BookOpen size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{new Date(note.uploadDate).toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-xl font-bold font-poppins mb-6 line-clamp-2 leading-tight">{note.title}</h3>
                          <div className="flex items-center text-primary font-bold text-xs uppercase tracking-widest">
                            Study Note <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                          <div className="absolute bottom-0 right-0 w-24 h-24 bg-primary/5 rounded-tl-card pointer-events-none group-hover:bg-primary/10 transition-colors"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-bg-card rounded-card border border-dashed border-border-main">
                      <FileText size={64} className="mx-auto text-gray-700 mb-6" />
                      <p className="text-gray-400 text-xl font-poppins font-bold">Library is empty for {selectedSubject}.</p>
                      <p className="text-gray-600 text-xs mt-4 font-bold uppercase tracking-[0.3em]">System Node: {user?.classLevel}</p>
                    </div>
                  )
                ) : (
                  assignments.filter(a => a.subject === selectedSubject).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {assignments.filter(a => a.subject === selectedSubject).map(assign => (
                        <div 
                          key={assign.id} 
                          onClick={() => {
                               if(isExpired) navigate('/student/subscription');
                               else navigate(`/student/assignments/${assign.id}`);
                          }}
                          className="bg-bg-card p-8 rounded-card border border-border-main hover:border-highlight/50 cursor-pointer transition-all hover:shadow-2xl group border-l-8 border-l-highlight"
                        >
                          <div className="flex justify-between items-start mb-8">
                            <div className="bg-highlight/10 p-4 rounded-2xl text-highlight group-hover:bg-highlight group-hover:text-bg-main transition-all">
                              <ClipboardList size={24} />
                            </div>
                            <span className="text-[10px] font-bold text-danger bg-danger/10 px-3 py-1 rounded-full uppercase tracking-widest border border-danger/20">Due: {new Date(assign.dueDate).toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-xl font-bold font-poppins mb-6 line-clamp-2 leading-tight">{assign.content}</h3>
                          <div className="flex items-center text-highlight font-bold text-xs uppercase tracking-widest">
                            Task Details <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-bg-card rounded-card border border-dashed border-border-main">
                      <ClipboardList size={64} className="mx-auto text-gray-700 mb-6" />
                      <p className="text-gray-400 text-xl font-poppins font-bold">No tasks assigned for {selectedSubject}.</p>
                      <p className="text-gray-600 text-xs mt-4 font-bold uppercase tracking-[0.3em]">Enjoy the break!</p>
                    </div>
                  )
                )
              )}
            </div>
          )}

          {activeTab === 'chat' && (
             <div className="max-w-5xl mx-auto h-[700px]">
                 <ChatRoom classLevel={user?.classLevel || 'General'} />
             </div>
          )}

          {activeTab === 'announcements' && (
            <div className="max-w-3xl mx-auto space-y-6">
              {loading || syncing ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>
              ) : announcements.length > 0 ? announcements.map(ann => (
                <div key={ann.id} className="bg-bg-card p-8 rounded-card border border-border-main relative overflow-hidden group hover:border-primary/30 transition-all">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Megaphone size={120} />
                  </div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary">
                      <Bell size={24} />
                    </div>
                    <div>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] block">{new Date(ann.date).toLocaleString()}</span>
                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest block mt-1">Instructor: {ann.sender}</span>
                    </div>
                  </div>
                  <p className="text-xl text-gray-200 leading-relaxed font-medium">{ann.message}</p>
                </div>
              )) : (
                <div className="text-center py-20 bg-bg-card rounded-card border border-border-main">
                  <Bell size={64} className="mx-auto text-gray-700 mb-6" />
                  <p className="text-gray-500 text-2xl font-poppins font-bold">No active announcements.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'questions' && (
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-8">
                <div className="bg-bg-card p-10 rounded-card border border-border-main shadow-2xl">
                  <h3 className="text-2xl font-bold font-poppins mb-8 text-primary">Teacher Direct</h3>
                  <div className="space-y-6">
                    <textarea 
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      placeholder="Ask your instructor a question..."
                      className="w-full bg-bg-main border border-border-main rounded-2xl p-6 min-h-[180px] outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary text-gray-200 resize-none transition-all placeholder:text-gray-600"
                    />
                    <button 
                      onClick={handleSendQuestion}
                      disabled={!newQuestion.trim() || syncing}
                      className="w-full bg-primary text-white py-5 rounded-2xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20 text-lg active:scale-95"
                    >
                      {syncing ? 'Sending...' : 'Post Question'} <Send size={20} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-8 overflow-y-auto max-h-[700px] pr-4 scrollbar-thin scrollbar-thumb-border-main">
                <h3 className="text-2xl font-bold font-poppins text-gray-400">Response History</h3>
                {loading || syncing ? (
                    <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>
                ) : questions.length > 0 ? questions.map(q => (
                  <div key={q.id} className="bg-bg-card p-8 rounded-card border border-border-main space-y-6 group hover:shadow-2xl transition-all">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-bg-main flex items-center justify-center text-xs font-bold text-primary border border-primary/20">{user?.name.charAt(0)}</div>
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">You asked</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-700 uppercase">{new Date(q.questionDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-gray-200 font-medium text-lg leading-snug">{q.questionText}</p>
                    
                    {q.isAnswered ? (
                      <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5"><MessageCircle size={60}/></div>
                        <div className="flex items-center gap-3 mb-4">
                           <div className="bg-primary text-white p-1.5 rounded-lg"><UserIcon size={14} /></div>
                           <span className="text-xs font-bold text-primary uppercase tracking-widest">Teacher Response</span>
                        </div>
                        <p className="text-gray-300 italic text-base">"{q.answerText}"</p>
                        {q.answerDate && <p className="text-[9px] text-gray-600 mt-4 text-right">{new Date(q.answerDate).toLocaleTimeString()}</p>}
                      </div>
                    ) : (
                      <div className="bg-highlight/5 p-5 rounded-2xl border border-highlight/10 flex items-center gap-3">
                         <div className="animate-pulse bg-highlight/20 p-2 rounded-lg"><Clock size={16} className="text-highlight" /></div>
                         <span className="text-xs font-bold text-highlight uppercase tracking-[0.2em]">Under Review...</span>
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="text-center py-20 bg-bg-card rounded-card border border-border-main">
                    <p className="text-gray-600 font-bold uppercase tracking-widest">No conversation history.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Page Footer */}
          <footer className="pt-16 text-center text-[10px] font-bold text-gray-700 uppercase tracking-[0.5em] border-t border-border-main/50">
            <p>© 2025 Class Nest — Distributed Learning Node — Dukestar Devs</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
