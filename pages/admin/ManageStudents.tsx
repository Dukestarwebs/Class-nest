
import React, { useState, useEffect } from 'react';
import { User, ClassLevel } from '../../types';
import { Trash2, UserPlus, Save, Eye, EyeOff, Edit, X, User as UserIcon } from 'lucide-react';
import { getStudents, removeUser, addUser, updateUser } from '../../data';

const ManageStudents: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newClassLevel, setNewClassLevel] = useState<ClassLevel>('S1');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchStudents = async () => {
    try {
        const currentStudents = await getStudents();
        setStudents(currentStudents);
    } catch (error) {
        console.error("Error fetching students: ", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleRemoveStudent = async (studentId: string) => {
    if(!window.confirm("Are you sure you want to delete this student?")) return;

    // Optimistic Update
    setStudents(currentStudents => currentStudents.filter(s => s.id !== studentId));

    try {
        await removeUser(studentId);
    } catch (error) {
        console.error("Error removing student: ", error);
        alert("System warning: Could not delete student from database. Please refresh.");
        fetchStudents();
    }
  };

  const handleEditStudent = (student: User) => {
      setEditingId(student.id);
      setNewUsername(student.username);
      // Pre-fill password if available or keep empty to imply logic (here we use raw password for simplicity of the request)
      setNewPassword(student.password || '');
      setNewClassLevel(student.classLevel || 'S1');
      setFormError('');
      setFormSuccess('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
      setEditingId(null);
      setNewUsername('');
      setNewPassword('');
      setNewClassLevel('S1');
      setFormError('');
      setFormSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError('');
      setFormSuccess('');

      if (!newUsername || !newPassword) {
          setFormError('Username and Password are required.');
          return;
      }
      
      if (newPassword.length < 6) {
          setFormError('Password must be at least 6 characters.');
          return;
      }

      // Check for duplicate username
      const existingUsername = students.find(s => 
          s.username.toLowerCase() === newUsername.toLowerCase() &&
          s.id !== editingId // Allow same username if editing self
      );
      
      if (existingUsername) {
           setFormError('A student with this username already exists.');
           return;
      }

      try {
          if (editingId) {
              // Update Mode
              const updates = {
                  name: newUsername,
                  username: newUsername,
                  email: `${newUsername}@classnest.local`,
                  password: newPassword,
                  classLevel: newClassLevel
              };

              await updateUser(editingId, updates);
              
              setFormSuccess('Student updated successfully!');
              
              // Refetch to ensure data sync
              await fetchStudents();
              
              // Return to add mode after delay
              setTimeout(() => {
                  handleCancelEdit();
                  setFormSuccess('');
              }, 2000);

          } else {
              // Add Mode
              // Fixed type definition to match object properties and expected type in addUser
              const newUser: Omit<User, 'id' | 'isApproved'> = {
                  name: newUsername,
                  username: newUsername,
                  email: `${newUsername}@classnest.local`,
                  password: newPassword,
                  role: 'student',
                  classLevel: newClassLevel
              };
              const createdUser = await addUser(newUser);
              
              setStudents(prev => [...prev, createdUser]);
              
              setFormSuccess('Student added successfully!');
              setNewUsername('');
              setNewPassword('');
              setNewClassLevel('S1');
              
              setTimeout(() => setFormSuccess(''), 3000);
          }
      } catch (error) {
          console.error(error);
          setFormError(editingId ? 'Failed to update student.' : 'Failed to add student.');
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">Manage Students</h1>
      </div>
      
      {/* Add/Edit Student Form */}
      <div className={`p-6 rounded-xl shadow-md transition-all duration-200 ${editingId ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800' : 'bg-white dark:bg-gray-800'}`}>
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-poppins font-semibold text-text-primary dark:text-white flex items-center">
                  {editingId ? <Edit className="mr-2 text-primary" /> : <UserPlus className="mr-2 text-primary"/>} 
                  {editingId ? 'Edit Student' : 'Add New Student'}
              </h2>
              {editingId && (
                  <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" title="Cancel Editing">
                      <X size={24} />
                  </button>
              )}
          </div>

          {formError && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4">{formError}</div>}
          {formSuccess && <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg mb-4">{formSuccess}</div>}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                  <input 
                      type="text" 
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      placeholder="e.g. alicej"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
              </div>
              <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Class</label>
                  <select 
                    value={newClassLevel} 
                    onChange={e => setNewClassLevel(e.target.value as ClassLevel)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                  >
                    {['P6', 'P7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
              </div>
              <div className="md:col-span-4 relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                  <input 
                      type={showPassword ? "text" : "password"} 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                   <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                   </button>
              </div>
              <div className="md:col-span-2 flex gap-2">
                  {editingId && (
                      <button type="button" onClick={handleCancelEdit} className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition-colors flex justify-center items-center h-[42px] dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                        Cancel
                      </button>
                  )}
                  <button type="submit" className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-blue-600 transition-colors flex justify-center items-center h-[42px]">
                      <Save size={20} className="mr-2" /> {editingId ? 'Update' : 'Add'}
                  </button>
              </div>
          </form>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-colors duration-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200">Registered Students List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-100 dark:border-gray-700">
                <th className="py-3 px-4 font-poppins font-semibold text-gray-600 dark:text-gray-400 w-16">Avatar</th>
                <th className="py-3 px-4 font-poppins font-semibold text-gray-600 dark:text-gray-400">Username</th>
                <th className="py-3 px-4 font-poppins font-semibold text-gray-600 dark:text-gray-400">Class</th>
                <th className="py-3 px-4 font-poppins font-semibold text-gray-600 dark:text-gray-400">Password</th>
                <th className="py-3 px-4 font-poppins font-semibold text-gray-600 dark:text-gray-400">Student ID</th>
                <th className="py-3 px-4 font-poppins font-semibold text-gray-600 dark:text-gray-400 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2">Loading Students...</p>
                    </td>
                </tr>
              ) : students.length > 0 ? students.map(student => (
                <tr key={student.id} className={`border-b border-gray-100 dark:border-gray-700 hover:bg-secondary dark:hover:bg-gray-700/50 transition-colors ${editingId === student.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                  <td className="py-3 px-4">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border border-gray-200 dark:border-gray-600">
                        {student.avatarUrl ? (
                            <img src={student.avatarUrl} alt={student.username} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                                <UserIcon size={20} />
                            </div>
                        )}
                      </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-text-primary dark:text-gray-200">{student.username}</td>
                  <td className="py-3 px-4">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-900">
                        {student.classLevel || 'N/A'}
                    </span>
                  </td>
                   <td className="py-3 px-4 text-gray-400 dark:text-gray-500 font-mono text-sm">{student.password}</td>
                   <td className="py-3 px-4 text-xs text-gray-400 dark:text-gray-500 font-mono">{student.id.substring(0, 8)}...</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                        <button 
                            type="button"
                            onClick={() => handleEditStudent(student)}
                            className="inline-flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white font-medium rounded-lg text-sm px-3 py-2 transition-all duration-200 border border-blue-200 dark:border-blue-900 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-700 dark:hover:text-white"
                            title="Edit student"
                        >
                            <Edit size={16} className="mr-1" />
                            Edit
                        </button>
                        <button 
                            type="button"
                            onClick={() => handleRemoveStudent(student.id)}
                            className="inline-flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-medium rounded-lg text-sm px-3 py-2 transition-all duration-200 border border-red-200 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-700 dark:hover:text-white"
                            title="Delete this student"
                        >
                            <Trash2 size={16} className="mr-1" />
                            Delete
                        </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400 italic">No students registered yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageStudents;
