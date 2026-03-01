
import React, { useState, useEffect } from 'react';
import { Note, Assignment } from '../../types';
import { getNotes, getAssignments, updateNote, updateAssignment, deleteNote, deleteAssignment } from '../../data';
import { Archive as ArchiveIcon, RefreshCcw, Trash2, FileText, ClipboardList } from 'lucide-react';

const Archive: React.FC = () => {
    const [archivedNotes, setArchivedNotes] = useState<Note[]>([]);
    const [archivedAssignments, setArchivedAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'notes' | 'assignments'>('notes');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [notesList, assignmentsList] = await Promise.all([getNotes(), getAssignments()]);
            setArchivedNotes(notesList.filter(n => n.isArchived));
            setArchivedAssignments(assignmentsList.filter(a => a.isArchived));
        } catch (e) {
            console.error("Error fetching archive", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleUnarchiveNote = async (id: string) => {
        // Optimistic update
        setArchivedNotes(prev => prev.filter(n => n.id !== id));
        try {
            await updateNote(id, { isArchived: false });
        } catch (error) {
            console.error("Error unarchiving note", error);
            fetchData(); // Revert on error
        }
    };

    const handleDeleteNote = async (id: string) => {
        // Optimistic update
        setArchivedNotes(prev => prev.filter(n => n.id !== id));
        try {
            await deleteNote(id);
        } catch (error) {
            console.error("Error deleting note permanently", error);
            fetchData(); // Revert on error
        }
    };

    const handleUnarchiveAssignment = async (id: string) => {
        // Optimistic update
        setArchivedAssignments(prev => prev.filter(a => a.id !== id));
        try {
            await updateAssignment(id, { isArchived: false });
        } catch (error) {
            console.error("Error unarchiving assignment", error);
            fetchData(); // Revert on error
        }
    };

    const handleDeleteAssignment = async (id: string) => {
        // Optimistic update
        setArchivedAssignments(prev => prev.filter(a => a.id !== id));
        try {
            await deleteAssignment(id);
        } catch (error) {
            console.error("Error deleting assignment permanently", error);
            fetchData(); // Revert on error
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white flex items-center">
                <ArchiveIcon className="mr-3" /> Archive
            </h1>

            <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-md flex space-x-2 w-full md:w-1/2">
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 py-2 rounded-lg font-bold transition-colors ${activeTab === 'notes' ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                    Notes ({archivedNotes.length})
                </button>
                <button
                    onClick={() => setActiveTab('assignments')}
                    className={`flex-1 py-2 rounded-lg font-bold transition-colors ${activeTab === 'assignments' ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                    Assignments ({archivedAssignments.length})
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {activeTab === 'notes' && (
                        archivedNotes.length > 0 ? archivedNotes.map(note => (
                            <div key={note.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg dark:text-white">{note.title}</h3>
                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">{note.subject}</span>
                                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">{note.classLevel}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Archived on {new Date().toLocaleDateString() /* Simulate archive date */}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleUnarchiveNote(note.id)} 
                                        className="flex items-center px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 rounded-lg transition-colors font-medium"
                                    >
                                        <RefreshCcw size={16} className="mr-2" /> Restore
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteNote(note.id)} 
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete Permanently"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 text-gray-400">
                                <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p>No archived notes.</p>
                            </div>
                        )
                    )}

                    {activeTab === 'assignments' && (
                        archivedAssignments.length > 0 ? archivedAssignments.map(assign => (
                            <div key={assign.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                <div className="flex-1 mr-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-lg dark:text-white line-clamp-1">{assign.content.substring(0, 50)}...</h3>
                                        <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded border border-gray-200 dark:border-gray-600">{assign.subject}</span>
                                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">{assign.classLevel}</span>
                                    </div>
                                    <p className="text-sm text-gray-500">Originally due: {new Date(assign.dueDate).toLocaleDateString()}</p>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button 
                                        onClick={() => handleUnarchiveAssignment(assign.id)} 
                                        className="flex items-center px-4 py-2 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 rounded-lg transition-colors font-medium"
                                    >
                                        <RefreshCcw size={16} className="mr-2" /> Restore
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteAssignment(assign.id)} 
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete Permanently"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 text-gray-400">
                                <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p>No archived assignments.</p>
                            </div>
                        )
                    )}
                </div>
            )}
        </div>
    );
};

export default Archive;
