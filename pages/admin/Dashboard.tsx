import React, { useState, useEffect } from 'react';
import { User, DollarSign, UserCheck, Briefcase, Book, ArrowRight } from 'lucide-react';
import { getStudents, getTeachers, getPendingUsers, getAllPayments } from '../../data';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ students: 0, teachers: 0, pending: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [students, teachers, pendingUsers, payments] = await Promise.all([
                    getStudents(), getTeachers(), getPendingUsers(), getAllPayments()
                ]);
                const monthlyRevenue = payments
                    .filter(p => p.status === 'completed' && new Date(p.date).getMonth() === new Date().getMonth())
                    .reduce((sum, p) => sum + p.amount, 0);

                setStats({
                    students: students.length,
                    teachers: teachers.length,
                    pending: pendingUsers.length,
                    revenue: monthlyRevenue
                });
            } catch (error) {
                console.error("Failed to load dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary"></div></div>;
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={stats.students} icon={<User size={28}/>} color="blue" path="/admin/students" />
                <StatCard title="Total Teachers" value={stats.teachers} icon={<Briefcase size={28}/>} color="purple" path="/admin/teachers"/>
                <StatCard title="Pending Approvals" value={stats.pending} icon={<UserCheck size={28}/>} color="yellow" path="/admin/pending"/>
                <StatCard title="Monthly Revenue (UGX)" value={stats.revenue.toLocaleString()} icon={<DollarSign size={28}/>} color="green" path="/admin/payments"/>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold mb-4 flex items-center"><Book size={20} className="mr-2 text-primary"/> Quick Links</h2>
                <div className="flex flex-wrap gap-4">
                    <button onClick={() => navigate('/admin/pending')} className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">Manage Approvals</button>
                    <button onClick={() => navigate('/admin/notes')} className="bg-gray-200 dark:bg-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Upload Notes</button>
                    <button onClick={() => navigate('/admin/announcements')} className="bg-gray-200 dark:bg-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Send Announcement</button>
                    <button onClick={() => navigate('/admin/settings')} className="bg-gray-200 dark:bg-gray-700 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">System Settings</button>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color, path }: { title: string, value: string | number, icon: React.ReactNode, color: string, path: string }) => {
    const navigate = useNavigate();
    return (
        <div className={`bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-${color}-500 group transition-all hover:shadow-lg hover:-translate-y-1`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{title}</p>
                    <p className="text-3xl font-bold text-text-primary dark:text-white mt-2">{value}</p>
                </div>
                <div className={`text-${color}-500`}>{icon}</div>
            </div>
            <button onClick={() => navigate(path)} className="flex items-center text-xs mt-4 text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                View More <ArrowRight size={14} className="ml-1" />
            </button>
        </div>
    );
};

export default AdminDashboard;