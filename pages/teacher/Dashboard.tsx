
import React, { useState, useEffect } from 'react';
import { BookOpen, ClipboardList } from 'lucide-react';
import { getNotes, getAssignments } from '../../data';
import { useAuth } from '../../contexts/AuthContext';
import { Note, Assignment } from '../../types';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className={`${color} p-6 rounded-xl shadow-lg flex items-center space-x-4 transition-transform transform hover:-translate-y-1 text-white h-32`}>
      <div className="p-4 rounded-full bg-white/25">
        {icon}
      </div>
      <div>
        <p className="text-lg font-medium opacity-90">{title}</p>
        <p className="text-4xl font-bold font-poppins">{value}</p>
      </div>
    </div>
  );

const TeacherDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ notes: 0, assignments: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Fetch only content created by this specific teacher.
                const [myNotes, myAssignments]: [Note[], Assignment[]] = await Promise.all([
                    getNotes(user.id),
                    getAssignments(user.id)
                ]);

                setStats({
                    notes: myNotes.length,
                    assignments: myAssignments.length
                });
                
            } catch (err) {
                console.error("Error fetching teacher dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">Teacher Dashboard</h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Welcome back, {user?.name}. You are assigned to: <span className="font-semibold text-primary">{user?.assignedClasses?.join(', ') || 'No classes'}</span>
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                    Subjects: <span className="font-semibold text-primary">{user?.assignedSubjects?.join(', ') || 'No subjects'}</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <StatCard title="My Notes" value={stats.notes} icon={<BookOpen className="h-8 w-8 text-white" />} color="bg-green-500" />
                <StatCard title="My Assignments" value={stats.assignments} icon={<ClipboardList className="h-8 w-8 text-white" />} color="bg-orange-500" />
            </div>
        </div>
    );
};

export default TeacherDashboard;
