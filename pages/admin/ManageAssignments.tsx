

import React, { useState, useEffect } from 'react';
import { Assignment, Subject, ClassLevel } from '../../types';
import { Trash2, Edit, Plus, Calendar, ClipboardList, X, Save, History, Globe, Calculator, Microscope, Binary, BookOpen, Book } from 'lucide-react';
import { getAssignments, addAssignment, updateAssignment, deleteAssignment } from '../../data';

const ManageAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  
  // Form State
  const [subject, setSubject] = useState<Subject>(Subject.Mathematics);
  const [classLevel, setClassLevel] = useState<ClassLevel>('S1');
  const [dueDate, setDueDate] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const fetchAssignments = async () => {
    try {
        const list = await getAssignments();
        const sorted = list.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        setAssignments(sorted);
    } catch (e) {
        console.error("Error fetching assignments", e);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const resetForm = () => {
    setSubject(Subject.Mathematics);
    setClassLevel('S1');
    setDueDate('');
    setContent('');
    setIsEditing(false);
    setCurrentId(null);
    setError('');
  };

  const handleEdit = (assignment: Assignment) => {
    setSubject(assignment.subject);
    setClassLevel(assignment.classLevel || 'S1');
    const date = new Date(assignment.dueDate);
    const formattedDate = date.toISOString().split('T')[0];
    setDueDate(formattedDate);
    setContent(assignment.content);
    setIsEditing(true);
    setCurrentId(assignment.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content || !dueDate) {
      setError('Assignment content and due date are required.');
      return;
    }

    const assignmentData = {
      subject,
      classLevel,
      content,
      dueDate: new Date(dueDate).toISOString(),
      postedDate: isEditing ? undefined : new Date().toISOString(),
    };

    try {
      if (isEditing && currentId) {
        await updateAssignment(currentId, assignmentData);
      } else {
        await addAssignment({ ...assignmentData, postedDate: new Date().toISOString() });
      }
      resetForm();
      fetchAssignments();
    } catch (err) {
      console.error(err);
      setError('Failed to save assignment.');
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic update
    setAssignments(prev => prev.filter(a => a.id !== id));
    try {
      await deleteAssignment(id);
    } catch (err) {
      console.error(err);
      fetchAssignments(); 
    }
  };

  const SubjectIcon = ({ subject }: { subject: Subject }) => {
    switch (subject) {
        case Subject.History: return <History size={12} className="mr-1" />;
        case Subject.Geography: return <Globe size={12} className="mr-1" />;
        case Subject.Mathematics: return <Calculator size={12} className="mr-1" />;
        case Subject.Physics: 
        case Subject.Chemistry:
        case Subject.Biology:
        case Subject.Science:
            return <Microscope size={12} className="mr-1" />;
        case Subject.ICT: return <Binary size={12} className="mr-1" />;
        case Subject.English:
            return <BookOpen size={12} className="mr-1" />;
        default: return <Book size={12} className="mr-1" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Form Section */}
      <div className="lg:col-span-1 space-y-6">
        <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">Assignments</h1>
        
        <div className={`p-6 rounded-xl shadow-md transition-all duration-200 ${isEditing ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-800'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 flex items-center">
              {isEditing ? <Edit className="mr-2 h-5 w-5"/> : <Plus className="mr-2 h-5 w-5"/>}
              {isEditing ? 'Edit Assignment' : 'New Assignment'}
            </h2>
            {isEditing && (
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={20} />
              </button>
            )}
          </div>

          {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
                <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <select 
                    value={subject} 
                    onChange={e => setSubject(e.target.value as Subject)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                >
                    {Object.values(Subject).map(subj => (
                        <option key={subj} value={subj}>{subj}</option>
                    ))}
                </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
                    <select value={classLevel} onChange={e => setClassLevel(e.target.value as ClassLevel)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white">
                        {['P6', 'P7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                <input 
                    type="date" 
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assignment Content</label>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={6}
                placeholder="Type the assignment details here..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white resize-none"
              />
            </div>

            <button type="submit" className="w-full bg-primary text-white py-2.5 rounded-lg hover:bg-blue-600 transition-colors flex justify-center items-center font-bold">
              <Save className="mr-2 h-4 w-4" />
              {isEditing ? 'Update Assignment' : 'Post Assignment'}
            </button>
          </form>
        </div>
      </div>

      {/* List Section */}
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-3xl font-poppins font-bold text-text-primary dark:text-white">Active Assignments</h2>
        
        <div className="grid grid-cols-1 gap-4">
          {assignments.length > 0 ? assignments.map(assign => (
            <div key={assign.id} className={`bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between gap-4 ${isEditing && currentId === assign.id ? 'ring-2 ring-primary' : ''}`}>
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase mr-2 flex items-center bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300`}>
                    <SubjectIcon subject={assign.subject} />
                    {assign.subject}
                  </span>
                  <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mr-2">
                      {assign.classLevel || 'N/A'}
                  </span>
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs font-medium">
                    <Calendar size={14} className="mr-1" />
                    Due: {new Date(assign.dueDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                 </div>
                </div>
                <p className="text-gray-700 dark:text-gray-200 text-base whitespace-pre-wrap line-clamp-3">{assign.content}</p>
              </div>
              
              <div className="flex flex-row sm:flex-col justify-center gap-2 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-700 pt-3 sm:pt-0 sm:pl-3 shrink-0">
                <button 
                  onClick={() => handleEdit(assign)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
                >
                  <Edit size={16} className="mr-1.5"/> Edit
                </button>
                <button 
                  onClick={() => handleDelete(assign.id)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                >
                  <Trash2 size={16} className="mr-1.5"/> Delete
                </button>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-400 dark:text-gray-500">
              <ClipboardList className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">No assignments posted yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageAssignments;