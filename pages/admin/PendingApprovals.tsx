
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { CheckCircle, XCircle, UserPlus, Trash2, Mail } from 'lucide-react';
import { getPendingStudents, approveUser, removeUser } from '../../data';
import emailjs from '@emailjs/browser';

// --- EMAILJS CONFIGURATION ---
// Replace these with your actual keys from emailjs.com
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
        const users = await getPendingStudents();
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
          // Only attempt to send if keys are configured to prevent errors in demo mode
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
                  console.log("Approval email sent to " + user.email);
              } catch (emailError) {
                  console.error("Failed to send email:", emailError);
                  alert(`User approved, but email failed to send. Check console for details.`);
              }
          } else {
              console.log("EmailJS Template ID not set. Email not sent.");
          }

          // 3. Update UI
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
        <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">New Registrants</h1>
        {TEMPLATE_ID === 'YOUR_TEMPLATE_ID' && (
            <div className="bg-orange-100 text-orange-800 p-3 rounded-lg text-sm border border-orange-200">
                <strong>Setup Required:</strong> The Service ID is set, but you must replace <code>TEMPLATE_ID</code> in <code>pages/admin/PendingApprovals.tsx</code> with your Student Approval Template ID.
            </div>
        )}
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-colors duration-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 flex items-center">
            <UserPlus className="mr-2 text-primary" /> Pending Approvals
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-100 dark:border-gray-700">
                <th className="py-3 px-4 font-poppins font-semibold text-gray-600 dark:text-gray-400">Name</th>
                <th className="py-3 px-4 font-poppins font-semibold text-gray-600 dark:text-gray-400">Username</th>
                <th className="py-3 px-4 font-poppins font-semibold text-gray-600 dark:text-gray-400">Email</th>
                <th className="py-3 px-4 font-poppins font-semibold text-gray-600 dark:text-gray-400">Class</th>
                <th className="py-3 px-4 font-poppins font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                    </td>
                </tr>
              ) : pendingUsers.length > 0 ? pendingUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-secondary dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-text-primary dark:text-gray-200">{user.name}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300">{user.username}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-sm">{user.email}</td>
                  <td className="py-3 px-4">
                     <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-900">
                        {user.classLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex justify-end space-x-2">
                        <button 
                            onClick={() => handleApprove(user)}
                            disabled={processingId === user.id}
                            className={`inline-flex items-center justify-center font-medium rounded-lg text-sm px-3 py-2 transition-all duration-200 border 
                                ${processingId === user.id 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white border-green-200 dark:border-green-900 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-700 dark:hover:text-white'
                                }`}
                            title="Approve and Send Email"
                        >
                            {processingId === user.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-1"></div>
                            ) : (
                                <CheckCircle size={16} className="mr-1" />
                            )}
                            Approve
                        </button>
                        <button 
                            onClick={() => handleReject(user.id)}
                            disabled={processingId === user.id}
                            className="inline-flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-medium rounded-lg text-sm px-3 py-2 transition-all duration-200 border border-red-200 dark:border-red-900 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-700 dark:hover:text-white disabled:opacity-50"
                            title="Reject"
                        >
                            <XCircle size={16} className="mr-1" /> Reject
                        </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400 italic">No pending registrations.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovals;
