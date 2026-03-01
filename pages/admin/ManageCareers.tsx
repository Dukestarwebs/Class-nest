
import React, { useState, useEffect } from 'react';
import { Job } from '../../types';
import { getJobs, addJob, deleteJob, updateJob } from '../../data';
import { Briefcase, Plus, Trash2, Edit, Save, X } from 'lucide-react';

const ManageCareers: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentId, setCurrentId] = useState<string | null>(null);

    // Form
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [requirements, setRequirements] = useState('');

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        const data = await getJobs();
        setJobs(data);
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setRequirements('');
        setIsEditing(false);
        setCurrentId(null);
    };

    const handleEdit = (job: Job) => {
        setIsEditing(true);
        setCurrentId(job.id);
        setTitle(job.title);
        setDescription(job.description);
        setRequirements(job.requirements);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;

        const jobData = {
            title,
            description,
            requirements,
            postedDate: new Date().toISOString()
        };

        if (isEditing && currentId) {
            await updateJob(currentId, jobData);
        } else {
            await addJob(jobData);
        }

        await loadJobs();
        resetForm();
    };

    const handleDelete = async (id: string) => {
        // No confirmation as requested
        await deleteJob(id);
        await loadJobs();
    };

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">Manage Careers</h1>
            
            {/* Form */}
            <div className={`p-6 rounded-xl shadow-md transition-all duration-200 ${isEditing ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-800'}`}>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-poppins font-semibold text-text-primary dark:text-white flex items-center">
                        {isEditing ? <Edit className="mr-2 text-primary" /> : <Plus className="mr-2 text-primary"/>} 
                        {isEditing ? 'Edit Career' : 'Add New Career'}
                    </h2>
                    {isEditing && (
                        <button onClick={resetForm} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            <X size={24} />
                        </button>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Job Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-text-primary dark:text-white" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-text-primary dark:text-white resize-none" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Requirements</label>
                        <textarea value={requirements} onChange={e => setRequirements(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-text-primary dark:text-white resize-none" />
                    </div>
                    <button type="submit" className="bg-primary text-white py-2.5 px-6 rounded-lg hover:bg-blue-600 transition-colors flex items-center font-bold">
                        <Save size={18} className="mr-2" /> {isEditing ? 'Update Job' : 'Post Job'}
                    </button>
                </form>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-4">
                {jobs.length > 0 ? jobs.map(job => (
                    <div key={job.id} className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 ${isEditing && currentId === job.id ? 'ring-2 ring-primary' : ''}`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                                    <Briefcase size={20} className="mr-2 text-gray-500" />
                                    {job.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Posted: {new Date(job.postedDate).toLocaleDateString()}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => handleEdit(job)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit size={18}/></button>
                                <button onClick={() => handleDelete(job.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={18}/></button>
                            </div>
                        </div>
                        <div className="mt-4">
                            <p className="font-semibold text-sm text-gray-500 dark:text-gray-400">Description:</p>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">{job.description}</p>
                            <p className="font-semibold text-sm text-gray-500 dark:text-gray-400">Requirements:</p>
                            <p className="text-gray-700 dark:text-gray-300">{job.requirements}</p>
                        </div>
                    </div>
                )) : (
                    <p className="text-center text-gray-500">No jobs posted.</p>
                )}
            </div>
        </div>
    );
};

export default ManageCareers;
