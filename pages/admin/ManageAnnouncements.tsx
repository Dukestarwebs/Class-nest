
import React, { useState, useEffect } from 'react';
import { Announcement } from '../../types';
import { Megaphone, Trash2, Edit, X, Save } from 'lucide-react';

const ManageAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAnnouncements = () => {
    const storedAnnouncements: Announcement[] = JSON.parse(localStorage.getItem('classNestAnnouncements') || '[]');
    setAnnouncements(storedAnnouncements.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSend = () => {
    if (!newMessage.trim()) {
      setError('Announcement message cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');

    const newAnnouncement: Announcement = {
      id: `ann-${Date.now()}`,
      message: newMessage,
      sender: 'Teacher Moses Sylvia',
      date: new Date().toISOString()
    };

    const currentAnnouncements: Announcement[] = JSON.parse(localStorage.getItem('classNestAnnouncements') || '[]');
    currentAnnouncements.push(newAnnouncement);
    localStorage.setItem('classNestAnnouncements', JSON.stringify(currentAnnouncements));
    
    setNewMessage('');
    fetchAnnouncements();
    setLoading(false);
  };
  
  const handleDelete = (id: string) => {
    if(window.confirm('Are you sure you want to delete this announcement?')) {
        let currentAnnouncements: Announcement[] = JSON.parse(localStorage.getItem('classNestAnnouncements') || '[]');
        currentAnnouncements = currentAnnouncements.filter(a => a.id !== id);
        localStorage.setItem('classNestAnnouncements', JSON.stringify(currentAnnouncements));
        fetchAnnouncements();
    }
  };

  const handleEdit = (announcement: Announcement) => {
      setEditingId(announcement.id);
      setEditingText(announcement.message);
  };

  const handleSaveEdit = (id: string) => {
      let currentAnnouncements: Announcement[] = JSON.parse(localStorage.getItem('classNestAnnouncements') || '[]');
      const index = currentAnnouncements.findIndex(a => a.id === id);
      if(index !== -1) {
          currentAnnouncements[index].message = editingText;
          localStorage.setItem('classNestAnnouncements', JSON.stringify(currentAnnouncements));
          fetchAnnouncements();
          setEditingId(null);
          setEditingText('');
      }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-poppins font-bold text-text-primary">Announcements</h1>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-poppins font-semibold mb-4">New Announcement</h2>
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
        <div className="flex flex-col sm:flex-row gap-4">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your announcement here..."
            className="flex-grow p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="flex items-center justify-center bg-primary text-white px-6 py-3 rounded-lg shadow hover:bg-blue-600 transition-colors disabled:bg-primary/50"
          >
            <Megaphone className="mr-2 h-5 w-5" />
            Send
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-poppins font-semibold mb-4">Previous Announcements</h2>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {announcements.length > 0 ? announcements.map(ann => (
                <div key={ann.id} className="p-4 border rounded-lg flex justify-between items-start hover:shadow-lg transition-shadow">
                    <div>
                        {editingId === ann.id ? (
                            <textarea value={editingText} onChange={(e) => setEditingText(e.target.value)} className="w-full p-2 border rounded-lg" />
                        ) : (
                            <p className="text-gray-800">{ann.message}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-2">
                            {new Date(ann.date).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
                        {editingId === ann.id ? (
                            <>
                               <button onClick={() => handleSaveEdit(ann.id)} className="text-green-500 p-2 rounded-full hover:bg-green-100"><Save size={20}/></button>
                               <button onClick={() => setEditingId(null)} className="text-gray-500 p-2 rounded-full hover:bg-gray-100"><X size={20}/></button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => handleEdit(ann)} className="text-blue-500 p-2 rounded-full hover:bg-blue-100"><Edit size={20}/></button>
                                <button onClick={() => handleDelete(ann.id)} className="text-red-500 p-2 rounded-full hover:bg-red-100"><Trash2 size={20}/></button>
                            </>
                        )}
                    </div>
                </div>
            )) : <p className="text-center text-gray-500 py-8">No announcements sent yet.</p>}
        </div>
      </div>
    </div>
  );
};

export default ManageAnnouncements;
