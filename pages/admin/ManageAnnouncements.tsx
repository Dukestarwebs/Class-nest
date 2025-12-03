
import React, { useState, useEffect } from 'react';
import { Announcement, ClassLevel } from '../../types';
import { Megaphone, Trash2, Edit, X, Save, Users } from 'lucide-react';
import { getAnnouncements, addAnnouncement, deleteAnnouncement, updateAnnouncement } from '../../data';
import { useAuth } from '../../contexts/AuthContext';

const ManageAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [targetClass, setTargetClass] = useState<ClassLevel | 'All'>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const fetchAnnouncements = async () => {
    try {
        const announcementsList = await getAnnouncements();
        const sorted = announcementsList.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAnnouncements(sorted);
    } catch(e) {
        console.error("Error fetching announcements", e);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim()) {
      setError('Announcement message cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');

    const newAnnouncement = {
      message: newMessage,
      sender: user?.name || 'Admin',
      date: new Date().toISOString(),
      classLevel: targetClass
    };

    try {
      await addAnnouncement(newAnnouncement);
      setNewMessage('');
      setTargetClass('All');
      fetchAnnouncements();
    } catch (e) {
      setError('Failed to send announcement.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== id));

    try {
        await deleteAnnouncement(id);
    } catch (e) {
        console.error("Failed to delete announcement", e);
        fetchAnnouncements();
    }
  };

  const handleEdit = (announcement: Announcement) => {
      setEditingId(announcement.id);
      setEditingText(announcement.message);
  };

  const handleSaveEdit = async (id: string) => {
      try {
        await updateAnnouncement(id, editingText);
        await fetchAnnouncements();
        setEditingId(null);
        setEditingText('');
      } catch (e) {
          console.error(e);
          alert('Failed to save changes.');
      }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">Announcements</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-colors duration-200">
        <h2 className="text-2xl font-poppins font-semibold mb-4 text-text-primary dark:text-white">New Announcement</h2>
        {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/30 dark:text-red-300 p-3 rounded-lg mb-4">{error}</p>}
        
        <div className="flex flex-col gap-4">
            <div className="w-full md:w-1/3">
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Audience</label>
                 <select 
                    value={targetClass} 
                    onChange={e => setTargetClass(e.target.value as ClassLevel | 'All')}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                 >
                    <option value="All">All Students</option>
                    {['P6', 'P7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                    ))}
                 </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your announcement here..."
                    className="flex-grow p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-secondary dark:bg-gray-700 text-text-primary dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    rows={3}
                />
                <button
                    onClick={handleSend}
                    disabled={loading}
                    className="flex items-center justify-center bg-primary text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition-colors disabled:bg-primary/50 self-end sm:self-auto h-full"
                >
                    <Megaphone className="mr-2 h-5 w-5" />
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-colors duration-200">
        <h2 className="text-2xl font-poppins font-semibold mb-4 text-text-primary dark:text-white">Previous Announcements</h2>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
            {announcements.length > 0 ? announcements.map(ann => (
                <div key={ann.id} className="bg-secondary dark:bg-gray-700 p-4 rounded-lg flex justify-between items-start hover:shadow-md transition-all">
                    <div className="flex-grow mr-4">
                        <div className="flex items-center gap-2 mb-2">
                             <span className={`text-xs font-bold px-2 py-0.5 rounded border ${ann.classLevel === 'All' ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800' : 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800'}`}>
                                {ann.classLevel === 'All' ? 'All Students' : ann.classLevel}
                             </span>
                        </div>
                        {editingId === ann.id ? (
                            <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} className="w-full p-2 border-gray-300 rounded-lg bg-white dark:bg-gray-800 text-text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                        ) : (
                            <p className="text-text-primary dark:text-gray-200">{ann.message}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            {new Date(ann.date).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                        {editingId === ann.id ? (
                            <>
                               <button onClick={() => handleSaveEdit(ann.id)} className="text-green-600 dark:text-green-400 p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"><Save size={20}/></button>
                               <button onClick={() => setEditingId(null)} className="text-red-600 dark:text-red-400 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"><X size={20}/></button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => handleEdit(ann)} className="text-gray-600 dark:text-gray-400 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"><Edit size={20}/></button>
                                <button 
                                    onClick={() => handleDelete(ann.id)} 
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                    title="Delete Announcement"
                                >
                                    <Trash2 size={20}/>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )) : <p className="text-center text-gray-500 dark:text-gray-400 py-8">No announcements sent yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default ManageAnnouncements;
