
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, AlertTriangle, Lightbulb, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { addFeedback } from '../../data';

const HelpPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [type, setType] = useState<'feature' | 'challenge' | 'other'>('feature');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const getErrorMessage = (err: any) => {
        if (!err) return 'Unknown error';
        if (typeof err === 'string') return err;
        if (err instanceof Error) return err.message;
        
        let messageString = 'An unknown error occurred.';

        if (typeof err === 'object') {
            if (err.message) {
                messageString = typeof err.message === 'string' ? err.message : JSON.stringify(err.message);
            } else {
                try {
                    messageString = JSON.stringify(err);
                } catch {
                    messageString = 'An error occurred that could not be processed.';
                }
            }
        }

        // Provide hint for RLS errors
        if (messageString.includes('row-level security') || messageString.includes('permission denied')) {
            return `Database Permission Error: ${messageString}. (Hint: Run the "Allow public insert" SQL script)`;
        }

        return messageString;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        
        setLoading(true);
        setError('');

        try {
            await addFeedback({
                studentId: user.id,
                studentName: user.name,
                type,
                subject,
                message,
                date: new Date().toISOString()
            });
            setSuccess(true);
            setSubject('');
            setMessage('');
            setType('feature');
        } catch (e: any) {
            console.error(e);
            setError(getErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-secondary dark:bg-gray-900 transition-colors duration-200">
             <header className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 z-10 px-4 py-3">
                <div className="container mx-auto max-w-2xl flex items-center justify-between">
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

            <main className="container mx-auto max-w-2xl px-4 py-8">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-poppins font-bold text-text-primary dark:text-white mb-2">Help & Feedback</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Have a feature idea? Facing a challenge? Let us know!
                    </p>
                </div>

                {success ? (
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center border border-green-100 dark:border-green-900/30">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Message Sent!</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Thank you for your feedback. We appreciate your input and will review it shortly.
                        </p>
                        <button 
                            onClick={() => setSuccess(false)}
                            className="text-primary hover:underline font-medium"
                        >
                            Send another message
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                         {error && (
                            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-6 text-sm break-words border-l-4 border-red-500">
                                <strong>Error:</strong> {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">I want to...</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setType('feature')}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${type === 'feature' ? 'border-primary bg-blue-50 dark:bg-blue-900/20 text-primary' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                    >
                                        <Lightbulb size={24} className="mb-2" />
                                        <span className="text-sm font-bold">Request Feature</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setType('challenge')}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${type === 'challenge' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                    >
                                        <AlertTriangle size={24} className="mb-2" />
                                        <span className="text-sm font-bold">Report Issue</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setType('other')}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${type === 'other' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-500' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}
                                    >
                                        <MessageSquare size={24} className="mb-2" />
                                        <span className="text-sm font-bold">Other</span>
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                                <input 
                                    type="text" 
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    placeholder={type === 'feature' ? "e.g. Add Dark Mode" : "e.g. Cannot upload assignment"}
                                    className="w-full px-4 py-3 bg-secondary dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-text-primary dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea 
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Please describe your thoughts in detail..."
                                    rows={5}
                                    className="w-full px-4 py-3 bg-secondary dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-text-primary dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors resize-none"
                                    required
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-blue-600 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : <><Send size={18} className="mr-2" /> Submit Feedback</>}
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default HelpPage;
