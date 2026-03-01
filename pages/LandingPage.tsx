
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, ArrowRight, MessageSquare, UserCheck, Users, BookOpen, ShieldCheck, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: 'About', path: '/about' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Careers', path: '/careers' },
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-white overflow-hidden selection:bg-primary/30 font-roboto">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-8 flex justify-between items-center relative z-20">
        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-primary text-white p-2 rounded-lg shadow-blue-500/20 shadow-lg group-hover:scale-110 transition-transform">
            <Book className="w-7 h-7" />
          </div>
          <span className="text-2xl font-poppins font-bold text-primary tracking-tight">Class Nest</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-bold uppercase tracking-wider text-gray-400">
            <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About</button>
            <button onClick={() => navigate('/pricing')} className="hover:text-white transition-colors">Pricing</button>
            <button onClick={() => navigate('/careers')} className="hover:text-white transition-colors">Careers</button>
            <button 
                onClick={() => navigate('/login')}
                className="px-6 py-2 border-2 border-primary/20 text-primary rounded-full hover:bg-primary hover:text-white transition-all"
            >
                Login
            </button>
        </div>
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="z-30 relative">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-[#0B1120] z-10 flex flex-col items-center justify-center space-y-8"
          >
            {navLinks.map(link => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setIsMenuOpen(false);
                }}
                className="text-3xl font-bold uppercase text-gray-300 hover:text-white transition-colors"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                navigate('/login');
                setIsMenuOpen(false);
              }}
              className="mt-8 px-10 py-4 bg-primary text-white font-bold rounded-full text-lg"
            >
              Login
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <header className="container mx-auto px-6 pt-12 pb-24 md:pt-20 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 mb-16 lg:mb-0">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            For Modern Education
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-poppins font-bold leading-[1.1] mb-8"
          >
            The Digital <br/>
            <span className="text-primary">Nest for Learning</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 mb-10 max-w-lg leading-relaxed font-roboto"
          >
            Streamline your classroom with Class Nest. Share notes, post announcements, and answer questions in one secure, easy-to-use platform.
          </motion.p>
          
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.3 }}
             className="flex flex-col sm:flex-row gap-5"
          >
            <button 
              onClick={() => navigate('/login')}
              className="px-10 py-5 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center group text-lg"
            >
              Enter Classroom
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </motion.div>
        </div>

        <div className="lg:w-1/2 relative flex justify-center lg:justify-end">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative w-full max-w-lg aspect-[4/3] bg-[#131C31] rounded-[2.5rem] border-4 border-gray-800 shadow-2xl overflow-hidden"
            >
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="bg-primary/20 p-6 rounded-2xl mb-4">
                        <Book className="w-12 h-12 text-primary" />
                    </div>
                    <h2 className="text-3xl font-poppins font-bold text-primary mb-1">Class Nest</h2>
                    <p className="text-gray-500 font-medium">Connect. Learn. Grow.</p>
                    
                    <div className="mt-8 space-y-3 w-1/2">
                        <div className="h-2 w-full bg-gray-800 rounded-full"></div>
                        <div className="h-2 w-3/4 bg-gray-800 rounded-full"></div>
                    </div>
                </div>

                <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="absolute top-10 right-[-20px] bg-[#1E293B]/90 backdrop-blur-md p-4 rounded-2xl border border-gray-700 shadow-2xl flex items-center space-x-3"
                >
                    <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400">
                        <UserCheck size={20} />
                    </div>
                    <span className="text-sm font-bold">Student Connected</span>
                </motion.div>

                <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 5 }}
                    className="absolute bottom-10 left-[-20px] bg-[#1E293B]/90 backdrop-blur-md p-4 rounded-2xl border border-gray-700 shadow-2xl flex items-center space-x-3"
                >
                    <div className="bg-orange-500/20 p-2 rounded-lg text-orange-400">
                        <MessageSquare size={20} />
                    </div>
                    <span className="text-sm font-bold">New Announcement</span>
                </motion.div>
                
                <div className="absolute -z-10 -inset-10 bg-primary/20 blur-[100px] opacity-30 rounded-full"></div>
            </motion.div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-24 border-t border-gray-800/50">
        <div className="text-center mb-16">
          <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs mb-4">Features</p>
          <h2 className="text-4xl md:text-5xl font-poppins font-bold mb-6">Everything you need to succeed</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Powerful tools designed to bridge the gap between teachers and students, making education seamless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1: Digital Notes */}
          <div className="bg-[#1E293B]/40 p-10 rounded-[2.5rem] border border-gray-800 hover:border-primary/30 transition-all group">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
              <BookOpen className="text-white w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold font-poppins mb-4 group-hover:text-primary transition-colors">Digital Notes Library</h3>
            <p className="text-gray-400 leading-relaxed">
              Access lecture notes, PDFs, and study materials anytime, anywhere. Never miss a lesson point again.
            </p>
          </div>

          {/* Feature 2: Announcements */}
          <div className="bg-[#1E293B]/40 p-10 rounded-[2.5rem] border border-gray-800 hover:border-purple-500/30 transition-all group">
            <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-purple-500/20">
              <MessageSquare className="text-white w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold font-poppins mb-4 group-hover:text-purple-400 transition-colors">Instant Announcements</h3>
            <p className="text-gray-400 leading-relaxed">
              Stay updated with real-time notifications from your teacher. Important dates, events, and reminders at a glance.
            </p>
          </div>

          {/* Feature 3: Q&A */}
          <div className="bg-[#1E293B]/40 p-10 rounded-[2.5rem] border border-gray-800 hover:border-orange-500/30 transition-all group">
            <div className="w-14 h-14 bg-[#F57C00] rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-orange-500/20">
              <Users className="text-white w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold font-poppins mb-4 group-hover:text-orange-400 transition-colors">Direct Q&A</h3>
            <p className="text-gray-400 leading-relaxed">
              Ask questions directly to the teacher and get personalized answers. Learning doesn't stop at the bell.
            </p>
          </div>
        </div>
      </section>

      {/* New Footer based on screenshot */}
      <footer className="bg-[#0B1120] border-t border-gray-800 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-gray-400 font-bold">
            Dukestar Developers
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-bold text-gray-400 uppercase tracking-wider">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors flex items-center">
              <ShieldCheck size={16} className="mr-2 text-primary" /> Secure Platform
            </button>
            <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">About Us</button>
            <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">Privacy</button>
            <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">Terms</button>
            <button onClick={() => navigate('/careers')} className="text-primary hover:text-white transition-colors">Careers</button>
          </div>

          <div className="text-gray-400 font-bold">
            © 2025 Class Nest.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
