
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { approveUser, removeUser, getUserById } from '../../data';
import emailjs from '@emailjs/browser';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

// Configuration (Must match Register.tsx and PendingApprovals.tsx)
const SERVICE_ID = 'service_g370l0d'; 
const TEMPLATE_ID_STUDENT: string = 'template_g4i5me4'; 
const PUBLIC_KEY = 'f218z1gwOWB04vw7r';

const QuickAction: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing request...');

    useEffect(() => {
        const processAction = async () => {
            const searchParams = new URLSearchParams(location.search);
            const userId = searchParams.get('id');
            const action = searchParams.get('act');

            if (!userId || !action) {
                setStatus('error');
                setMessage('Invalid link parameters.');
                return;
            }

            try {
                const user = await getUserById(userId);

                if (!user) {
                    setStatus('error');
                    setMessage('User not found. They may have already been deleted.');
                    return;
                }

                if (action === 'approve') {
                    if (user.isApproved) {
                        setStatus('success');
                        setMessage('User is already approved.');
                        return;
                    }

                    await approveUser(userId);
                    
                    // Send Confirmation Email to Student
                    if (TEMPLATE_ID_STUDENT !== 'YOUR_TEMPLATE_ID') {
                         try {
                            await emailjs.send(
                                SERVICE_ID,
                                TEMPLATE_ID_STUDENT,
                                {
                                    to_name: user.name,
                                    to_email: user.email,
                                    app_url: window.location.origin + '/#/login',
                                    message: 'Your account has been successfully approved.'
                                },
                                PUBLIC_KEY
                            );
                        } catch (e) {
                            console.error("Email send failed", e);
                        }
                    } else {
                        console.warn("EmailJS Template ID not set. Confirmation email not sent.");
                    }

                    setStatus('success');
                    setMessage(`Successfully approved ${user.name}. A confirmation email has been sent.`);
                } else if (action === 'reject') {
                    await removeUser(userId);
                    setStatus('success');
                    setMessage(`Successfully rejected and removed ${user.name}.`);
                } else {
                    setStatus('error');
                    setMessage('Unknown action.');
                }

            } catch (error) {
                console.error(error);
                setStatus('error');
                setMessage('An error occurred while processing the request.');
            }
        };

        processAction();
    }, [location]);

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            {status === 'loading' && (
                <>
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                    <p className="text-xl font-poppins text-gray-600 dark:text-gray-300">{message}</p>
                </>
            )}

            {status === 'success' && (
                <>
                    <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold font-poppins text-gray-800 dark:text-white mb-2">Success!</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
                    <button 
                        onClick={() => navigate('/admin/dashboard')}
                        className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                    >
                        Go to Dashboard
                    </button>
                </>
            )}

            {status === 'error' && (
                <>
                    <XCircle className="w-20 h-20 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold font-poppins text-gray-800 dark:text-white mb-2">Error</h2>
                    <p className="text-red-600 dark:text-red-400 mb-6">{message}</p>
                    <button 
                        onClick={() => navigate('/admin/dashboard')}
                        className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300"
                    >
                        Go Home
                    </button>
                </>
            )}
        </div>
    );
};

export default QuickAction;
