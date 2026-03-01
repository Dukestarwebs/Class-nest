
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { CheckCircle, XCircle, UserPlus, Trash2, Mail, Info } from 'lucide-react';
import { getPendingUsers, approveUser, removeUser } from '../../data';
import emailjs from '@emailjs/browser';

// --- EMAILJS CONFIGURATION ---
const SERVICE_ID = 'service_g370l0d'; 
const TEMPLATE_ID: string = 'template_g4i5me4'; 
const PUBLIC_KEY = 'f218z1gwOWB04vw7r';

const PendingApprovals: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
        const users = await getPendingUsers();
        setPendingUsers(users);
    } catch (error) {
        console.error("Failed to fetch pending users", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (user: User) => {
      setProcessingId(user.id);
      
      try {
          // 1. Approve in Database
          await approveUser(user.id);

          // 2. Send Email Notification
          if (TEMPLATE_ID !== 'YOUR_TEMPLATE_ID') {
              try {
                  await emailjs.send(
                      SERVICE_ID,
                      TEMPLATE_ID,
                      {
                          to_name: user.name,
                          to_email: user.email, 
                          app_url: window.location.origin + '/#/login',
                          message: 'Your account has been successfully approved.'
                      },
                      PUBLIC_KEY
                  );
              } catch (emailError) {
                  console.error("Failed to send email:", emailError);
              }
          }

          setPendingUsers(prev => prev.filter(u => u.id !== user.id));

      } catch (error) {
          console.error("Failed to approve user", error);
          alert("Failed to approve user. Please try again.");
          fetchPending();
      } finally {
          setProcessingId(null);
      }
  };

  const handleReject = async (id: string) => {
      if(!window.confirm("Are you sure you want to reject and delete this registration?")) return;
      
      setProcessingId(id);
      try {
          await removeUser(id);
          setPendingUsers(prev => prev.filter(u => u.id !== id));
      } catch (error) {
          console.error("Failed to reject user", error);
          fetchPending();
      } finally {
          setProcessingId(null);
      }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">Pending Approvals</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-colors duration-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 flex items-center">
            <UserPlus className="mr-2 text-primary" /> New Registrants
        </h2>
        
        <div className="space-y-4">
            {loading ? (
                 <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                </div>
            ) : pendingUsers.length > 0 ? pendingUsers.map(user => (
                <div key={user.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                        <div>
                             <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-lg text-text-primary dark:text-white">{user.name}</h3>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${user.role === 'teacher' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {user.role}
                                </span>
                             </div>
                             <p className="text-sm text-gray-600 dark:text-gray-300">Username: {user.username}</p>
                             <p className="text-sm text-gray-600 dark:text-gray-300">Email: {user.email}</p>
                             {user.role === 'student' && <p className="text-sm text-gray-600 dark:text-gray-300">Class: {user.classLevel}</p>}
                             
                             {user.role === 'teacher' && (
                                 <div className="mt-3 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md text-sm">
                                     <div className="mb-2">
                                        <p className="font-bold text-gray-500 dark:text-gray-400 text-xs uppercase">Expertise</p>
                                        <p className="text-gray-800 dark:text-gray-200">{user.expertise || 'N/A'}</p>
                                     </div>
                                     <div className="mb-2">
                                        <p className="font-bold text-gray-500 dark:text-gray-400 text-xs uppercase">About</p>
                                        <p className="text-gray-800 dark:text-gray-200 italic">"{user.bio || 'N/A'}"</p>
                                     </div>
                                     <div>
                                        <p className="font-bold text-gray-500 dark:text-gray-400 text-xs uppercase">Reason for Joining</p>
                                        <p className="text-gray-800 dark:text-gray-200">"{user.reasonForJoining || 'N/A'}"</p>
                                     </div>
                                 </div>
                             )}
                        </div>
                        
                        <div className="flex items-center gap-2 self-start">
                             <button 
                                onClick={() => handleApprove(user)}
                                disabled={processingId === user.id}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center font-bold text-sm disabled:opacity-50"
                            >
                                {processingId === user.id ? 'Processing...' : <><CheckCircle size={16} className="mr-2" /> Approve</>}
                            </button>
                            <button 
                                onClick={() => handleReject(user.id)}
                                disabled={processingId === user.id}
                                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center font-bold text-sm border border-red-200 disabled:opacity-50"
                            >
                                <XCircle size={16} className="mr-2" /> Reject
                            </button>
                        </div>
                    </div>
                </div>
            )) : (
                 <p className="text-center py-8 text-gray-500 dark:text-gray-400 italic">No pending approvals.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default PendingApprovals;
