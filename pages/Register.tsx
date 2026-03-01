

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Book, CheckCircle, ArrowLeft, User, Briefcase, Building } from 'lucide-react';
import { registerStudent, registerTeacher, findUserByUsername, registerSchoolAdmin, getSystemSettings } from '../data';
import { ClassLevel, Subject } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Common fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true);

  // Plan selection
  const [selectedPlan, setSelectedPlan] = useState<'student' | 'teacher' | 'school'>('student');

  // Student-specific
  const [classLevel, setClassLevel] = useState<ClassLevel>('S1');
  
  // Teacher-specific
  const [assignedClasses, setAssignedClasses] = useState<ClassLevel[]>([]);
  const [assignedSubjects, setAssignedSubjects] = useState<Subject[]>([]);
  const [bio, setBio] = useState('');
  const [expertise, setExpertise] = useState('');
  const [reason, setReason] = useState('');

  // School-specific
  const [schoolName, setSchoolName] = useState('');

  // Status
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Constants for teacher form
  const allClassLevels: ClassLevel[] = ['P6', 'P7', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'];
  const allSubjects = Object.values(Subject);

  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const settings = await getSystemSettings();
            setSubscriptionsEnabled(settings.subscriptionsEnabled);
        } catch (e) {
            console.error(e);
        }
    };
    fetchSettings();

    const params = new URLSearchParams(location.search);
    const plan = params.get('plan');
    if (plan === 'teacher' || plan === 'school') {
      setSelectedPlan(plan);
    } else {
      setSelectedPlan('student');
    }
  }, [location.search]);

  // Helper to safely extract error message
  const getErrorMessage = (err: any) => {
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    if (err && typeof err === 'object' && 'message' in err) return err.message;
    return 'An unexpected error occurred. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!agreedToTerms) {
        setError("You must agree to the Terms of Service and Privacy Policy.");
        setLoading(false);
        return;
    }

    if(password.length < 6) {
        setError("Password must be at least 6 characters long.");
        setLoading(false);
        return;
    }
    
    try {
        const existing = await findUserByUsername(username);
        if (existing) {
            setError("Username already taken. Please choose another.");
            setLoading(false);
            return;
        }

        if (selectedPlan === 'student') {
            await registerStudent({ name, username, email, password, classLevel });
            // Auto-login for students
            await login(username, password);
        } else if (selectedPlan === 'teacher') {
             if(assignedClasses.length === 0 || assignedSubjects.length === 0) {
                setError("Please select at least one class and one subject you can teach.");
                setLoading(false);
                return;
            }
            await registerTeacher({
                name, username, email, password, bio, expertise,
                reasonForJoining: reason, assignedClasses, assignedSubjects
            });
        } else if (selectedPlan === 'school') {
            if (!schoolName.trim()) {
                setError("Please enter the name of your school.");
                setLoading(false);
                return;
            }
            await registerSchoolAdmin({ name, username, email, password, schoolName });
            // Auto-login for school admins
            await login(username, password);
        }
        
        setSuccess(true);

    } catch (err: any) {
      console.error("Registration error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };
  
  const toggleClass = (cls: ClassLevel) => setAssignedClasses(p => p.includes(cls) ? p.filter(c => c !== cls) : [...p, cls]);
  const toggleSubject = (sub: Subject) => setAssignedSubjects(p => p.includes(sub) ? p.filter(s => s !== sub) : [...p, sub]);

  useEffect(() => {
    if (success) {
        // Don't auto-redirect teachers, they must wait for approval
        if (selectedPlan !== 'teacher') {
            const timer = setTimeout(() => {
                if (selectedPlan === 'student') {
                    navigate('/student/dashboard');
                } else if (selectedPlan === 'school') {
                    navigate('/school/dashboard');
                } else {
                    navigate('/login');
                }
            }, 3000);
            return () => clearTimeout(timer);
        }
    }
  }, [success, navigate, selectedPlan]);

  if (success) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-secondary dark:bg-gray-900 p-4">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                <div className="mx-auto bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-6">
                    <CheckCircle size={40} />
                </div>
                <h2 className="text-3xl font-poppins font-bold text-gray-800 dark:text-white mb-4">
                  {selectedPlan === 'teacher' ? "Registration Submitted!" : "Registration Successful!"}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                  {selectedPlan === 'teacher' 
                    ? "Your account is pending approval by the admin. You'll be notified via email."
                    : "Your account has been created successfully. You are being redirected to your dashboard."
                  }
                </p>
                {selectedPlan !== 'teacher' && 
                  <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">Redirecting in 3 seconds...</p>
                }
                <button 
                  onClick={() => {
                    if (selectedPlan === 'teacher') navigate('/');
                    else if (selectedPlan === 'student') navigate('/student/dashboard');
                    else if (selectedPlan === 'school') navigate('/school/dashboard');
                    else navigate('/login');
                  }} 
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
                >
                  {selectedPlan === 'teacher' ? 'Back to Home' : 'Go to Dashboard'}
                </button>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-secondary dark:bg-gray-900 p-4 md:p-8 relative">
      <button onClick={() => navigate('/')} className="absolute top-6 left-6 z-20 flex items-center group">
        <div className="p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-sm group-hover:shadow-md transition-all mr-3 text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary">
            <ArrowLeft size={20} />
        </div>
        <span className="hidden md:block font-poppins font-medium text-gray-600 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary transition-colors">Back to Home</span>
      </button>

      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transition-all duration-500 border border-transparent dark:border-gray-700">
        <div className="text-center mb-8">
            <div className="bg-primary text-white p-3 rounded-2xl shadow-md mb-4 inline-block">
                <Book className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-poppins font-bold text-primary">Create Your Account</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Choose your role to get started.</p>
        </div>
        
        {/* Plan Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-lg mx-auto bg-gray-100 dark:bg-gray-700 p-2 rounded-xl">
            <button onClick={() => setSelectedPlan('student')} className={`py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-sm ${selectedPlan === 'student' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600'}`}>
                <User size={18}/> Student
            </button>
            <button onClick={() => setSelectedPlan('teacher')} className={`py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-sm ${selectedPlan === 'teacher' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600'}`}>
                <Briefcase size={18}/> Teacher
            </button>
            <button onClick={() => setSelectedPlan('school')} className={`py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-sm ${selectedPlan === 'school' ? 'bg-primary text-white shadow-md' : 'text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600'}`}>
                <Building size={18}/> School Owner
            </button>
        </div>

        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300 px-4 py-3 rounded-lg relative mb-6 break-words" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Common Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Your Full Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alice Johnson" className="mt-1 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg" required /></div>
                <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</label><input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="e.g. alicej" className="mt-1 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg" required /></div>
                <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="e.g. alice@example.com" className="mt-1 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg" required /></div>
                <div className="relative"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label><input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-500">{showPassword ? <EyeOff/>:<Eye/>}</button></div>
            </div>

            {/* Dynamic Fields */}
            <AnimatePresence mode="wait">
                <motion.div key={selectedPlan} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                    {selectedPlan === 'student' && (
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Class Level</label>
                            <select value={classLevel} onChange={e => setClassLevel(e.target.value as ClassLevel)} className="mt-1 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                {allClassLevels.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    )}
                    {selectedPlan === 'teacher' && (
                        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Classes you teach:</label>
                                <div className="flex flex-wrap gap-2">{allClassLevels.map(c => <button key={c} type="button" onClick={() => toggleClass(c)} className={`px-4 py-2 text-sm rounded-lg ${assignedClasses.includes(c) ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-600'}`}>{c}</button>)}</div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Subjects you teach:</label>
                                <div className="flex flex-wrap gap-2">{allSubjects.map(s => <button key={s} type="button" onClick={() => toggleSubject(s)} className={`px-3 py-1.5 text-xs rounded-full ${assignedSubjects.includes(s) ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-600'}`}>{s}</button>)}</div>
                            </div>
                            <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label><textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Brief biography..." rows={2} className="mt-1 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg" required /></div>
                            <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Expertise</label><input type="text" value={expertise} onChange={e => setExpertise(e.target.value)} placeholder="e.g. B.Ed Mathematics, 5 years experience" className="mt-1 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg" required /></div>
                            <div><label className="text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Joining</label><textarea value={reason} onChange={e => setReason(e.target.value)} rows={2} className="mt-1 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg" required /></div>
                        </div>
                    )}
                    {selectedPlan === 'school' && (
                         <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">School Name</label>
                            <input type="text" value={schoolName} onChange={e => setSchoolName(e.target.value)} placeholder="e.g. City High School" className="mt-1 w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg" required />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

          <div className="pt-4"><label className="flex items-center"><input id="terms" type="checkbox" checked={agreedToTerms} onChange={e => setAgreedToTerms(e.target.checked)} className="w-4 h-4 mr-2" /> <span className="text-sm">I agree to the <Link to="/terms" className="text-primary hover:underline">Terms</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.</span></label></div>
          
          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-lg text-white bg-primary hover:bg-blue-600 disabled:bg-primary/50">
            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : 'Create Account'}
          </button>
        </form>
        <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}<Link to="/login" className="font-medium text-primary hover:text-blue-600">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;