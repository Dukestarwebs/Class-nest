
import React, { useState, useEffect } from 'react';
import { Note, Subject } from '../../types';
import { Upload, FileText, Trash2, History, Landmark } from 'lucide-react';

const UploadNotes: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState<Subject>(Subject.History);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchNotes = () => {
    const storedNotes: Note[] = JSON.parse(localStorage.getItem('classNestNotes') || '[]');
    setNotes(storedNotes.sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
  };
  
  useEffect(() => {
    fetchNotes();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if(e.target.files[0].type !== 'application/pdf') {
          setError('Only PDF files are accepted.');
          setFile(null);
          return;
      }
      setError('');
      setFile(e.target.files[0]);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !file) {
      setError('All fields including a PDF file are required.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');

    try {
        const fileData = await fileToBase64(file);
        const newNote: Note = {
            id: `note-${Date.now()}`,
            title,
            description,
            subject,
            fileData,
            fileName: file.name,
            uploadDate: new Date().toISOString()
        };

        const currentNotes: Note[] = JSON.parse(localStorage.getItem('classNestNotes') || '[]');
        currentNotes.push(newNote);
        localStorage.setItem('classNestNotes', JSON.stringify(currentNotes));

        setTitle('');
        setDescription('');
        setFile(null);
        (document.getElementById('file-upload') as HTMLInputElement).value = '';
        
        setSuccess('Note uploaded successfully!');
        setTimeout(() => setSuccess(''), 3000);

        fetchNotes();
    } catch (err) {
        setError('Failed to upload note. Please try again.');
    } finally {
        setLoading(false);
    }
  };
  
  const handleDelete = (noteId: string) => {
      if(window.confirm('Are you sure you want to delete this note?')) {
        let currentNotes: Note[] = JSON.parse(localStorage.getItem('classNestNotes') || '[]');
        currentNotes = currentNotes.filter(n => n.id !== noteId);
        localStorage.setItem('classNestNotes', JSON.stringify(currentNotes));
        fetchNotes();
      }
  };

  const SubjectIcon = ({ subject }: { subject: Subject }) => {
    if (subject === Subject.History) return <History className="h-6 w-6 text-orange-500" />;
    return <Landmark className="h-6 w-6 text-green-500" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
            <h1 className="text-4xl font-poppins font-bold text-text-primary">Upload Notes</h1>
            <div className="bg-white p-6 rounded-xl shadow-md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}
                    {success && <p className="text-green-500 bg-green-100 p-3 rounded-lg">{success}</p>}
                    <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
                    <textarea placeholder="Short description" value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-lg h-24" required />
                    <select value={subject} onChange={e => setSubject(e.target.value as Subject)} className="w-full px-4 py-2 border rounded-lg bg-white" required>
                        <option value={Subject.History}>History</option>
                        <option value={Subject.Geography}>Geography</option>
                    </select>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="mx-auto h-12 w-12 text-gray-400"/>
                            <p className="mt-2 text-sm text-gray-600">
                                {file ? file.name : "Click to upload a PDF"}
                            </p>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf"/>
                        </label>
                    </div>
                    <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-primary/50">
                        {loading ? 'Uploading...' : 'Upload Note'}
                    </button>
                </form>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
            <h2 className="text-3xl font-poppins font-bold text-text-primary">Uploaded Notes</h2>
             <div className="bg-white p-6 rounded-xl shadow-md max-h-[75vh] overflow-y-auto">
                {notes.length > 0 ? (
                    <div className="space-y-4">
                        {notes.map(note => (
                            <div key={note.id} className="p-4 border rounded-lg flex items-center justify-between hover:bg-secondary transition-colors">
                                <div className="flex items-center space-x-4">
                                    <SubjectIcon subject={note.subject} />
                                    <div>
                                        <p className="font-bold font-poppins">{note.title}</p>
                                        <p className="text-sm text-gray-500">{note.description}</p>
                                        <p className="text-xs text-gray-400">Uploaded on {new Date(note.uploadDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <a href={note.fileData} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-blue-600 p-2 rounded-full hover:bg-primary/10">
                                        <FileText size={20} />
                                    </a>
                                    <button onClick={() => handleDelete(note.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100">
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-8">No notes have been uploaded yet.</p>
                )}
            </div>
        </div>
    </div>
  );
};

export default UploadNotes;
