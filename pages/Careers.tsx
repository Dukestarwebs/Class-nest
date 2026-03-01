import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, ArrowLeft, Briefcase, ChevronRight } from 'lucide-react';
import { getJobs } from '../data';
import { Job } from '../types';

const Careers: React.FC = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJobs = async () => {
            const data = await getJobs();
            setJobs(data);
            setLoading(false);
        };
        fetchJobs();
    }, []);

    const handleApply = (jobId: string) => {
        // Navigate to the unified registration page with the 'teacher' plan pre-selected.
        navigate('/register?plan=teacher', { state: { jobId } });
    };

    return (
        <div className="min-h-screen bg-secondary dark:bg-gray-900 transition-colors duration-200 font-roboto text-text-primary dark:text-gray-100 flex flex-col">
            <nav className="container mx-auto px-6 py-6 flex justify-between items-center z-10 relative">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                   <div className="bg-primary text-white p-2 rounded-lg">
                      <Book className="w-6 h-6" />
                   </div>
                  <span className="text-2xl font-poppins font-bold text-primary tracking-tight">Class Nest</span>
                </div>
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium"
                >
                    <ArrowLeft size={18} className="mr-2" /> Back to Home
                </button>
            </nav>

            <main className="container mx-auto px-6 py-12 flex-grow">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-poppins font-bold text-gray-900 dark:text-white mb-6">Join Our Team</h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Explore opportunities to make a difference in education. We are always looking for passionate individuals to join Class Nest.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center">
                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : jobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {jobs.map(job => (
                            <div key={job.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border-t-4 border-primary flex flex-col">
                                <div className="mb-4 bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center text-primary">
                                    <Briefcase size={24} />
                                </div>
                                <h3 className="text-2xl font-bold font-poppins mb-2">{job.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Posted: {new Date(job.postedDate).toLocaleDateString()}</p>
                                
                                <div className="flex-grow">
                                    <h4 className="font-bold text-sm uppercase text-gray-500 dark:text-gray-400 mb-2">Description</h4>
                                    <p className="text-gray-700 dark:text-gray-300 mb-4">{job.description}</p>
                                    
                                    <h4 className="font-bold text-sm uppercase text-gray-500 dark:text-gray-400 mb-2">Requirements</h4>
                                    <p className="text-gray-700 dark:text-gray-300 mb-6">{job.requirements}</p>
                                </div>

                                <button 
                                    onClick={() => handleApply(job.id)}
                                    className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-blue-600 transition-colors flex items-center justify-center"
                                >
                                    Apply Now <ChevronRight size={18} className="ml-2" />
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-xl">
                        <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">No Open Positions</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">Check back later for new opportunities.</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Careers;