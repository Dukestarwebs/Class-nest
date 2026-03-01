
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, ArrowRight, Book, ArrowLeft } from 'lucide-react';
import { getSystemSettings } from '../data';
import { motion } from 'framer-motion';
import { ADMIN_USERNAME } from '../constants';

const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
      if(user) {
        const checkStatus = async () => {
            const settings = await getSystemSettings();
            const now = new Date();
            const endTime = settings.maintenanceEndTime ? new Date(settings.maintenanceEndTime) : null;
            const isActive = settings.maintenanceMode && (!endTime || now < endTime);
            if (isActive && user.role === 'student') {
                navigate('/maintenance');
                return;
            }
            
            let defaultPath = '/student/dashboard';
            if (user.role === 'teacher') {
                defaultPath = '/teacher/dashboard';
            } else if (user.role === 'admin') {
                // Platform owner goes to admin panel, school owners go to school panel
                defaultPath = user.username === ADMIN_USERNAME ? '/admin/dashboard' : '/school/dashboard';
            }

            const from = (location.state as any)?.from?.pathname || defaultPath;
            navigate(from, { replace: true });
        };
        checkStatus();
      }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden font-roboto selection:bg-primary/30">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[150px]"></div>
      </div>

      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-8 left-8 flex items-center text-gray-400 hover:text-white transition-all group z-20"
      >
        <div className="p-2 bg-gray-800/50 rounded-full mr-3 group-hover:bg-gray-700">
          <ArrowLeft size={20} />
        </div>
        <span className="font-medium text-sm">Back to Home</span>
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[480px] bg-[#131C2B]/80 backdrop-blur-xl border border-gray-800/50 rounded-[2.5rem] shadow-2xl p-10 md:p-12 relative z-10"
      >
        <div className="flex flex-col items-center mb-10 text-center">
            <div className="bg-primary text-white p-5 rounded-[1.5rem] shadow-xl shadow-blue-500/20 mb-6">
                <Book className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-poppins font-bold text-primary mb-2">Class Nest</h1>
            <p className="text-gray-400 font-medium">Welcome back! Please sign in.</p>
        </div>
        
        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border-l-4 border-red-500 text-red-400 p-4 rounded-lg mb-8 text-sm font-bold"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2.5 ml-1">Username</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-6 py-4 bg-[#212C3F] border border-gray-700/50 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white placeholder-gray-500 transition-all"
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div className="relative">
            <label className="block text-sm font-bold text-gray-300 mb-2.5 ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-[#212C3F] border border-gray-700/50 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-white transition-all"
                placeholder="••••••••"
                required
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary transition-colors"
              >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
          </div>

          <div className="flex items-center ml-1">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="hidden"
              />
              <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center mr-3 ${rememberMe ? 'bg-primary border-primary' : 'bg-transparent border-gray-600 group-hover:border-primary'}`}>
                {rememberMe && <div className="w-2 h-2 bg-white rounded-full"></div>}
              </div>
              <span className="text-sm font-medium text-gray-400 group-hover:text-gray-300 transition-colors">Remember me</span>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-primary text-white font-bold shadow-lg shadow-blue-500/20 hover:bg-primary-dark transition-all disabled:opacity-50 flex justify-center items-center group text-lg"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
            ) : (
              <>
                Login <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
            <p className="text-gray-400 font-medium">
              Don't have an account? {' '}
              <Link to="/register" className="text-primary hover:text-white transition-colors font-bold underline underline-offset-4">
                Register here
              </Link>
            </p>
        </div>
      </motion.div>

      <footer className="mt-12 text-gray-600 text-xs font-bold uppercase tracking-widest text-center">
          © 2025 Class Nest • Digital Learning Hub
      </footer>
    </div>
  );
};

export default LoginPage;
