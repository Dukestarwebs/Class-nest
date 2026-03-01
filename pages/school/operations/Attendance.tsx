import React from 'react';
import { CalendarCheck } from 'lucide-react';

const SchoolAttendance: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full rounded-card bg-bg-card border-2 border-dashed border-border-main p-12 text-center">
            <div className="p-5 bg-primary/10 rounded-2xl mb-6">
                <CalendarCheck size={48} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-poppins text-white mb-2">Attendance Management</h1>
            <p className="text-lg text-gray-400 max-w-md">
                This feature is currently under development. Advanced tools for tracking student attendance will be available here soon.
            </p>
        </div>
    );
};

export default SchoolAttendance;