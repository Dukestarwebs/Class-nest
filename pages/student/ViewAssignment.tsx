

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Assignment, Subject } from '../../types';
import { getAssignmentById } from '../../data';
import { ArrowLeft, History, Landmark, Calendar, Clock, School, BookOpen, Calculator, Microscope, Binary, Globe, Book } from 'lucide-react';

const ViewAssignment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
        if (id) {
            const found = await getAssignmentById(id);
            setAssignment(found || null);
            setLoading(false);
        }
    };
    fetchAssignment();
  }, [id]);

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

  if (loading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-gray-900 text-text-primary dark:text-white">
        <h2 className="text-2xl font-bold mb-4">Assignment not found</h2>
        <button 
            onClick={() => navigate('/student/dashboard')} 
            className="flex items-center text-primary hover:underline"
        >
            <ArrowLeft className="mr-2" /> Go Back
        </button>
      </div>
    );
  }

  const dueDate = new Date(assignment.dueDate);
  const isOverdue = dueDate.getTime() < Date.now();

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-roboto transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 z-10 px-4 py-3">
        <div className="container mx-auto max-w-5xl flex items-center justify-between">
            <button 
                onClick={() => navigate('/student/dashboard')}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium group"
            >
                <div className="p-2 rounded-full group-hover:bg-gray-100 dark:group-hover:bg-gray-800 mr-2 transition-colors">
                    <ArrowLeft size={20} />
                </div>
                Back to Dashboard
            </button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto max-w-5xl px-4 py-8 md:py-12">
         <div className="mb-8 pb-6 border-b border-gray-100 dark:border-gray-800">
            <div className="flex flex-wrap gap-4 items-center mb-6 text-sm font-semibold tracking-wide uppercase">
                <span className={`flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300`}>
                        <SubjectIcon subject={assignment.subject} />
                        {assignment.subject}
                </span>
                <span className="flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                    <School size={16} className="mr-2"/>
                    {assignment.classLevel || 'N/A'}
                </span>
                <span className={`flex items-center px-3 py-1 rounded-full ${isOverdue ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'}`}>
                    <Calendar size={16} className="mr-2"/>
                    Due: {dueDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                 {assignment.postedDate && (
                    <span className="flex items-center text-gray-400 dark:text-gray-500 lowercase first-letter:uppercase">
                        <Clock size={14} className="mr-1.5"/>
                        Posted: {new Date(assignment.postedDate).toLocaleDateString()}
                    </span>
                )}
            </div>
            
            <h1 className="text-3xl md:text-5xl font-poppins font-bold text-gray-900 dark:text-white leading-tight">
                {assignment.subject} Assignment
            </h1>
         </div>

         <div className="prose dark:prose-invert max-w-none text-lg md:text-xl leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-serif bg-gray-50 dark:bg-gray-800/50 p-8 rounded-2xl border border-gray-100 dark:border-gray-700">
            {assignment.content}
         </div>
      </main>
    </div>
  );
};

export default ViewAssignment;