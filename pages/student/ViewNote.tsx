import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Note, Subject } from '../../types';
import { getNoteById } from '../../data';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, History, Calendar, BookOpen, Calculator, Microscope, Binary, Globe, Book } from 'lucide-react';
import DOMPurify from 'dompurify';

const ViewNote: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNote = async () => {
        if (id) {
            const foundNote = await getNoteById(id);
            setNote(foundNote || null);
            setLoading(false);
        }
    };
    fetchNote();
  }, [id]);

  const handleBack = () => {
      if (user?.role === 'admin') {
          navigate('/admin/notes');
      } else if (user?.role === 'teacher') {
          navigate('/teacher/notes');
      } else {
          navigate('/student/dashboard');
      }
  };

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  if (!note) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-text-primary dark:text-white">
        <h2 className="text-2xl font-bold mb-4">Note not found</h2>
        <button 
            onClick={handleBack} 
            className="flex items-center text-primary hover:underline"
        >
            <ArrowLeft className="mr-2" /> Go Back
        </button>
      </div>
    );
  }

  // Sanitize the content
  const cleanContent = DOMPurify.sanitize(note.content);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-roboto transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 z-10 px-4 py-3">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
            <button 
                onClick={handleBack}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium group"
            >
                <div className="p-2 rounded-full group-hover:bg-gray-100 dark:group-hover:bg-gray-800 mr-2 transition-colors">
                    <ArrowLeft size={20} />
                </div>
                {user?.role === 'student' ? 'Back to Dashboard' : 'Back to Notes'}
            </button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
         <div className="mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex flex-wrap gap-4 items-center mb-6 text-sm font-semibold tracking-wide uppercase">
                <span className={`flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300`}>
                        <SubjectIcon subject={note.subject} />
                        {note.subject}
                </span>
                <span className="flex items-center text-gray-500 dark:text-gray-400">
                    <Calendar size={16} className="mr-2"/>
                    {new Date(note.uploadDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400">
                    {note.classLevel}
                </span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-poppins font-bold text-gray-900 dark:text-white leading-tight">
                {note.title}
            </h1>
         </div>

         <article className="prose dark:prose-invert max-w-none text-lg md:text-xl leading-relaxed text-gray-800 dark:text-gray-200 font-serif view-note-content">
            <div dangerouslySetInnerHTML={{ __html: cleanContent }} />
         </article>
         
         {/* Styles for content rendering */}
         <style>{`
            .view-note-content img {
                max-width: 100%;
                height: auto;
                border-radius: 8px;
                margin: 20px 0;
            }
            .view-note-content ul {
                list-style-type: disc;
                padding-left: 20px;
            }
            .view-note-content ol {
                list-style-type: decimal;
                padding-left: 20px;
            }
         `}</style>
      </main>
    </div>
  );
};

const SubjectIcon = ({ subject }: { subject: Subject }) => {
    switch (subject) {
        case Subject.History: return <History size={16} className="mr-2" />;
        case Subject.Geography: return <Globe size={16} className="mr-2" />;
        case Subject.Mathematics: return <Calculator size={16} className="mr-2" />;
        case Subject.Physics: 
        case Subject.Chemistry:
        case Subject.Biology:
        case Subject.Science:
            return <Microscope size={16} className="mr-2" />;
        case Subject.ICT: return <Binary size={16} className="mr-2" />;
        case Subject.English:
            return <BookOpen size={16} className="mr-2" />;
        default: return <Book size={16} className="mr-2" />;
    }
};

export default ViewNote;