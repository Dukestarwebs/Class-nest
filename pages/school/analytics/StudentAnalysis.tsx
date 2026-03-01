import React from 'react';
import { BarChart2 } from 'lucide-react';

const StudentAnalysis: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full rounded-card bg-bg-card border-2 border-dashed border-border-main p-12 text-center">
            <div className="p-5 bg-primary/10 rounded-2xl mb-6">
                <BarChart2 size={48} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold font-poppins text-white mb-2">Student Analysis</h1>
            <p className="text-lg text-gray-400 max-w-md">
                This feature is currently under development. Advanced analytics on student performance and engagement will be available here soon.
            </p>
        </div>
    );
};

export default StudentAnalysis;