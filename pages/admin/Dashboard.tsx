
import React, { useState, useEffect } from 'react';
import { BookOpen, Megaphone, Users, HelpCircle, ClipboardList, AlertCircle } from 'lucide-react';
import { getStudents, getNotes, getAnnouncements, getQuestions, getAssignments } from '../../data';

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

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ students: 0, notes: 0, announcements: 0, unansweredQuestions: 0, assignments: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Helper to safely extract error message
    const getErrorMessage = (err: any) => {
        if (!err) return 'Unknown error';
        if (typeof err === 'string') return err;
        if (err instanceof Error) return err.message;
        
        if (typeof err === 'object') {
            if ('message' in err) {
                return typeof err.message === 'object' ? JSON.stringify(err.message) : String(err.message);
            }
            if ('error_description' in err) {
                return typeof err.error_description === 'object' ? JSON.stringify(err.error_description) : String(err.error_description);
            }
            if ('details' in err) {
                return typeof err.details === 'object' ? JSON.stringify(err.details) : String(err.details);
            }
        }
        
        try {
            const json = JSON.stringify(err);
            if (json !== '{}') return json;
        } catch {
            // ignore
        }
        
        return 'Failed to load dashboard data.';
    };

    useEffect(() => {
        const fetchData = async () => {
            setError('');
            try {
                const [students, notesList, announcements, questions, assignments] = await Promise.all([
                    getStudents(),
                    getNotes(),
                    getAnnouncements(),
                    getQuestions(),
                    getAssignments()
                ]);

                const unansweredQuestions = questions.filter(q => !q.isAnswered);

                setStats({
                    students: students.length,
                    notes: notesList.length,
                    announcements: announcements.length,
                    unansweredQuestions: unansweredQuestions.length,
                    assignments: assignments.length
                });
                
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError(getErrorMessage(err));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">Admin Dashboard</h1>
            
            {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-sm flex items-start dark:bg-red-900/20 dark:text-red-300 dark:border-red-600">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Error loading dashboard</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Grid updated to max 3 columns for rectangular look on wide screens */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Students" value={stats.students} icon={<Users className="h-8 w-8 text-white" />} color="bg-blue-500" />
                <StatCard title="Total Notes" value={stats.notes} icon={<BookOpen className="h-8 w-8 text-white" />} color="bg-green-500" />
                <StatCard title="Assignments" value={stats.assignments} icon={<ClipboardList className="h-8 w-8 text-white" />} color="bg-orange-500" />
                <StatCard title="Announcements" value={stats.announcements} icon={<Megaphone className="h-8 w-8 text-white" />} color="bg-yellow-500" />
                <StatCard title="Unanswered" value={stats.unansweredQuestions} icon={<HelpCircle className="h-8 w-8 text-white" />} color="bg-purple-500" />
            </div>
        </div>
    );
};

export default AdminDashboard;
