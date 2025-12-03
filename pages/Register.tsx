
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Book, CheckCircle, ArrowLeft } from 'lucide-react';
import { registerStudent, findUserByUsername } from '../data';
import { ClassLevel } from '../types';
import emailjs from '@emailjs/browser';
import { ADMIN_EMAIL } from '../constants';

// --- EMAILJS CONFIGURATION ---
const SERVICE_ID = 'service_g370l0d'; 
const TEMPLATE_ID_ADMIN_NOTIFY: string = 'template_j7aqefd'; 
const PUBLIC_KEY = 'f218z1gwOWB04vw7r';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [classLevel, setClassLevel] = useState<ClassLevel>('S1');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper to safely extract error message
  const getErrorMessage = (err: any) => {
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    
    // Supabase or EmailJS error objects
    if (err && typeof err === 'object') {
         if ('message' in err && typeof err.message === 'string') return err.message;
         if ('text' in err && typeof err.text === 'string') return err.text;
         if ('error_description' in err && typeof err.error_description === 'string') return err.error_description;
    }
    
    try {
        const json = JSON.stringify(err);
        if (json !== '{}') return json;
    } catch {
        // ignore
    }

    return 'Failed to create an account. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!agreedToTerms) {
        setError("You must agree to the Terms of Service and Privacy Policy to register.");
        setLoading(false);
        return;
    }

    if(password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setLoading(false);
        return;
    }

    try {
      // Check for existing username
      const existing = await findUserByUsername(username);
      if (existing) {
          setError("Username already taken. Please choose another.");
          setLoading(false);
          return;
      }

      // Register and get the new ID
      const newUserId = await registerStudent({
          name,
          username,
          email,
          password,
          classLevel
      });
      
      // Send Email to Admin with Action Links
      if (TEMPLATE_ID_ADMIN_NOTIFY !== 'YOUR_ADMIN_NOTIFY_TEMPLATE_ID') {
          const baseUrl = window.location.origin + window.location.pathname; // Base URL excluding hash
          // We use hash routing in App.tsx, so we construct the link with hash
          // Link format: https://domain.com/#/admin/action?id=xyz&act=approve
          const approveLink = `${baseUrl}#/admin/action?id=${newUserId}&act=approve`;
          const rejectLink = `${baseUrl}#/admin/action?id=${newUserId}&act=reject`;

          try {
              await emailjs.send(
                  SERVICE_ID,
                  TEMPLATE_ID_ADMIN_NOTIFY,
                  {
                      admin_email: ADMIN_EMAIL, // Or your hardcoded email
                      student_name: name,
                      class_level: classLevel,
                      approve_link: approveLink,
                      reject_link: rejectLink
                  },
                  PUBLIC_KEY
              );
              console.log("Admin notification sent.");
          } catch (emailError) {
              console.error("Failed to send admin notification:", emailError);
              // Don't fail the registration UI if email fails, just log it
          }
      } else {
        console.warn("EmailJS Template ID not set. Email not sent.");
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-secondary dark:bg-gray-900 p-4 transition-colors duration-200">
            <div 
                className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-transparent dark:border-gray-700"
            >
                <div className="mx-auto bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-3xl font-poppins font-bold text-gray-800 dark:text-white mb-4">Registration Successful!</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                    Your account has been created successfully. <br/>
                    <span className="font-semibold text-primary">Please wait for admin approval.</span>
                </p>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
                    You cannot login immediately. Check back later to see if your account has been approved.
                </p>
                <button 
                    onClick={() => navigate('/login')}
                    className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
                >
                    Back to Login
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary dark:bg-gray-900 p-4 transition-colors duration-200 relative">
      
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

      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-all duration-500 border border-transparent dark:border-gray-700">
        <div className="flex flex-col items-center mb-6">
            <div className="bg-primary text-white p-3 rounded-2xl shadow-md mb-4">
                <Book className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-poppins font-bold text-center text-primary">Create Account</h1>
        </div>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">Join Class Nest today!</p>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 px-4 py-3 rounded-lg relative mb-4 break-words" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alice Johnson"
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary transition text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. alicej"
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary transition text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="classLevel">Class</label>
                <select
                    id="classLevel"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value as ClassLevel)}
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary transition text-gray-900 dark:text-white"
                >
                    {['P6', 'P7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map(cls => (
                        <option key={cls} value={cls}>{cls}</option>
                    ))}
                </select>
              </div>
               <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alice@example.com"
                    className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary transition text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                    required
                />
              </div>
          </div>

          <div className="relative">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="password">Password</label>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary transition text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              required
            />
             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <label htmlFor="terms" className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">
              I agree to the <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privacy Policy</Link>
            </label>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:scale-105 disabled:bg-primary/50 disabled:cursor-not-allowed"
          >
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : 'Register'}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-blue-600">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
