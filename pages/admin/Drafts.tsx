import { Draft } from '../../types';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDrafts, deleteDraft } from '../../data';
import { FileText, Trash2, Edit3, Clock, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';

const Drafts: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [drafts, setDrafts] = useState<Draft[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDrafts = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const data = await getDrafts(user.id);
            setDrafts(data);
        } catch (err) {
            console.error("Failed to fetch drafts", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDrafts();
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this draft permanently?")) return;
        setDrafts(prev => prev.filter(d => d.id !== id));
        try {
            await deleteDraft(id);
        } catch (err) {
            console.error("Delete failed", err);
            fetchDrafts();
        }
    };

    const handleResume = (draft: Draft) => {
        const path = user?.role === 'teacher' ? '/teacher/notes' : '/admin/notes';
        navigate(path, { state: { resumeDraft: draft } });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white flex items-center">
                    <Clock className="mr-3 text-primary" /> Note Drafts
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    These notes were saved automatically while you were typing. Resume them to finish and post.
                </p>
            </div>

            {drafts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {drafts.map(draft => (
                        <div key={draft.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col group hover:shadow-xl transition-all">
                            <div className="p-6 flex-grow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-primary/10 p-2 rounded-lg text-primary group-hover:scale-110 transition-transform">
                                        <FileText size={24} />
                                    </div>
                                    <span className="text-xs font-bold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-600 dark:text-gray-400 uppercase">
                                        {draft.subject}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold font-poppins text-gray-800 dark:text-white mb-2 line-clamp-1">{draft.title}</h3>
                                <div className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-3 bg-secondary/50 dark:bg-gray-900/50 p-3 rounded-lg min-h-[5rem]">
                                    <div dangerouslySetInnerHTML={{ __html: draft.content.substring(0, 200) }} className="view-note-preview" />
                                </div>
                                <div className="flex items-center text-xs text-gray-400">
                                    <Clock size={12} className="mr-1" />
                                    Last edited: {new Date(draft.updated_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                </div>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700 flex gap-2">
                                <button 
                                    onClick={() => handleResume(draft)}
                                    className="flex-1 bg-primary text-white font-bold py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center text-sm shadow-md"
                                >
                                    <Edit3 size={16} className="mr-2" /> Resume
                                </button>
                                <button 
                                    onClick={() => handleDelete(draft.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                    title="Delete Draft"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center shadow-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="bg-gray-100 dark:bg-gray-700 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen size={40} className="text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-poppins font-bold text-gray-800 dark:text-white mb-2">No drafts found</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                        Incomplete notes will automatically appear here if you lose power or leave the page.
                    </p>
                    <button 
                        onClick={() => navigate(user?.role === 'teacher' ? '/teacher/notes' : '/admin/notes')}
                        className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-600 transition-all flex items-center justify-center mx-auto shadow-lg"
                    >
                        Start New Note <ArrowRight size={18} className="ml-2" />
                    </button>
                </div>
            )}
            
            <style>{`
                .view-note-preview * { font-size: 12px !important; margin: 0 !important; padding: 0 !important; }
                .view-note-preview img { display: none !important; }
            `}</style>
        </div>
    );
};

export default Drafts;