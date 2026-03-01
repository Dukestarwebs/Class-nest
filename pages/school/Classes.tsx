import React, { useState, useEffect } from 'react';
import { SchoolClass, User, ClassLevel } from '../../types';
import { getSchoolClasses, getTeachers } from '../../data';
import { Book, Users, Briefcase, Plus, Filter, Search, ChevronDown, Archive } from 'lucide-react';

const SchoolClasses: React.FC = () => {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [teachers, setTeachers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<{ grade: string, status: string, year: string }>({
        grade: 'all',
        status: 'active',
        year: 'all'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classData, teacherData] = await Promise.all([getSchoolClasses(), getTeachers()]);
                setClasses(classData);
                setTeachers(teacherData);
            } catch (error) {
                console.error("Failed to fetch class data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getTeacherName = (id?: string) => {
        return teachers.find(t => t.id === id)?.name || 'Unassigned';
    };

    const filteredClasses = classes.filter(c => {
        const gradeMatch = filter.grade === 'all' || c.gradeLevel === filter.grade;
        const statusMatch = filter.status === 'all' || (filter.status === 'active' && !c.isArchived) || (filter.status === 'archived' && c.isArchived);
        const yearMatch = filter.year === 'all' || c.academicYear === filter.year;
        return gradeMatch && statusMatch && yearMatch;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-5xl font-poppins font-bold text-white tracking-tight">Classes</h1>
                <button className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-dark transition-all flex items-center shadow-lg shadow-primary/20">
                    <Plus size={20} className="mr-2" /> Create New Class
                </button>
            </div>

            {/* Filters */}
            <div className="bg-bg-card p-4 rounded-xl border border-border-main flex flex-col md:flex-row items-center gap-4">
                <div className="flex items-center text-gray-400 font-bold text-sm uppercase tracking-wider w-full md:w-auto">
                    <Filter size={16} className="mr-2 text-primary"/>
                    Filters
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                    {/* Grade Level */}
                    <div className="relative">
                        <select onChange={e => setFilter(f => ({ ...f, grade: e.target.value }))} className="w-full bg-bg-main border border-border-main rounded-lg py-2 pl-4 pr-8 outline-none focus:ring-2 focus:ring-primary text-sm appearance-none">
                            <option value="all">All Grades</option>
                            {(['P6', 'P7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'] as ClassLevel[]).map(level => <option key={level} value={level}>{level}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
                    </div>
                    {/* Status */}
                     <div className="relative">
                        <select onChange={e => setFilter(f => ({ ...f, status: e.target.value }))} defaultValue="active" className="w-full bg-bg-main border border-border-main rounded-lg py-2 pl-4 pr-8 outline-none focus:ring-2 focus:ring-primary text-sm appearance-none">
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
                    </div>
                     {/* Year */}
                    <div className="relative">
                        <select onChange={e => setFilter(f => ({ ...f, year: e.target.value }))} className="w-full bg-bg-main border border-border-main rounded-lg py-2 pl-4 pr-8 outline-none focus:ring-2 focus:ring-primary text-sm appearance-none">
                            <option value="all">All Years</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"/>
                    </div>
                    {/* Search */}
                    <div className="relative col-span-2 md:col-span-1">
                        <input type="text" placeholder="Search classes..." className="w-full bg-bg-main border border-border-main rounded-lg py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-primary text-sm"/>
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
                    </div>
                </div>
            </div>

            {loading ? <div className="text-center p-10 text-gray-500">Loading classes...</div> : (
                filteredClasses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredClasses.map(cls => (
                            <div key={cls.id} className={`bg-bg-card p-8 rounded-card border-2 border-border-main hover:border-primary/50 cursor-pointer transition-all hover:shadow-2xl group ${cls.isArchived ? 'opacity-50' : ''}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit">{cls.gradeLevel}</p>
                                        <h3 className="text-2xl font-bold font-poppins text-white mt-2">{cls.name}</h3>
                                    </div>
                                    <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                        <Book size={24} />
                                    </div>
                                </div>
                                
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center text-gray-400">
                                        <Users size={16} className="mr-3"/>
                                        <span className="font-bold text-white mr-1">{cls.studentIds.length}</span> / {cls.capacity} Students
                                    </div>
                                    <div className="flex items-center text-gray-400">
                                        <Briefcase size={16} className="mr-3"/>
                                        Class Teacher: <span className="font-bold text-white ml-1">{getTeacherName(cls.classTeacherId)}</span>
                                    </div>
                                    {cls.isArchived && (
                                    <div className="flex items-center text-yellow-400 pt-2">
                                        <Archive size={16} className="mr-3"/>
                                        Archived ({cls.academicYear})
                                    </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full rounded-card bg-bg-card border-2 border-dashed border-border-main p-12 text-center">
                        <div className="p-5 bg-primary/10 rounded-2xl mb-6">
                            <Book size={48} className="text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold font-poppins text-white">No Classes Found</h2>
                        <p className="text-gray-400 mt-2">Create a new class to get started.</p>
                    </div>
                )
            )}
        </div>
    );
};

export default SchoolClasses;