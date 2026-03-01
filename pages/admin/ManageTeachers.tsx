
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { getUsers, removeUser, approveUser } from '../../data';
import { Trash2, UserCheck, Search } from 'lucide-react';

const ManageTeachers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const allUsers = await getUsers();
            setUsers(allUsers.filter(u => u.role === 'teacher'));
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this teacher permanently?")) return;
        await removeUser(id);
        fetchUsers();
    };

    const handleApprove = async (id: string) => {
        await approveUser(id);
        fetchUsers();
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">Manage Teachers</h1>
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search teachers..."
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
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Name</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Email</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Subjects</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="p-4 font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={5} className="text-center p-8 text-gray-500">Loading teachers...</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={5} className="text-center p-8 text-gray-500">No teachers found.</td></tr>
                            ) : filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-4 font-medium text-text-primary dark:text-white">{user.name}</td>
                                    <td className="p-4 text-gray-600 dark:text-gray-300">{user.email}</td>
                                    <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{user.assignedSubjects?.join(', ')}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.isApproved ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'}`}>
                                            {user.isApproved ? 'Approved' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        {!user.isApproved && (
                                            <button onClick={() => handleApprove(user.id)} className="p-2 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20 rounded-full" title="Approve Teacher"><UserCheck size={18} /></button>
                                        )}
                                        <button onClick={() => handleDelete(user.id)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full" title="Delete Teacher"><Trash2 size={18} /></button>
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

export default ManageTeachers;
