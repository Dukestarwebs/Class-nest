
import React, { useState } from 'react';
import { Mail, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import emailjs from '@emailjs/browser';

// EMAILJS CONFIGURATION
// Use the same Service ID and Public Key as before
const SERVICE_ID = 'service_g370l0d'; 
const PUBLIC_KEY = 'f218z1gwOWB04vw7r';

// REPLACE THIS with the new Template ID you created for Invitations
const TEMPLATE_ID_INVITE = 'template_hqk3ozr'; 

const Invitations: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  // Helper to safely extract error message
  const getErrorMessage = (err: any) => {
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    
    // EmailJS specific error object often has a 'text' property
    if (err && typeof err === 'object') {
        if ('text' in err) {
            return typeof err.text === 'object' ? JSON.stringify(err.text) : String(err.text);
        }
        if ('message' in err) {
             return typeof err.message === 'object' ? JSON.stringify(err.message) : String(err.message);
        }
    }

    // Fallback: try to stringify the object
    try {
        const json = JSON.stringify(err);
        if (json === '{}') return "An unknown error occurred.";
        return json;
    } catch {
        return "Failed to send invitation. Please check your connection.";
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim spaces to ensure valid email format
    const cleanEmail = email.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
        setStatus('error');
        setMessage('Please enter a valid email address.');
        return;
    }

    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
        if ((TEMPLATE_ID_INVITE as string) === 'YOUR_INVITE_TEMPLATE_ID') {
            throw new Error("Please update the TEMPLATE_ID_INVITE in the code with your EmailJS Template ID.");
        }

        // Use the production URL for invitations
        const inviteLink = 'https://classnest1.netlify.app/#/register';

        console.log("Sending invitation to:", cleanEmail);

        await emailjs.send(
            SERVICE_ID,
            TEMPLATE_ID_INVITE,
            {
                to_email: cleanEmail,   // This must match {{to_email}} in EmailJS Dashboard > Template > To Email
                invite_link: inviteLink,
                from_name: 'Class Nest Admin'
            },
            PUBLIC_KEY
        );

        setStatus('success');
        setMessage(`Invitation sent successfully to ${cleanEmail}`);
        setEmail('');
    } catch (error: any) {
        console.error("Failed to send invite:", error);
        setStatus('error');
        setMessage(getErrorMessage(error));
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">User Invitations</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Invitation Form */}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md transition-colors duration-200">
            <div className="flex items-center mb-6">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full mr-4 text-primary">
                    <Mail size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Send Invitation</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Invite new users via email</p>
                </div>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Recipient Email Address
                    </label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. student@example.com"
                        className="w-full px-4 py-3 bg-secondary dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-800 dark:text-white placeholder-gray-400"
                        required
                    />
                </div>

                {status === 'success' && (
                    <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 p-4 rounded-lg flex items-center">
                        <CheckCircle size={20} className="mr-2 flex-shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                {status === 'error' && (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 p-4 rounded-lg flex items-center break-words">
                        <AlertTriangle size={20} className="mr-2 flex-shrink-0" />
                        <span>{message}</span>
                    </div>
                )}

                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/20"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <Send size={18} className="mr-2" /> Send Invitation
                        </>
                    )}
                </button>
            </form>
        </div>

        {/* Info / Guide */}
        <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-8 text-white shadow-xl flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-4">How it works</h3>
            <ul className="space-y-4">
                <li className="flex items-start">
                    <div className="bg-white/20 p-1 rounded-full mr-3 mt-1">
                        <CheckCircle size={14} />
                    </div>
                    <p className="text-blue-50">Admin enters the email address of a student or teacher.</p>
                </li>
                <li className="flex items-start">
                    <div className="bg-white/20 p-1 rounded-full mr-3 mt-1">
                        <CheckCircle size={14} />
                    </div>
                    <p className="text-blue-50">The system sends an automated email containing a direct link to the Registration page.</p>
                </li>
                <li className="flex items-start">
                    <div className="bg-white/20 p-1 rounded-full mr-3 mt-1">
                        <CheckCircle size={14} />
                    </div>
                    <p className="text-blue-50">The user registers, and their account appears in your "New Registrants" tab for approval.</p>
                </li>
            </ul>
        </div>

      </div>
    </div>
  );
};

export default Invitations;
