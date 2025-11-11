
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { Trash2, UserPlus, X } from 'lucide-react';

const ManageStudents: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const fetchStudents = () => {
    const allUsers: User[] = JSON.parse(localStorage.getItem('classNestUsers') || '[]');
    setStudents(allUsers.filter(u => u.role === 'student'));
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if(!newStudent.name || !newStudent.email || !newStudent.password) {
        setError('All fields are required.');
        return;
    }

    const allUsers: User[] = JSON.parse(localStorage.getItem('classNestUsers') || '[]');
    if(allUsers.some(u => u.email === newStudent.email)){
        setError('A student with this email already exists.');
        return;
    }

    const newUserData: User = {
        ...newStudent,
        id: `user-${Date.now()}`,
        role: 'student'
    };
    
    allUsers.push(newUserData);
    localStorage.setItem('classNestUsers', JSON.stringify(allUsers));
    fetchStudents();
    setIsModalOpen(false);
    setNewStudent({ name: '', email: '', password: '' });
  };

  const handleRemoveStudent = (studentId: string) => {
    if (window.confirm('Are you sure you want to remove this student?')) {
        let allUsers: User[] = JSON.parse(localStorage.getItem('classNestUsers') || '[]');
        allUsers = allUsers.filter(u => u.id !== studentId);
        localStorage.setItem('classNestUsers', JSON.stringify(allUsers));
        fetchStudents();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-poppins font-bold text-text-primary">Manage Students</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-primary text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition-colors">
          <UserPlus className="mr-2 h-5 w-5" />
          Add Student
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="py-3 px-4 font-poppins font-semibold text-gray-600">Name</th>
                <th className="py-3 px-4 font-poppins font-semibold text-gray-600">Email</th>
                <th className="py-3 px-4 font-poppins font-semibold text-gray-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? students.map(student => (
                <tr key={student.id} className="border-b border-gray-100 hover:bg-secondary">
                  <td className="py-3 px-4">{student.name}</td>
                  <td className="py-3 px-4">{student.email}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => handleRemoveStudent(student.id)} className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-100 transition-colors">
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-500">No students registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                <X size={24}/>
            </button>
            <h2 className="text-2xl font-poppins font-bold mb-6">Add New Student</h2>
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
            <form onSubmit={handleAddStudent} className="space-y-4">
              <input type="text" placeholder="Full Name" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-primary"/>
              <input type="email" placeholder="Email" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-primary"/>
              <input type="password" placeholder="Password" value={newStudent.password} onChange={e => setNewStudent({...newStudent, password: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-primary"/>
              <button type="submit" className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">Add Student</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageStudents;
