import React, { useState, useEffect } from 'react';
import { User } from '../../../types';
import { getTeachers } from '../../../data';
import { useAuth } from '../../../contexts/AuthContext';
import { Briefcase, Mail, Phone, BookOpen } from 'lucide-react';

const SchoolTeachers: React.FC = () => {
    const { user } = useAuth();
    const [teachers, setTeachers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const data = await getTeachers(user.id);
                setTeachers(data);
            } catch (error) {
                console.error("Failed to fetch teachers", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    return (
        <div className="space-y-8">
            <h1 className="text-5xl font-poppins font-bold text-white tracking-tight">Teachers</h1>
            
            {loading ? <div className="text-center p-10 text-gray-500">Loading teacher directory...</div> : (
                 teachers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teachers.map(teacher => (
                            <div key={teacher.id} className="bg-bg-card p-6 rounded-card border border-border-main hover:border-primary/50 transition-all group">
                                <div className="flex items-center space-x-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-bg-main flex items-center justify-center overflow-hidden border-2 border-border-main">
                                        {teacher.avatarUrl ? (
                                            <img src={teacher.avatarUrl} alt={teacher.name} className="w-full h-full object-cover"/>
                                        ) : (
                                            <Briefcase size={32} className="text-primary"/>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white font-poppins">{teacher.name}</h3>
                                        <p className="text-sm text-gray-500">@{teacher.username}</p>
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <p className="flex items-center text-gray-400"><Mail size={14} className="mr-3 text-primary/50"/> {teacher.email}</p>
                                    <p className="flex items-center text-gray-400"><Phone size={14} className="mr-3 text-primary/50"/> {teacher.phone_number || 'Not provided'}</p>
                                </div>
                                <div className="mt-6 pt-6 border-t border-border-main">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Assigned Subjects</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {teacher.assignedSubjects?.map(subject => (
                                            <span key={subject} className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{subject}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                 ) : (
                    <div className="text-center py-20 bg-bg-card rounded-card border border-dashed border-border-main">
                        <Briefcase size={64} className="mx-auto text-gray-700 mb-6" />
                        <p className="text-gray-400 text-xl font-poppins font-bold">No teachers found for your school.</p>
                        <p className="text-gray-600 text-sm mt-2">You can invite teachers or add them manually.</p>
                    </div>
                 )
            )}
        </div>
    );
};

export default SchoolTeachers;