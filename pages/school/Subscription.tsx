import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collectPayment, checkPaymentStatus, getUserById, getSystemSettings } from '../../data';
import { Award, Calendar, Clock, AlertTriangle, CheckCircle, Smartphone, XCircle, ShieldCheck, RefreshCw } from 'lucide-react';

const SchoolSubscription: React.FC = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const [subscriptionFee, setSubscriptionFee] = useState<number>(300000);

    const expiryDate = user?.subscription_expiry ? new Date(user.subscription_expiry) : new Date();
    const now = new Date();
    const diffTime = expiryDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isExpired = diffDays <= 0;
    const isNearingExpiry = !isExpired && diffDays <= 3;

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await getSystemSettings();
                setSubscriptionFee(settings.schoolFee);
            } catch (e) {
                console.error(e);
            }
        };
        loadSettings();
    }, []);

    useEffect(() => {
        let interval: any;
        if (transactionId) {
            interval = setInterval(async () => {
                try {
                    const result = await checkPaymentStatus(transactionId);
                    if (result.status === 'completed') {
                        setStatusMessage('Payment Successful! Your subscription has been extended.');
                        setTransactionId(null);
                        const updated = await getUserById(user!.id);
                        if (updated) updateUser(updated);
                        clearInterval(interval);
                    } else if (result.status === 'failed') {
                        setStatusMessage('Payment Failed: ' + (result.failure_reason || 'Rejected by user'));
                        setTransactionId(null);
                        setLoading(false);
                        clearInterval(interval);
                    }
                } catch (e) {
                    console.error(e);
                }
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [transactionId, user, updateUser]);

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        
        let cleanPhone = phone.trim().replace('+', '');
        if (!cleanPhone.startsWith('256')) {
            setStatusMessage('Please enter number starting with 256');
            return;
        }

        if (cleanPhone.length !== 12) {
            setStatusMessage('Phone number must be 12 digits (format: 2567...)');
            return;
        }

        setLoading(true);
        setStatusMessage('Initiating payment... Check your phone for STK Push.');
        try {
            const txId = await collectPayment(user!.id, cleanPhone, user!.schoolName || user!.name, subscriptionFee);
            setTransactionId(txId);
        } catch (error: any) {
            setStatusMessage(error.message);
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setTransactionId(null);
        setLoading(false);
        setStatusMessage('Payment process stopped.');
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            <h1 className="text-5xl font-poppins font-bold text-white tracking-tight">School Subscription</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 {/* Account Status Card */}
                 <div className="relative bg-bg-card rounded-card p-8 shadow-2xl border border-border-main flex flex-col justify-between overflow-hidden group min-h-[320px]">
                    <div className={`absolute left-0 top-0 bottom-0 w-2 ${isExpired ? 'bg-danger' : isNearingExpiry ? 'bg-highlight' : 'bg-primary'}`}></div>
                    <div className="relative z-10 pl-2">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className={`p-3 rounded-xl ${isExpired ? 'bg-danger/10 text-danger' : isNearingExpiry ? 'bg-highlight/10 text-highlight' : 'bg-primary/10 text-primary'}`}>
                                <Calendar size={24} />
                            </div>
                            <h2 className="text-xl font-bold font-poppins text-white">Current Status</h2>
                        </div>
                        <p className="text-4xl font-poppins font-bold text-white tracking-tight">
                            {isExpired ? 'Expired' : `${diffDays} Days Left`}
                        </p>
                        <p className="text-gray-400 font-medium text-sm">
                            Valid until: {expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                         {isExpired && (
                            <div className="flex items-center text-danger mt-6 bg-danger/5 p-3 rounded-lg border border-danger/20 text-xs font-bold">
                                <AlertTriangle size={16} className="mr-2 shrink-0" />
                                Access may be restricted. Renew now.
                            </div>
                        )}
                    </div>
                </div>

                {/* Plan Details Card */}
                <div className="bg-bg-card rounded-card p-8 shadow-2xl border border-border-main flex flex-col justify-between min-h-[320px]">
                    <div>
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                                <ShieldCheck size={24} />
                            </div>
                            <h2 className="text-xl font-bold font-poppins text-white">School Pass</h2>
                        </div>
                        <div className="mb-6">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Fee Per Term</p>
                            <p className="text-4xl font-poppins font-bold text-white">UGX {subscriptionFee.toLocaleString()}</p>
                        </div>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-center text-gray-300 font-medium"><CheckCircle size={16} className="text-primary mr-3 shrink-0" /> Full School Dashboard</li>
                            <li className="flex items-center text-gray-300 font-medium"><CheckCircle size={16} className="text-primary mr-3 shrink-0" /> Unlimited Teacher & Student Accounts</li>
                            <li className="flex items-center text-gray-300 font-medium"><CheckCircle size={16} className="text-primary mr-3 shrink-0" /> Priority Platform Support</li>
                        </ul>
                    </div>
                </div>

                {/* Payment Card */}
                <div className="bg-bg-card rounded-card p-8 shadow-2xl border border-border-main flex flex-col min-h-[320px] relative">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="p-3 bg-highlight/10 text-highlight rounded-xl">
                            <Smartphone size={24} />
                        </div>
                        <h2 className="text-xl font-poppins font-bold text-white">Renew Subscription</h2>
                    </div>
                    {statusMessage && (
                        <div className={`p-3 rounded-xl mb-4 flex items-center border text-xs ${ statusMessage.includes('Successful') ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-primary/10 border-primary/30 text-blue-300'}`}>
                            <div className="shrink-0 mr-2">
                                {transactionId ? <RefreshCw className="animate-spin" size={14} /> : <CheckCircle size={14} />}
                            </div>
                            <span className="font-bold">{statusMessage}</span>
                        </div>
                    )}
                    <form onSubmit={handlePayment} className="flex flex-col flex-grow">
                        <div className="space-y-4 flex-grow">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2 ml-1">Mobile Money Number</label>
                                <input type="text" placeholder="2567..." value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 bg-bg-main border border-border-main rounded-xl outline-none focus:ring-2 focus:ring-primary text-white transition-all placeholder:text-gray-700" disabled={loading || !!transactionId} />
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 mt-auto pt-4">
                            <button type="submit" disabled={loading || !!transactionId} className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-dark transition-all flex justify-center items-center group disabled:opacity-50">
                                {loading && !transactionId ? 'Initializing...' : transactionId ? 'Waiting for PIN' : `Pay UGX ${subscriptionFee.toLocaleString()}`}
                            </button>
                            {(loading || !!transactionId) && (
                                <button type="button" onClick={handleCancel} className="w-full py-2 bg-transparent text-gray-500 font-bold rounded-xl hover:text-white text-xs uppercase tracking-widest">
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SchoolSubscription;