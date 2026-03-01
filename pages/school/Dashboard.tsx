import React, { useState, useEffect } from 'react';
import { Users, Briefcase, Book, CalendarCheck } from 'lucide-react';
import { getStudents, getTeachers, getSchoolClasses, getPendingUsers } from '../../data';
import { useAuth } from '../../contexts/AuthContext';

const SchoolDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({ 
        students: 0, 
        teachers: 0, 
        classes: 0,
        pending: 0,
        attendance: "N/A"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchData = async () => {
            try {
                // Fetch data scoped to the current school admin's ID
                const [students, teachers, classes] = await Promise.all([
                    getStudents(user.id),
                    getTeachers(user.id),
                    getSchoolClasses(), // This is mock for now, but would also need scoping
                ]);
                setStats(prev => ({ 
                    ...prev, 
                    students: students.length, 
                    teachers: teachers.length, 
                    classes: classes.length, 
                    attendance: 'N/A' 
                }));
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    return (
        <div className="space-y-12">
            <h1 className="text-5xl font-poppins font-bold text-white tracking-tight">{user?.schoolName || 'School Dashboard'}</h1>

            {loading ? <div className="text-center p-10 text-gray-500">Loading metrics...</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard title="Total Students" value={String(stats.students)} icon={<Users size={32} />} color="primary" />
                  <StatCard title="Total Teachers" value={String(stats.teachers)} icon={<Briefcase size={32} />} color="highlight" />
                  <StatCard title="Total Classes" value={String(stats.classes)} icon={<Book size={32} />} color="purple-500" />
                  <StatCard title="Attendance" value={stats.attendance} icon={<CalendarCheck size={32} />} color="green-500" />
              </div>
            )}
        </div>
    );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <div className={`bg-bg-card p-6 rounded-card border border-border-main shadow-lg flex items-start justify-between group hover:border-${color}/50 transition-all`}>
      <div>
        <p className={`text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-3`}>{title}</p>
        <p className="text-5xl font-bold font-poppins text-white">{value}</p>
      </div>
      <div className={`p-4 rounded-2xl bg-${color}/10 text-${color}`}>
        {icon}
      </div>
    </div>
);

export default SchoolDashboard;