

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Note, Subject, ClassLevel } from '../../types';
import { Trash2, History, Send, FileText, Edit, X, Calculator, Book, Binary, Microscope, Globe, BookOpen, Eye } from 'lucide-react';
import { getNotes, addNote, deleteNote, updateNote } from '../../data';

const UploadNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState<Subject>(Subject.Mathematics);
  const [classLevel, setClassLevel] = useState<ClassLevel>('S1');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchNotes = async () => {
    try {
        const allNotes = await getNotes();
        const sortedNotes = allNotes.sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        setNotes(sortedNotes);
    } catch(e) {
        console.error("Error fetching notes", e);
    }
  };
  
  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Title and note content are required.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
        if (editingId) {
            await updateNote(editingId, {
                title,
                content,
                subject,
                classLevel
            });
            setSuccess('Note updated successfully!');
            setEditingId(null);
        } else {
            const newNote: Omit<Note, 'id'> = {
                title,
                content,
                subject,
                uploadDate: new Date().toISOString(),
                classLevel
            };
            await addNote(newNote);
            setSuccess('Note posted successfully!');
        }
        
        setTitle('');
        setContent('');
        // Keep current subject/class selection for convenience
        
        setTimeout(() => setSuccess(''), 3000);
        await fetchNotes();
    } catch (error) {
        console.error("Error saving note:", error);
        setError("Failed to save note.");
    } finally {
        setLoading(false);
    }
  };
  
  const handleEdit = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setSubject(note.subject);
    setClassLevel(note.classLevel || 'S1');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setSubject(Subject.Mathematics);
    setClassLevel('S1');
  };

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation(); 
    
    // Optimistic update
    setNotes(prev => prev.filter(n => n.id !== noteId));
    
    try {
        await deleteNote(noteId);
        if (editingId === noteId) {
            cancelEdit();
        }
    } catch (error) {
        console.error("Error deleting note: ", error);
        setError("Failed to delete note.");
        fetchNotes(); 
    }
  };

  const handleView = (e: React.MouseEvent, noteId: string) => {
      e.stopPropagation();
      navigate(`/admin/notes/${noteId}`);
  };

  const SubjectIcon = ({ subject }: { subject: Subject }) => {
    switch (subject) {
        case Subject.History: return <History className="h-6 w-6 text-orange-500" />;
        case Subject.Geography: return <Globe className="h-6 w-6 text-green-500" />;
        case Subject.Mathematics: return <Calculator className="h-6 w-6 text-blue-500" />;
        case Subject.Physics: 
        case Subject.Chemistry:
        case Subject.Biology:
        case Subject.Science:
            return <Microscope className="h-6 w-6 text-purple-500" />;
        case Subject.ICT: return <Binary className="h-6 w-6 text-indigo-500" />;
        case Subject.English:
            return <BookOpen className="h-6 w-6 text-red-500" />;
        default: return <Book className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
            <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">Manage Notes</h1>
            <div className={`p-6 rounded-xl shadow-md transition-all duration-200 ${editingId ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-800'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                        {editingId ? 'Edit Note' : 'Create New Note'}
                    </h2>
                    {editingId && (
                        <button type="button" onClick={cancelEdit} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <X size={20} />
                        </button>
                    )}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-300 p-3 rounded-lg">{error}</p>}
                    {success && <p className="text-green-500 bg-green-100 dark:bg-green-900/30 dark:text-green-300 p-3 rounded-lg">{success}</p>}
                    
                    <div className="grid grid-cols-1 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                            <select value={subject} onChange={e => setSubject(e.target.value as Subject)} className="w-full px-4 py-3 bg-secondary dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-text-primary dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors">
                                {Object.values(Subject).map(subj => (
                                    <option key={subj} value={subj}>{subj}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
                            <select value={classLevel} onChange={e => setClassLevel(e.target.value as ClassLevel)} className="w-full px-4 py-3 bg-secondary dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-text-primary dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors">
                                {['P6', 'P7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map(cls => (
                                    <option key={cls} value={cls}>{cls}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <input type="text" placeholder="e.g. Chapter 1 Summary" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-secondary dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-text-primary dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors" required />
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                        <textarea 
                            placeholder="Type your notes here..." 
                            value={content} 
                            onChange={e => setContent(e.target.value)} 
                            className="w-full px-4 py-3 bg-secondary dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-text-primary dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-64 resize-none transition-colors" 
                            required 
                        />
                    </div>

                    <div className="flex gap-3">
                        {editingId && (
                             <button type="button" onClick={cancelEdit} className="flex-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-bold">
                                Cancel
                            </button>
                        )}
                        <button type="submit" disabled={loading} className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-primary/50 flex justify-center items-center font-bold">
                            <Send className="mr-2 h-5 w-5" />
                            {loading ? 'Saving...' : (editingId ? 'Update Note' : 'Post Note')}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-3xl font-poppins font-bold text-text-primary dark:text-white">Notes List</h2>
             <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 transition-colors duration-200">
                {notes.length > 0 ? (
                    <div className="space-y-4">
                        {notes.map(note => (
                            <div key={note.id} className={`p-5 border rounded-xl hover:bg-secondary dark:hover:bg-gray-700/50 transition-all duration-200 group ${editingId === note.id ? 'border-primary ring-1 ring-primary bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-secondary dark:bg-gray-700 rounded-full">
                                            <SubjectIcon subject={note.subject} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold font-poppins text-lg text-text-primary dark:text-gray-100">{note.title}</h3>
                                                <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded dark:bg-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                    {note.classLevel}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 items-center mt-1">
                                                <span className="text-xs font-medium text-primary bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                                                    {note.subject}
                                                </span>
                                                <p className="text-xs text-gray-400 font-medium">{new Date(note.uploadDate).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button 
                                            type="button"
                                            onClick={(e) => handleView(e, note.id)}
                                            className="text-green-500 hover:text-white hover:bg-green-500 p-2 rounded-lg transition-colors"
                                            title="Read Note"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={(e) => handleEdit(e, note)} 
                                            className="text-blue-500 hover:text-white hover:bg-blue-500 p-2 rounded-lg transition-colors"
                                            title="Edit Note"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={(e) => handleDelete(e, note.id)} 
                                            className="text-red-500 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-colors"
                                            title="Delete Note"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-secondary/50 dark:bg-gray-900/50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 font-mono">
                                        {note.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                        <FileText className="w-16 h-16 mb-4 opacity-50" />
                        <p className="text-lg">No notes posted yet.</p>
                        <p className="text-sm">Use the form to create your first note.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default UploadNotes;