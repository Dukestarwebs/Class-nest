
import React, { useState, useEffect } from 'react';
import { BookOpen, Megaphone, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center space-x-4 transition-transform transform hover:-translate-y-1">
    <div className={`p-4 rounded-full ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-lg font-medium">{title}</p>
      <p className="text-3xl font-bold font-poppins text-text-primary">{value}</p>
    </div>
  </div>
);


const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState({ students: 0, notes: 0, announcements: 0 });
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        // Simulating fetching data from local storage
        const users = JSON.parse(localStorage.getItem('classNestUsers') || '[]').length;
        const notes = JSON.parse(localStorage.getItem('classNestNotes') || '[]');
        const announcements = JSON.parse(localStorage.getItem('classNestAnnouncements') || '[]').length;
        
        const historyNotes = notes.filter((n: any) => n.subject === 'History').length;
        const geographyNotes = notes.filter((n: any) => n.subject === 'Geography').length;

        setStats({ students: users, notes: notes.length, announcements });
        
        setChartData([
            { name: 'Students', count: users, fill: '#3A86FF' },
            { name: 'History Notes', count: historyNotes, fill: '#FFC300' },
            { name: 'Geography Notes', count: geographyNotes, fill: '#4CAF50' },
            { name: 'Announcements', count: announcements, fill: '#9C27B0' },
        ]);
    }, []);

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-poppins font-bold text-text-primary">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Total Students" value={stats.students} icon={<Users className="h-8 w-8 text-white" />} color="bg-blue-500" />
                <StatCard title="Total Notes" value={stats.notes} icon={<BookOpen className="h-8 w-8 text-white" />} color="bg-green-500" />
                <StatCard title="Announcements" value={stats.announcements} icon={<Megaphone className="h-8 w-8 text-white" />} color="bg-yellow-500" />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md mt-8">
                <h2 className="text-2xl font-poppins font-semibold text-text-primary mb-4">Content Overview</h2>
                <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 5, right: 30, left: 20, bottom: 5,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false}/>
                            <Tooltip wrapperClassName="rounded-lg shadow-lg" />
                            <Legend />
                            <Bar dataKey="count" name="Total Count" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
