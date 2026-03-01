import React from 'react';
import { DollarSign } from 'lucide-react';

const SchoolRevenue: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <DollarSign size={64} className="mb-4 text-primary/30" />
            <h1 className="text-3xl font-bold font-poppins text-white mb-2">Revenue Management</h1>
            <p className="text-lg text-gray-400">This feature is coming soon.</p>
        </div>
    );
};

export default SchoolRevenue;