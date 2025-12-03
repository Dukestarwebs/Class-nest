
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, ArrowRight, Book, ArrowLeft } from 'lucide-react';
import { getSystemSettings } from '../data';

const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
      const checkStatus = async () => {
          if(user) {
            const settings = await getSystemSettings();
            
            // Check if maintenance is actually active (Mode ON AND Time NOT passed)
            const now = new Date();
            const endTime = settings.maintenanceEndTime ? new Date(settings.maintenanceEndTime) : null;
            const isMaintenanceActive = settings.maintenanceMode && (!endTime || now < endTime);
            
            // If maintenance is ON and user is a student, send to maintenance page
            if (isMaintenanceActive && user.role === 'student') {
                navigate('/maintenance');
                return;
            }

            // Normal redirection logic
            const state = location.state as any;
            const from = state?.from?.pathname;
            const search = state?.from?.search || '';
            
            if (from) {
                 navigate(from + search);
            } else {
                 if(user.role === 'admin') navigate('/admin/dashboard');
                 else navigate('/student/dashboard');
            }
          }
      };
      checkStatus();
  }, [user, navigate, location]);

  useEffect(() => {
    const savedIdentifier = localStorage.getItem('classNestRememberMe');
    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
      setRememberMe(true);
    }
  }, []);

  // Helper to safely extract error message
  const getErrorMessage = (err: any) => {
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    
    if (err && typeof err === 'object') {
        if ('message' in err) {
            return typeof err.message === 'object' ? JSON.stringify(err.message) : String(err.message);
        }
        if ('error_description' in err) {
             return typeof err.error_description === 'object' ? JSON.stringify(err.error_description) : String(err.error_description);
        }
    }
    
    try {
        const json = JSON.stringify(err);
        if (json !== '{}') return json;
    } catch {
        // ignore
    }
    
    return 'An error occurred. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Attempt Login first to verify credentials and get role
      const loggedInUser = await login(identifier, password);
      
      if (loggedInUser) {
          // 2. Check Maintenance Mode AFTER we know who the user is
          const settings = await getSystemSettings();
          
          // Check logic: Active if Mode is TRUE AND (No EndTime set OR Current Time < EndTime)
          const now = new Date();
          const endTime = settings.maintenanceEndTime ? new Date(settings.maintenanceEndTime) : null;
          const isMaintenanceActive = settings.maintenanceMode && (!endTime || now < endTime);
          
          if (isMaintenanceActive) {
              if (loggedInUser.role === 'student') {
                  // Redirect student to maintenance page
                  navigate('/maintenance');
                  return;
              }
              // Admin proceeds normally (bypass)
          }

          // 3. Handle Remember Me
          if (rememberMe) {
            localStorage.setItem('classNestRememberMe', identifier);
          } else {
            localStorage.removeItem('classNestRememberMe');
          }
          
          // 4. Navigate (if useEffect doesn't catch it first)
          if(loggedInUser.role === 'admin') navigate('/admin/dashboard');
          else navigate('/student/dashboard');
      } 
    } catch (err: any) {
      console.error("Login error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary dark:bg-gray-900 p-4 transition-colors duration-200 relative overflow-hidden">
      
      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 z-20 flex items-center group"
      >
        <div className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-sm group-hover:shadow-md transition-all mr-3 text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary">
            <ArrowLeft size={20} />
        </div>
        <span className="hidden md:block font-poppins font-medium text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary transition-colors">Back to Home</span>
      </button>

      {/* Animated Background Blobs - Static Fallback */}
      <div 
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <div 
          className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"
        />
        <div 
          className="absolute bottom-[-10%] left-[-5%] w-72 h-72 bg-yellow-400/20 rounded-full blur-3xl"
        />
      </div>

      <div 
        className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700 z-10"
      >
        <div className="flex flex-col items-center mb-6">
            <div>
                <div className="bg-primary text-white p-4 rounded-2xl shadow-lg mb-4">
                    <Book className="w-12 h-12" />
                </div>
            </div>
            <h1 
                className="text-3xl font-poppins font-bold text-center text-primary"
            >
                Class Nest
            </h1>
            <p 
                className="text-center text-gray-500 dark:text-gray-400 mt-2"
            >
                Welcome back! Please sign in.
            </p>
        </div>
        
        {error && (
            <div 
                className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 px-4 py-3 rounded-lg relative overflow-hidden mb-4 break-words"
                role="alert"
            >
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="identifier">Username</label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Enter your username"
              required
            />
          </div>
          
          <div
            className="relative"
          >
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">Password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none transition-colors text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary focus:border-primary"
              required
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div 
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded cursor-pointer" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300 cursor-pointer">Remember me</label>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:bg-primary/50 disabled:cursor-not-allowed transform hover:scale-[1.03] active:scale-[0.97]"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : <span className="flex items-center">Login <ArrowRight className="ml-2" size={18}/></span>}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:text-blue-600">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
