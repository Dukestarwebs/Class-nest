import React, { useState, useEffect } from 'react';
import { User } from '../../../types';
import { getStudents } from '../../../data';
import { useAuth } from '../../../contexts/AuthContext';
import { Users, User as UserIcon, GraduationCap, Search } from 'lucide-react';

const SchoolStudents: React.FC = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!user) return;
        const fetchData = async () => {
            try {
                const data = await getStudents(user.id);
                setStudents(data);
            } catch (error) {
                console.error("Failed to fetch students", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const filteredStudents = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-5xl font-poppins font-bold text-white tracking-tight">Students</h1>
                <div className="relative w-full md:w-72">
                    <input 
                        type="text"
                        placeholder="Search by name or username..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-bg-card border border-border-main rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary text-sm"
                    />
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                </div>
            </div>

            <div className="bg-bg-card rounded-2xl border border-border-main overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-bg-main/50">
                            <tr>
                                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Student Name</th>
                                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Class</th>
                                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Email</th>
                                <th className="p-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Subscription</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-main">
                        {loading ? (
                            <tr><td colSpan={4} className="text-center p-10 text-gray-500">Loading students...</td></tr>
                        ) : filteredStudents.length > 0 ? (
                            filteredStudents.map(student => {
                                const expiry = student.subscription_expiry ? new Date(student.subscription_expiry) : new Date(0);
                                const isActive = expiry > new Date();
                                return (
                                    <tr key={student.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-bg-main flex items-center justify-center overflow-hidden border-2 border-border-main">
                                                {student.avatarUrl ? <img src={student.avatarUrl} alt={student.name} className="w-full h-full object-cover"/> : <UserIcon size={20} className="text-gray-500"/>}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white">{student.name}</p>
                                                <p className="text-xs text-gray-500">@{student.username}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{student.classLevel}</span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-400">{student.email}</td>
                                        <td className="p-4">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${isActive ? 'bg-green-500/10 text-green-400' : 'bg-danger/10 text-danger'}`}>
                                                {isActive ? 'Active' : 'Expired'}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                           <tr><td colSpan={4} className="text-center p-20 text-gray-500">
                                <Users size={48} className="mx-auto mb-4" />
                                <h3 className="text-lg font-bold">No students found.</h3>
                                <p className="text-sm">This school has not registered any students yet.</p>
                           </td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SchoolStudents;