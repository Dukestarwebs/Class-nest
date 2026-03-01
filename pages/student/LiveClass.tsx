import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Play, Info, Copy, Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentLiveClass: React.FC = () => {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');

  const joinLiveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      navigate(`/live/${roomCode.trim()}`);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-poppins font-bold text-white mb-2">Join Live Class</h1>
        <p className="text-gray-400">Enter a room code to join your teacher's session.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-bg-card border-2 border-border-main rounded-card p-8 flex flex-col items-center text-center"
        >
          <div className="bg-primary/20 p-4 rounded-2xl text-primary mb-6">
            <Video size={48} />
          </div>
          <h2 className="text-2xl font-poppins font-bold text-white mb-4">Join Session</h2>
          <p className="text-gray-400 mb-8">
            Join your teacher's live class. You'll be able to see their screen, camera, and participate.
          </p>
          
          <form onSubmit={joinLiveClass} className="w-full space-y-4">
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Enter Room Code (e.g. class-abc123)"
              className="w-full px-6 py-4 bg-secondary border border-border-main rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
              required
            />
            <button
              type="submit"
              className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 group"
            >
              Join Live Class
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </form>
        </motion.div>

        <div className="bg-bg-card border-2 border-border-main rounded-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-accent/20 p-2 rounded-lg text-accent">
              <Info size={24} />
            </div>
            <h2 className="text-xl font-poppins font-bold text-white">How it works</h2>
          </div>
          
          <ul className="space-y-4">
            <li className="flex gap-3">
              <div className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">1</div>
              <p className="text-gray-300 text-sm">Get the room code from your teacher's announcement.</p>
            </li>
            <li className="flex gap-3">
              <div className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">2</div>
              <p className="text-gray-300 text-sm">Enter the code in the input field on the left.</p>
            </li>
            <li className="flex gap-3">
              <div className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">3</div>
              <p className="text-gray-300 text-sm">Click "Join Live Class" to enter the session.</p>
            </li>
          </ul>

          <div className="mt-8 p-4 bg-secondary/50 rounded-xl border border-border-main">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2">Pro Tip</p>
            <p className="text-sm text-gray-400 italic">
              "Make sure your camera and microphone are working before joining."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLiveClass;
