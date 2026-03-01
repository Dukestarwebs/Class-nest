import React, { useState, useEffect } from 'react';
import { Video, Trash2, Users, RefreshCw, AlertCircle, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface Room {
  name: string;
  numParticipants: number;
  creationTime: number;
}

const AdminLiveSessions: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/live/rooms');
      if (!response.ok) throw new Error('Failed to fetch active sessions');
      const data = await response.json();
      setRooms(data.rooms || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startNewSession = () => {
    const roomName = prompt("Enter a name for the new session:");
    if (roomName) {
      navigate(`/live/${encodeURIComponent(roomName)}`);
    }
  };

  const endSession = async (roomName: string) => {
    if (!confirm(`Are you sure you want to end session "${roomName}"?`)) return;
    
    try {
      const response = await fetch(`/api/live/rooms/${roomName}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to end session');
      setRooms(rooms.filter(r => r.name !== roomName));
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-poppins font-bold text-white mb-2">Live Sessions</h1>
          <p className="text-gray-400">Monitor and manage active live classes across the platform.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={startNewSession}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            Start Session
          </button>
          <button 
            onClick={fetchRooms}
            className="p-3 bg-secondary hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition-all"
            title="Refresh Sessions"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 p-4 rounded-lg mb-8 flex items-center gap-3">
          <AlertCircle size={20} />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : rooms.length === 0 ? (
        <div className="bg-bg-card border-2 border-border-main rounded-card p-20 text-center">
          <div className="bg-gray-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Video size={40} className="text-gray-600" />
          </div>
          <h2 className="text-xl font-poppins font-bold text-white mb-2">No Active Sessions</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            There are currently no live classes being hosted on the platform.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <motion.div 
              key={room.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-card border-2 border-border-main rounded-card p-6 hover:border-primary transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="bg-primary/20 p-3 rounded-xl text-primary">
                  <Video size={24} />
                </div>
                <button 
                  onClick={() => endSession(room.name)}
                  className="p-2 text-gray-500 hover:text-danger hover:bg-danger/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="End Session"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              
              <h3 className="text-lg font-poppins font-bold text-white mb-1 truncate" title={room.name}>
                {room.name}
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Started {new Date(room.creationTime * 1000).toLocaleTimeString()}
              </p>
              
              <div className="flex items-center gap-2 text-gray-400">
                <Users size={16} />
                <span className="text-sm font-medium">{room.numParticipants} Participants</span>
              </div>
              
              <div className="mt-6 pt-4 border-t border-border-main flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Live Now</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminLiveSessions;
