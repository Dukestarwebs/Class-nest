

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Announcement, Note, Question, Assignment, Subject } from '../../types';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, History, Send, MessageSquare, Book, Eye, ClipboardList, Calendar, AlertCircle, Megaphone, HelpCircle, Settings as SettingsIcon, Menu, X, BookOpen, Calculator, Microscope, Binary, Globe, ArrowRight, ArrowLeft, LifeBuoy } from 'lucide-react';
import { getAnnouncements, getNotes, getQuestionsByStudent, addQuestion, getAssignments } from '../../data';

type Tab = 'Announcements' | 'Assignments' | 'Notes' | 'Questions';

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Changed default tab to 'Notes' as requested
  const [activeTab, setActiveTab] = useState<Tab>('Notes');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // selectedSubject: 'All' means showing the subject cards. Specific subject means showing lists.
  const [selectedSubject, setSelectedSubject] = useState<Subject | 'All'>('All');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    try {
        const [annList, allNotes, studentQuestions, allAssignments] = await Promise.all([
             getAnnouncements(),
             getNotes(),
             getQuestionsByStudent(user.id),
             getAssignments()
        ]);

        const sortedAnnouncements = annList.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const filteredAnnouncements = sortedAnnouncements.filter(ann => ann.classLevel === 'All' || ann.classLevel === user.classLevel);
        setAnnouncements(filteredAnnouncements);

        const studentNotes = allNotes.filter(n => n.classLevel === user.classLevel);
        const sortedNotes = studentNotes.sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        setNotes(sortedNotes);

        const sortedQuestions = studentQuestions.sort((a,b) => new Date(a.questionDate).getTime() - new Date(b.questionDate).getTime());
        setQuestions(sortedQuestions);

        const studentAssignments = allAssignments.filter(a => a.classLevel === user.classLevel);
        const sortedAssignments = studentAssignments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        setAssignments(sortedAssignments);

    } catch (error) {
        console.error("Failed to fetch data:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    if(user) {
        fetchData();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSendQuestion = async () => {
    if (!newQuestion.trim() || !user) return;

    const question: Omit<Question, 'id'> = {
        studentId: user.id,
        studentName: user.name,
        questionText: newQuestion,
        questionDate: new Date().toISOString(),
        isAnswered: false,
    };
    
    try {
        await addQuestion(question);
        setNewQuestion('');
        fetchData(); // Refetch to show the new question
    } catch (error) {
        console.error("Failed to send question:", error);
    }
  };

  
  const filteredNotes = useMemo(() => {
    if (activeTab !== 'Notes') return [];
    if (selectedSubject === 'All') return []; 
    
    return notes.filter(note => {
      if (note.subject !== selectedSubject) return false;
      if (searchTerm.trim() === '') return true;
      const lowerCaseSearch = searchTerm.toLowerCase();
      const titleMatch = note.title.toLowerCase().includes(lowerCaseSearch);
      const contentMatch = note.content.toLowerCase().includes(lowerCaseSearch);
      return titleMatch || contentMatch;
    });
  }, [notes, searchTerm, activeTab, selectedSubject]);

  const filteredAssignments = useMemo(() => {
    if (activeTab !== 'Assignments') return [];
    if (selectedSubject === 'All') return [];

    return assignments.filter(assign => {
        if (assign.subject !== selectedSubject) return false;
        if (searchTerm.trim() === '') return true;
        const lowerCaseSearch = searchTerm.toLowerCase();
        const contentMatch = assign.content.toLowerCase().includes(lowerCaseSearch);
        return contentMatch;
    });
  }, [assignments, searchTerm, activeTab, selectedSubject]);

  const navItems = [
    { id: 'Notes', icon: Book, label: 'My Notes' },
    { id: 'Assignments', icon: ClipboardList, label: 'Assignments' },
    { id: 'Announcements', icon: Megaphone, label: 'Announcements' },
    { id: 'Questions', icon: HelpCircle, label: 'My Questions' },
  ];

  const SubjectIcon = ({ subject, className }: { subject: Subject | string, className?: string }) => {
    const size = 24; 
    switch (subject) {
        case Subject.History: return <History size={size} className={className} />;
        case Subject.Geography: return <Globe size={size} className={className} />;
        case Subject.Mathematics: return <Calculator size={size} className={className} />;
        case Subject.Physics: 
        case Subject.Chemistry:
        case Subject.Biology:
        case Subject.Science:
            return <Microscope size={size} className={className} />;
        case Subject.ICT:
            return <Binary size={size} className={className} />;
        case Subject.English:
            return <BookOpen size={size} className={className} />;
        default: return <Book size={size} className={className} />;
    }
  };

  // Helper to get color for subject cards
  const getSubjectColor = (subject: Subject | string) => {
    switch (subject) {
        case Subject.Mathematics: return 'bg-blue-500';
        case Subject.English: return 'bg-red-500';
        case Subject.Science:
        case Subject.Physics:
        case Subject.Chemistry:
        case Subject.Biology: return 'bg-purple-500';
        case Subject.History:
        case Subject.SocialStudies: return 'bg-orange-500';
        case Subject.Geography: return 'bg-green-500';
        case Subject.ICT: return 'bg-indigo-500';
        case Subject.ReligiousEducation: return 'bg-yellow-500';
        case Subject.Entrepreneurship: return 'bg-teal-500';
        case Subject.Vocational: return 'bg-pink-500';
        case Subject.Art: return 'bg-rose-500';
        default: return 'bg-gray-500';
    }
  };

  const getAvailableSubjects = () => {
      if (!user?.classLevel) return [];
      const isPrimary = ['P6', 'P7'].includes(user.classLevel);
      
      if (isPrimary) {
          return [
              Subject.Mathematics,
              Subject.English,
              Subject.Science,
              Subject.SocialStudies,
              Subject.ReligiousEducation
          ];
      } else {
          return [
              Subject.Mathematics,
              Subject.English,
              Subject.Physics,
              Subject.Chemistry,
              Subject.Biology,
              Subject.History,
              Subject.Geography,
              Subject.Entrepreneurship
          ];
      }
  };

  const availableSubjects = getAvailableSubjects();

  const renderContent = () => {
    if(loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }
    switch (activeTab) {
      case 'Announcements':
        return (
          <div className="space-y-6">
            {announcements.length > 0 ? announcements.map(ann => (
              <div 
                key={ann.id} 
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border-l-4 border-primary overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-primary/10 p-2 rounded-full text-primary">
                                <Megaphone size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-800 dark:text-white font-poppins">{ann.sender}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(ann.date).toLocaleDateString()} at {new Date(ann.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wide bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 px-3 py-1 rounded-full">
                            {ann.classLevel === 'All' ? 'Everyone' : ann.classLevel}
                        </span>
                    </div>
                    <div className="pl-2">
                        <p className="text-gray-700 dark:text-gray-200 text-lg leading-relaxed">{ann.message}</p>
                    </div>
                </div>
              </div>
            )) : (
                 <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
                    <Megaphone className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-xl font-medium">No announcements yet</p>
                    <p className="text-sm mt-2">Check back later for updates from your teachers.</p>
                </div>
            )}
          </div>
        );
      case 'Assignments':
        if (selectedSubject === 'All') {
            return (
                <>
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold dark:text-white">Assignments Library</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Select a subject to view assignments</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {availableSubjects.map((subj) => {
                            const assignCount = assignments.filter(a => a.subject === subj).length;
                            return (
                                <div 
                                    key={subj}
                                    onClick={() => setSelectedSubject(subj)}
                                    className={`${getSubjectColor(subj)} p-6 rounded-xl shadow-lg flex items-center space-x-4 transition-transform transform hover:-translate-y-1 cursor-pointer text-white group`}
                                >
                                    <div className="p-3 rounded-full bg-white/25 group-hover:bg-white/30 transition-colors">
                                        <SubjectIcon subject={subj} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold font-poppins">{subj}</p>
                                        <p className="text-sm opacity-90">{assignCount} {assignCount === 1 ? 'Assignment' : 'Assignments'}</p>
                                    </div>
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            );
        } else {
             return (
                <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <button 
                            onClick={() => setSelectedSubject('All')}
                            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition-colors"
                        >
                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full mr-2">
                                <ArrowLeft size={20} />
                            </div>
                            Back to Subjects
                        </button>
                        
                        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input 
                              type="text" 
                              placeholder={`Search assignments...`}
                              value={searchTerm}
                              onChange={e => setSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-text-primary dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl mb-6 flex items-center">
                        <div className={`p-2 rounded-lg ${getSubjectColor(selectedSubject)} text-white mr-3`}>
                             <SubjectIcon subject={selectedSubject} className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-text-primary dark:text-white">{selectedSubject} Assignments</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {filteredAssignments.length > 0 ? filteredAssignments.map(assign => {
                            const dueDate = new Date(assign.dueDate);
                            const isOverdue = dueDate.getTime() < Date.now();
                            const isDueSoon = dueDate.getTime() - Date.now() < 24 * 60 * 60 * 1000 && !isOverdue;

                            return (
                                <div 
                                    key={assign.id} 
                                    onClick={() => navigate(`/student/assignments/${assign.id}`)}
                                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-md transition-shadow group flex flex-col h-full"
                                >
                                    <div className="p-5 flex-grow flex flex-col">
                                        <div className="flex justify-between items-center mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded dark:bg-gray-700 dark:text-gray-400">
                                                    {assign.classLevel || 'N/A'}
                                                </span>
                                                {isOverdue && <span className="flex items-center text-xs font-bold text-red-500"><AlertCircle size={12} className="mr-1"/> Overdue</span>}
                                                {isDueSoon && <span className="flex items-center text-xs font-bold text-orange-500"><AlertCircle size={12} className="mr-1"/> Due Soon</span>}
                                            </div>
                                        </div>
                                        
                                        <div className="bg-secondary dark:bg-gray-900/50 p-4 rounded-lg mb-3 relative overflow-hidden flex-grow">
                                            <p className="text-gray-800 dark:text-gray-200 text-base line-clamp-3 font-medium">{assign.content}</p>
                                            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-secondary dark:from-[#1a202c] to-transparent"></div>
                                        </div>

                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-auto">
                                            <Calendar size={16} className="mr-2 text-primary" />
                                            <span className="font-medium">Due: </span>
                                            <span className="ml-1">{dueDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 px-5 py-3 border-t border-gray-100 dark:border-gray-700">
                                        <span className="text-xs font-bold text-primary flex items-center justify-center group-hover:underline">
                                            View Details <ArrowRight size={12} className="ml-1"/>
                                        </span>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="col-span-full py-16 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <ClipboardList className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg">No assignments for {selectedSubject}.</p>
                            </div>
                        )}
                    </div>
                </>
            );
        }
      case 'Questions':
        return (
            <>
                <div className="space-y-6 pb-24">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4 text-center">
                         <h3 className="font-poppins font-semibold text-lg text-primary dark:text-blue-300 mb-1">Your Questions</h3>
                         <p className="text-sm text-gray-600 dark:text-gray-400">Ask your teacher anything about the subjects.</p>
                    </div>

                    {questions.length > 0 ? questions.map(q => (
                        <div key={q.id} className="space-y-4">
                            <div className="flex justify-end">
                                <div className="max-w-lg">
                                    <div className="bg-primary text-white p-3 rounded-t-2xl rounded-bl-2xl shadow-md">
                                        <p>{q.questionText}</p>
                                    </div>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 text-right mt-1 pr-2">{new Date(q.questionDate).toLocaleString()}</p>
                                </div>
                            </div>

                            {q.isAnswered && q.answerText ? (
                                <div className="flex justify-start">
                                    <div className="max-w-lg">
                                        <div className="bg-white dark:bg-gray-800 text-text-primary dark:text-gray-200 p-3 rounded-t-2xl rounded-br-2xl shadow-md border border-gray-100 dark:border-gray-700">
                                            <p className="font-semibold text-primary text-sm mb-1">Teacher's Reply</p>
                                            <p>{q.answerText}</p>
                                        </div>
                                        {q.answerDate && <p className="text-xs text-gray-400 dark:text-gray-500 text-left mt-1 pl-2">{new Date(q.answerDate).toLocaleString()}</p>}
                                    </div>
                                </div>
                            ) : (
                               <div className="flex justify-start">
                                    <div className="max-w-lg">
                                        <div className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 p-2 px-3 rounded-full text-xs italic">
                                            <p>Sent. Waiting for reply...</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )) : (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                            <MessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                            <p className="mt-2">You haven't asked any questions yet.</p>
                        </div>
                    )}
                </div>
                
                <div className="fixed bottom-0 right-0 left-0 md:left-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-4 border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-30 transition-all duration-300">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex gap-2 items-end">
                            <textarea 
                                value={newQuestion}
                                onChange={(e) => setNewQuestion(e.target.value)}
                                placeholder="Type your question for the teacher..."
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-gray-50 dark:bg-gray-800 text-text-primary dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                rows={1}
                                style={{ minHeight: '3rem', maxHeight: '8rem' }}
                            />
                            <button 
                                onClick={handleSendQuestion} 
                                className="bg-primary text-white font-bold p-3 rounded-lg hover:bg-blue-600 transition-colors flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                aria-label="Send question"
                                disabled={!newQuestion.trim()}
                            >
                                <Send size={20}/>
                            </button>
                        </div>
                    </div>
                </div>
            </>
        );
      case 'Notes':
        if (selectedSubject === 'All') {
            return (
                <>
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold dark:text-white">Subject Libraries</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Select a subject to view notes</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {availableSubjects.map((subj) => {
                            const noteCount = notes.filter(n => n.subject === subj).length;
                            return (
                                <div 
                                    key={subj}
                                    onClick={() => setSelectedSubject(subj)}
                                    className={`${getSubjectColor(subj)} p-6 rounded-xl shadow-lg flex items-center space-x-4 transition-transform transform hover:-translate-y-1 cursor-pointer text-white group`}
                                >
                                    <div className="p-3 rounded-full bg-white/25 group-hover:bg-white/30 transition-colors">
                                        <SubjectIcon subject={subj} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold font-poppins">{subj}</p>
                                        <p className="text-sm opacity-90">{noteCount} {noteCount === 1 ? 'Note' : 'Notes'}</p>
                                    </div>
                                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight size={20} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            );
        } else {
            return (
                <>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                        <button 
                            onClick={() => setSelectedSubject('All')}
                            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary font-medium transition-colors"
                        >
                            <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full mr-2">
                                <ArrowLeft size={20} />
                            </div>
                            Back to Subjects
                        </button>
                        
                        <div className="relative w-full sm:w-auto sm:min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                            <input 
                              type="text" 
                              placeholder={`Search notes...`}
                              value={searchTerm}
                              onChange={e => setSearchTerm(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-text-primary dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl mb-6 flex items-center">
                        <div className={`p-2 rounded-lg ${getSubjectColor(selectedSubject)} text-white mr-3`}>
                             <SubjectIcon subject={selectedSubject} className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-text-primary dark:text-white">{selectedSubject} Notes</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredNotes.length > 0 ? filteredNotes.map(note => (
                        <div 
                            key={note.id} 
                            className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm flex flex-col justify-between transition-shadow hover:shadow-xl border border-transparent dark:border-gray-700"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center text-primary font-bold">
                                        <h3 className="text-lg line-clamp-1" title={note.title}>{note.title}</h3>
                                    </div>
                                    <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400">
                                        {note.classLevel}
                                    </span>
                                </div>
                            <div className="bg-secondary dark:bg-gray-900/50 p-3 rounded-lg mb-4 relative overflow-hidden h-24">
                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 font-mono">{note.content}</p>
                                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-secondary dark:from-[#1a202c] to-transparent"></div>
                            </div>
                            <p className="text-xs text-gray-400">Posted: {new Date(note.uploadDate).toLocaleDateString()}</p>
                            </div>
                            <button
                            onClick={() => navigate(`/student/notes/${note.id}`)}
                            className="mt-4 w-full flex items-center justify-center bg-white dark:bg-gray-700 border-2 border-primary text-primary dark:text-white px-4 py-2 rounded-lg hover:bg-primary hover:text-white transition-colors font-semibold"
                            >
                            <Eye className="mr-2 h-4 w-4" />
                            Read Note
                            </button>
                        </div>
                        )) : (
                            <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No notes found for {selectedSubject}.</p>
                            </div>
                        )}
                    </div>
                </>
            );
        }
    }
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
         {/* Sidebar Header */}
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

        {/* Navigation */}
        <nav className="flex-grow space-y-2 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => {
                        setActiveTab(item.id as Tab);
                        // Reset filters when clicking tab
                        if (item.id === 'Notes' || item.id === 'Assignments') setSelectedSubject('All');
                        setIsSidebarOpen(false);
                    }}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg ${
                        activeTab === item.id
                        ? 'bg-primary text-white shadow-md'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20'
                    }`}
                >
                    <item.icon className="mr-3 h-5 w-5" strokeWidth={activeTab === item.id ? 2.5 : 2} />
                    {item.label}
                </button>
            ))}
            
            <button
                onClick={() => {
                    navigate('/student/help');
                    setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20`}
            >
                <LifeBuoy className="mr-3 h-5 w-5" />
                Help & Feedback
            </button>

            <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
            
            <button
                onClick={() => navigate('/student/settings')}
                className="w-full flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/20"
            >
                <SettingsIcon className="mr-3 h-5 w-5" />
                Settings
            </button>
        </nav>

        {/* User Profile & Logout */}
        <div className="mt-auto p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
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
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.classLevel} Student</p>
                    </div>
                </div>
           </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
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
                  <span className="text-lg font-bold text-primary font-poppins">{activeTab === 'Announcements' ? 'Dashboard' : activeTab}</span>
              </div>
               <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 dark:border-gray-600">
                   {user?.avatarUrl ? (
                        <img src={user.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                   ) : (
                        <div className="w-full h-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                            {user?.name.charAt(0)}
                        </div>
                   )}
               </div>
          </header>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
             {/* Desktop Header / Title area */}
             <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div className="hidden md:block">
                     <h1 className="text-3xl font-poppins font-bold text-text-primary dark:text-white">{activeTab === 'Announcements' ? 'Student Dashboard' : activeTab}</h1>
                     <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {user?.name}!</p>
                </div>
                
                {/* Search Bar for Notes or Assignments when searching */}
                {(activeTab === 'Notes' || activeTab === 'Assignments') && selectedSubject !== 'All' && (
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
                    <input 
                      type="text" 
                      placeholder={`Search ${activeTab.toLowerCase()}...`}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-text-primary dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                    />
                  </div>
                )}
             </div>

             {renderContent()}

             <div className="mt-12 text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
                © 2025 Class Nest — Dukestar Developers
             </div>
          </main>
      </div>

    </div>
  );
};

export default StudentDashboard;