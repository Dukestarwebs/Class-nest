import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { getSchoolAdmins, removeUser } from '../../data';
import { Building, Trash2, Search, Mail } from 'lucide-react';

const ManageSchools: React.FC = () => {
    const [schools, setSchools] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSchools = async () => {
        setLoading(true);
        try {
            const schoolAdmins = await getSchoolAdmins();
            setSchools(schoolAdmins);
        } catch (error) {
            console.error("Failed to fetch schools", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSchools();
    }, []);

    const handleDelete = async (user: User) => {
        if (!window.confirm(`Are you sure you want to delete the school "${user.schoolName}" and its administrator account? This action is permanent.`)) return;
        
        // This will only delete the admin user. Associated students/teachers will be orphaned.
        // A more robust solution would involve a backend function to cascade delete.
        await removeUser(user.id);
        fetchSchools();
    };

    const filteredSchools = schools.filter(school =>
        (school.schoolName && school.schoolName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">Manage Schools</h1>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search by school, admin, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm px-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">School Name</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Administrator</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Contact Email</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center p-8 text-gray-500">Loading schools...</td></tr>
                            ) : filteredSchools.length === 0 ? (
                                <tr><td colSpan={5} className="text-center p-8 text-gray-500">No schools found.</td></tr>
                            ) : filteredSchools.map(school => (
                                <tr key={school.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 font-medium text-text-primary dark:text-white flex items-center">
                                        <Building size={16} className="mr-3 text-gray-400"/>
                                        {school.schoolName || 'Unnamed School'}
                                    </td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">{school.name}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300 flex items-center">
                                         <Mail size={14} className="mr-2 text-gray-400"/>
                                        {school.email}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${school.isApproved ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                            {school.isApproved ? 'Active' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <button onClick={() => handleDelete(school)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full" title="Delete School">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageSchools;