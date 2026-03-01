import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Note, Subject, ClassLevel, Draft } from '../../types';
import { Trash2, History, Send, FileText, Edit, X, Calculator, Book, Binary, Microscope, Globe, BookOpen, Eye, Box, RefreshCw, CheckCircle } from 'lucide-react';
import { getNotes, addNote, deleteNote, updateNote, uploadNoteImage, saveDraft, deleteDraft } from '../../data';
import { useAuth } from '../../contexts/AuthContext';
import Quill from 'quill';

const UploadNotes: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState<Subject>(Subject.Mathematics);
  const [classLevel, setClassLevel] = useState<ClassLevel>('S1');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Draft State
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [lastAutoSaved, setLastAutoSaved] = useState<Date | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Refs for Quill
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);

  // Check if we are resuming a draft from navigation state
  useEffect(() => {
    const resumeDraft = location.state?.resumeDraft as Draft;
    if (resumeDraft) {
        setTitle(resumeDraft.title);
        setSubject(resumeDraft.subject);
        setClassLevel(resumeDraft.classLevel);
        setContent(resumeDraft.content);
        setDraftId(resumeDraft.id);
        if (quillInstance.current) {
            quillInstance.current.root.innerHTML = resumeDraft.content;
        }
    }
  }, [location]);

  // Determine available classes
  const availableClasses: ClassLevel[] = user?.role === 'teacher' && user.assignedClasses 
    ? user.assignedClasses 
    : ['P6', 'P7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

  useEffect(() => {
      if (availableClasses.length > 0 && !availableClasses.includes(classLevel)) {
          setClassLevel(availableClasses[0]);
      }
      if (user?.role === 'teacher' && user.assignedSubjects && user.assignedSubjects.length > 0) {
          setSubject(user.assignedSubjects[0]);
      }
  }, [user]);

  const fetchNotes = async () => {
    try {
        const allNotes = await getNotes();
        const activeNotes = allNotes.filter(n => !n.isArchived);
        const sortedNotes = activeNotes.sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
        setNotes(sortedNotes);
    } catch(e) {
        console.error("Error fetching notes", e);
    }
  };
  
  useEffect(() => {
    fetchNotes();
  }, []);

  // Initialize Quill Editor
  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
        const imageHandler = () => {
            const input = document.createElement('input');
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'image/png, image/jpeg');
            input.click();

            input.onchange = async () => {
                if (input.files && input.files[0]) {
                    const file = input.files[0];
                    if (file.size > 5 * 1024 * 1024) {
                        alert('Image is too large. Max 5MB allowed.');
                        return;
                    }
                    try {
                        const url = await uploadNoteImage(file);
                        const range = quillInstance.current.getSelection(true);
                        quillInstance.current.insertEmbed(range.index, 'image', url);
                        quillInstance.current.setSelection(range.index + 1);
                        quillInstance.current.insertText(range.index + 1, '\n');
                    } catch (e) {
                        console.error('Image upload failed', e);
                        alert('Failed to upload image.');
                    }
                }
            };
        };

        quillInstance.current = new Quill(editorRef.current, {
            theme: 'snow',
            placeholder: 'Type your notes here...',
            modules: {
                toolbar: {
                    container: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'align': [] }],
                        ['link', 'image'],
                        ['clean']
                    ],
                    handlers: { image: imageHandler }
                }
            }
        });

        quillInstance.current.on('text-change', () => {
            setContent(quillInstance.current.root.innerHTML);
        });
    }
  }, []);

  // Auto-Save Effect
  useEffect(() => {
    const timer = setInterval(async () => {
        const currentContent = quillInstance.current ? quillInstance.current.root.innerHTML : content;
        const stripped = currentContent.replace(/<[^>]*>/g, '').trim();
        const hasContent = stripped.length > 5 || currentContent.includes('<img');

        if (user && hasContent && !editingId) {
            setIsAutoSaving(true);
            try {
                const id = await saveDraft({
                    user_id: user.id,
                    title: title || 'Untitled Note',
                    content: currentContent,
                    subject,
                    classLevel: classLevel
                }, draftId || undefined);
                setDraftId(id);
                setLastAutoSaved(new Date());
            } catch (err) {
                console.error("Auto-save failed", err);
            } finally {
                setTimeout(() => setIsAutoSaving(false), 2000);
            }
        }
    }, 5000);

    return () => clearInterval(timer);
  }, [title, content, subject, classLevel, user, draftId, editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentContent = quillInstance.current ? quillInstance.current.root.innerHTML : content;
    const stripped = currentContent.replace(/<[^>]*>/g, '').trim();
    const hasImage = currentContent.includes('<img');

    if (!title.trim() || (!stripped && !hasImage)) {
      setError('Title and content (text or image) are required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
        if (editingId) {
            await updateNote(editingId, {
                title,
                content: currentContent,
                subject,
                classLevel
            });
            setSuccess('Note updated successfully!');
            handleCancelEdit();
        } else {
            // FIX: Pass authorId to addNote function. Also ensure user is available.
            if (!user) {
                setError('You must be logged in to create a note.');
                setLoading(false);
                return;
            }
            const newNote: Omit<Note, 'id'> = {
                title,
                content: currentContent,
                subject,
                uploadDate: new Date().toISOString(),
                classLevel
            };
            await addNote(newNote, user.id);
            setSuccess('Note posted successfully!');
            
            // Clean up draft if one existed
            if (draftId) {
                await deleteDraft(draftId);
                setDraftId(null);
            }

            setTitle('');
            if (quillInstance.current) quillInstance.current.setText('');
            setContent('');
        }
        
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
    setSubject(note.subject);
    setClassLevel(note.classLevel || 'S1');
    setContent(note.content);
    if (quillInstance.current) quillInstance.current.root.innerHTML = note.content;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setDraftId(null);
    setTitle('');
    setContent('');
    if (quillInstance.current) quillInstance.current.setText('');
    if (user?.role === 'teacher' && user.assignedSubjects && user.assignedSubjects.length > 0) {
        setSubject(user.assignedSubjects[0]);
    } else {
        setSubject(Subject.Mathematics);
    }
    if(availableClasses.length > 0) setClassLevel(availableClasses[0]);
  };

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation(); 
    if(!window.confirm("Delete this note permanently?")) return;
    setNotes(prev => prev.filter(n => n.id !== noteId));
    try {
        await deleteNote(noteId);
        if (editingId === noteId) handleCancelEdit();
    } catch (error) {
        console.error("Error deleting note: ", error);
        setError("Failed to delete note.");
        fetchNotes(); 
    }
  };

  const handleArchive = async (e: React.MouseEvent, noteId: string) => {
      e.stopPropagation();
      setNotes(prev => prev.filter(n => n.id !== noteId));
      try {
          await updateNote(noteId, { isArchived: true });
          if (editingId === noteId) handleCancelEdit();
      } catch (error: any) {
          console.error("Error archiving note", error);
          setError(`Failed to archive note`);
          fetchNotes();
      }
  };

  const handleView = (e: React.MouseEvent, noteId: string) => {
      e.stopPropagation();
      const prefix = user?.role === 'teacher' ? '/teacher' : '/admin';
      navigate(`${prefix}/notes/${noteId}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">Manage Notes</h1>
                {lastAutoSaved && !editingId && (
                    <div className="flex items-center text-xs text-gray-400">
                        {isAutoSaving ? (
                            <RefreshCw className="mr-1 animate-spin text-primary" size={14} />
                        ) : (
                            <CheckCircle className="mr-1 text-green-500" size={14} />
                        )}
                        {isAutoSaving ? 'Auto-saving...' : `Draft saved at ${lastAutoSaved.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                    </div>
                )}
            </div>
            
            <div className={`p-6 rounded-xl shadow-md transition-all duration-200 ${editingId ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-800'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                        {editingId ? 'Edit Note' : draftId ? 'Continuing Draft' : 'Create New Note'}
                    </h2>
                    {(editingId || draftId) && (
                        <button type="button" onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <X size={20} />
                        </button>
                    )}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-300 p-3 rounded-lg">{error}</p>}
                    {success && <p className="text-green-500 bg-green-100 dark:bg-green-900/30 dark:text-green-300 p-3 rounded-lg">{success}</p>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                            <select value={subject} onChange={e => setSubject(e.target.value as Subject)} className="w-full px-4 py-3 bg-secondary dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-text-primary dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors">
                                {user?.role === 'teacher' && user.assignedSubjects && user.assignedSubjects.length > 0 ? (
                                    user.assignedSubjects.map(subj => (
                                        <option key={subj} value={subj}>{subj}</option>
                                    ))
                                ) : (
                                    Object.values(Subject).map(subj => (
                                        <option key={subj} value={subj}>{subj}</option>
                                    ))
                                )}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
                            <select value={classLevel} onChange={e => setClassLevel(e.target.value as ClassLevel)} className="w-full px-4 py-3 bg-secondary dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-text-primary dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors">
                                {availableClasses.length > 0 ? availableClasses.map(cls => (
                                    <option key={cls} value={cls}>{cls}</option>
                                )) : <option disabled>No classes assigned</option>}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                        <input type="text" placeholder="e.g. Chapter 1 Summary" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-3 bg-secondary dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-text-primary dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors" required />
                    </div>

                    <div className="rich-text-container">
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Content</label>
                         <div className="bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                             <div ref={editorRef} style={{ height: '500px', overflowY: 'auto' }} className="dark:text-white"></div>
                         </div>
                         <style>{`
                            .ql-toolbar { border-color: #e5e7eb !important; background: #f9fafb; border-top-left-radius: 0.5rem; border-top-right-radius: 0.5rem; }
                            .dark .ql-toolbar { background: #374151; border-color: #4b5563 !important; }
                            .dark .ql-stroke { stroke: #d1d5db !important; }
                            .dark .ql-fill { fill: #d1d5db !important; }
                            .dark .ql-picker { color: #d1d5db !important; }
                            .ql-container { border-bottom-left-radius: 0.5rem; border-bottom-right-radius: 0.5rem; border-color: #e5e7eb !important; font-size: 16px; font-family: 'Roboto', sans-serif; }
                            .dark .ql-container { border-color: #4b5563 !important; color: white; }
                            .ql-editor { font-size: 16px; min-height: 100%; overflow-y: auto; }
                         `}</style>
                    </div>

                    <div className="flex gap-3 pt-8">
                        {(editingId || draftId) && (
                             <button type="button" onClick={handleCancelEdit} className="flex-1 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-bold">
                                Reset Form
                            </button>
                        )}
                        <button type="submit" disabled={loading} className="flex-1 bg-primary text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-primary/50 flex justify-center items-center font-bold">
                            <Send className="mr-2 h-5 w-5" />
                            {loading ? 'Saving...' : (editingId ? 'Update Note' : 'Post Note Now')}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
            <h2 className="text-3xl font-poppins font-bold text-text-primary dark:text-white">Active Notes</h2>
             <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md max-h-[100vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 transition-colors duration-200">
                {notes.length > 0 ? (
                    <div className="space-y-4">
                        {notes.map(note => (
                            <div key={note.id} className={`p-4 border rounded-xl hover:bg-secondary dark:hover:bg-gray-700/50 transition-all duration-200 group ${editingId === note.id ? 'border-primary ring-1 ring-primary bg-blue-50 dark:bg-blue-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-1.5 bg-secondary dark:bg-gray-700 rounded-full">
                                            <SubjectIcon subject={note.subject} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold font-poppins text-sm text-text-primary dark:text-gray-100 line-clamp-1">{note.title}</h3>
                                        </div>
                                    </div>
                                    <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-2 py-0.5 rounded dark:bg-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-600">
                                        {note.classLevel}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                     <span className="text-xs font-medium text-primary bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                                        {note.subject}
                                    </span>
                                    <p className="text-xs text-gray-400 font-medium">{new Date(note.uploadDate).toLocaleDateString()}</p>
                                </div>
                                <div className="flex space-x-2 justify-end">
                                        <button onClick={(e) => handleView(e, note.id)} className="text-green-500 hover:text-white hover:bg-green-500 p-1.5 rounded-lg transition-colors"><Eye size={16} /></button>
                                        <button onClick={(e) => handleArchive(e, note.id)} className="text-orange-500 hover:text-white hover:bg-orange-500 p-1.5 rounded-lg transition-colors"><Box size={16} /></button>
                                        <button onClick={(e) => handleEdit(e, note)} className="text-blue-500 hover:text-white hover:bg-blue-500 p-1.5 rounded-lg transition-colors"><Edit size={16} /></button>
                                        <button onClick={(e) => handleDelete(e, note.id)} className="text-red-500 hover:text-white hover:bg-red-500 p-1.5 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 dark:text-gray-500">
                        <FileText className="w-12 h-12 mb-2 opacity-50" />
                        <p className="text-sm">No notes posted yet.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

const SubjectIcon = ({ subject }: { subject: Subject }) => {
    switch (subject) {
        case Subject.History: return <History className="h-6 w-6 text-orange-500" />;
        case Subject.Geography: return <Globe className="h-6 w-6 text-green-500" />;
        case Subject.Mathematics: return <Calculator className="h-6 w-6 text-blue-500" />;
        case Subject.Science: return <Microscope className="h-6 w-6 text-purple-500" />;
        case Subject.ICT: return <Binary className="h-6 w-6 text-indigo-500" />;
        case Subject.English: return <BookOpen className="h-6 w-6 text-red-500" />;
        default: return <Book className="h-6 w-6 text-gray-500" />;
    }
};

export default UploadNotes;