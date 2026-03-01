import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Play, Info, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const TeacherLiveClass: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const startLiveClass = () => {
    const randomRoom = `class-${Math.random().toString(36).substring(2, 10)}`;
    navigate(`/live/${randomRoom}`);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-poppins font-bold text-white mb-2">Live Class Node</h1>
        <p className="text-gray-400">Host real-time interactive classes with your students.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-bg-card border-2 border-border-main rounded-card p-8 flex flex-col items-center text-center"
        >
          <div className="bg-primary/20 p-4 rounded-2xl text-primary mb-6">
            <Video size={48} />
          </div>
          <h2 className="text-2xl font-poppins font-bold text-white mb-4">Start New Session</h2>
          <p className="text-gray-400 mb-8">
            Create a secure live room instantly. You'll be the host and can share your screen, camera, and microphone.
          </p>
          <button
            onClick={startLiveClass}
            className="w-full py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
          >
            <Play size={20} />
            Start Live Class
          </button>
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
              <p className="text-gray-300 text-sm">Click "Start Live Class" to create a unique room.</p>
            </li>
            <li className="flex gap-3">
              <div className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">2</div>
              <p className="text-gray-300 text-sm">Copy the room URL from your browser's address bar.</p>
            </li>
            <li className="flex gap-3">
              <div className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">3</div>
              <p className="text-gray-300 text-sm">Share the room code or link with your students via announcements.</p>
            </li>
          </ul>

          <div className="mt-8 p-4 bg-secondary/50 rounded-xl border border-border-main">
            <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-2">Pro Tip</p>
            <p className="text-sm text-gray-400 italic">
              "Use screen sharing to present your slides or digital whiteboard directly to students."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLiveClass;
