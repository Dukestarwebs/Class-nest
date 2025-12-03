
import React, { useState, useEffect } from 'react';
import { Feedback } from '../../types';
import { getFeedback, deleteFeedback } from '../../data';
import { Trash2, MessageSquare, AlertTriangle, Lightbulb, User, RefreshCw, AlertCircle } from 'lucide-react';

const FeedbackList: React.FC = () => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'feature' | 'challenge' | 'other'>('all');

    // Helper to safely extract error message
    const getErrorMessage = (err: any) => {
        if (!err) return 'Unknown error';
        if (typeof err === 'string') return err;
        if (err instanceof Error) return err.message;
        
        if (typeof err === 'object') {
            // Priority checks for common database/API error structures
            if ('message' in err) {
                return typeof err.message === 'object' ? JSON.stringify(err.message) : String(err.message);
            }
            if ('error_description' in err) {
                return typeof err.error_description === 'object' ? JSON.stringify(err.error_description) : String(err.error_description);
            }
            if ('details' in err) {
                return typeof err.details === 'object' ? JSON.stringify(err.details) : String(err.details);
            }
            if ('hint' in err) return String(err.hint);
        }
        
        try {
            const json = JSON.stringify(err);
            if (json === '{}') return 'An unexpected error occurred.';
            return json;
        } catch {
            return 'Failed to fetch feedback.';
        }
    };

    const fetchFeedback = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getFeedback();
            // Sort by date descending
            const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setFeedbacks(sorted);
        } catch (err) {
            console.error("Failed to fetch feedback", err);
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const handleDelete = async (id: string) => {
        if(!window.confirm("Delete this feedback?")) return;
        
        // Optimistic update
        setFeedbacks(prev => prev.filter(f => f.id !== id));
        
        try {
            await deleteFeedback(id);
        } catch (err) {
            console.error("Failed to delete feedback", err);
            alert("Failed to delete feedback: " + getErrorMessage(err));
            fetchFeedback();
        }
    };

    const filteredFeedbacks = filter === 'all' 
        ? feedbacks 
        : feedbacks.filter(f => f.type === filter);

    const getIcon = (type: string) => {
        switch(type) {
            case 'feature': return <Lightbulb className="text-primary" size={24} />;
            case 'challenge': return <AlertTriangle className="text-red-500" size={24} />;
            default: return <MessageSquare className="text-purple-500" size={24} />;
        }
    };

    const getBadgeColor = (type: string) => {
        switch(type) {
            case 'feature': return 'bg-blue-100 text-primary dark:bg-blue-900/30 dark:text-blue-300';
            case 'challenge': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300';
            default: return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">Student Feedback</h1>
                
                <div className="flex bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm">
                    {(['all', 'feature', 'challenge', 'other'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                filter === f 
                                    ? 'bg-primary text-white shadow' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-sm flex flex-col gap-2 dark:bg-red-900/20 dark:text-red-300 dark:border-red-600">
                    <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <p className="font-bold">Error loading feedback</p>
                    </div>
                    <p className="text-sm">{error}</p>
                    <button 
                        onClick={fetchFeedback}
                        className="self-start mt-2 px-3 py-1 bg-red-200 hover:bg-red-300 text-red-800 rounded text-sm font-medium transition-colors dark:bg-red-800 dark:text-white dark:hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : filteredFeedbacks.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {filteredFeedbacks.map(item => (
                        <div key={item.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 transition-all hover:shadow-lg">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-full">
                                        {getIcon(item.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">{item.subject}</h3>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${getBadgeColor(item.type)}`}>
                                                {item.type}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                            <User size={14} className="mr-1"/>
                                            <span className="font-medium mr-3">{item.studentName}</span>
                                            <span>{new Date(item.date).toLocaleDateString()} at {new Date(item.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDelete(item.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                    title="Delete Feedback"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                            <div className="bg-secondary dark:bg-gray-900/50 p-4 rounded-lg">
                                <p className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">{item.message}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : !error && (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-500 dark:text-gray-400 text-lg">No feedback found.</p>
                </div>
            )}
        </div>
    );
};

export default FeedbackList;
