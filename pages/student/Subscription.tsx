
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collectPayment, checkPaymentStatus, getUserById, getSystemSettings, isSubscriptionActive } from '../../data';
import { CreditCard, Calendar, Clock, AlertTriangle, CheckCircle, Smartphone, XCircle, ShieldCheck, RefreshCw, ArrowLeft } from 'lucide-react';

const StudentSubscription: React.FC = () => {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [transactionId, setTransactionId] = useState<string | null>(null);
    const [subscriptionFee, setSubscriptionFee] = useState<number>(10000);
    const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true);

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
                setSubscriptionFee(settings.studentFee);
                setSubscriptionsEnabled(settings.subscriptionsEnabled);
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
            const txId = await collectPayment(user!.id, cleanPhone, user!.name, subscriptionFee);
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
        <div className="min-h-screen bg-bg-main">
            {/* Sticky Header with Back Button */}
            <header className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 z-10 px-4 py-3 mb-8">
                <div className="container mx-auto max-w-7xl flex items-center justify-between">
                    <button 
                        onClick={() => navigate('/student/dashboard')}
                        className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium group"
                    >
                        <div className="p-2 rounded-full group-hover:bg-gray-100 dark:group-hover:bg-gray-800 mr-2 transition-colors">
                            <ArrowLeft size={20} />
                        </div>
                        Back to Dashboard
                    </button>
                </div>
            </header>

            <div className="max-w-7xl mx-auto space-y-12 px-8 pb-16">
                <div className="flex flex-col gap-4">
                    <h1 className="text-4xl md:text-5xl font-poppins font-bold text-white tracking-tight">Subscription Plan</h1>
                    <p className="text-gray-400 text-lg">Manage your access to the Class Nest learning materials.</p>
                    {!subscriptionsEnabled && (
                        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl text-green-400 font-bold flex items-center gap-3">
                            <CheckCircle size={20} />
                            Global subscriptions are currently disabled. You have full access to the platform!
                        </div>
                    )}
                    {user?.plan === 'developer' && (
                        <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-2xl text-purple-400 font-bold flex items-center gap-3">
                            <ShieldCheck size={20} />
                            You are on the Developer Plan. Enjoy unlimited access!
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Account Status Card */}
                    <div className="relative bg-[#131C2B] rounded-[2.5rem] p-8 shadow-2xl border border-gray-800 flex flex-col justify-between overflow-hidden group min-h-[320px]">
                        <div className={`absolute left-0 top-0 bottom-0 w-3 ${isExpired ? 'bg-red-500' : isNearingExpiry ? 'bg-orange-500' : 'bg-primary'} shadow-[4px_0_15px_rgba(0,0,0,0.3)]`}></div>
                        
                        <div className="relative z-10 pl-2">
                            <div className="flex items-center space-x-4 mb-8">
                                <div className={`p-4 rounded-2xl ${isExpired ? 'bg-red-500/10 text-red-500' : isNearingExpiry ? 'bg-orange-500/10 text-orange-500' : 'bg-primary/10 text-primary'}`}>
                                    <Calendar size={32} />
                                </div>
                                <h2 className="text-2xl font-bold font-poppins text-white">Current Status</h2>
                            </div>
                            
                            <div className="space-y-3">
                                <p className="text-5xl font-poppins font-bold text-white tracking-tight">
                                    {isExpired ? 'Expired' : `${diffDays} Days Left`}
                                </p>
                                <p className="text-gray-400 font-medium text-lg">
                                    Valid until: {expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                                
                                {isExpired ? (
                                    <div className="flex items-center text-red-400 mt-6 bg-red-500/5 p-4 rounded-2xl border border-red-500/20 text-sm font-bold">
                                        <AlertTriangle size={18} className="mr-3 shrink-0" />
                                        Access Restricted. Renew now.
                                    </div>
                                ) : isNearingExpiry ? (
                                    <div className="flex items-center text-orange-400 mt-6 bg-orange-500/5 p-4 rounded-2xl border border-orange-500/20 text-sm font-bold animate-pulse">
                                        <Clock size={18} className="mr-3 shrink-0" />
                                        Expires soon. Top up to avoid gaps.
                                    </div>
                                ) : (
                                    <div className="flex items-center text-primary mt-6 bg-primary/5 p-4 rounded-2xl border border-primary/20 text-sm font-bold">
                                        <CheckCircle size={18} className="mr-3 shrink-0" />
                                        Account Active & Secured.
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all"></div>
                    </div>

                    {/* Plan Details Card */}
                    <div className="bg-[#131C2B] rounded-[2.5rem] p-8 shadow-2xl border border-gray-800 flex flex-col justify-between min-h-[320px]">
                        <div>
                            <div className="flex items-center space-x-4 mb-8">
                                <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-400">
                                    <ShieldCheck size={32} />
                                </div>
                                <h2 className="text-2xl font-bold font-poppins text-white">Class Pass</h2>
                            </div>
                            
                            <div className="mb-10">
                                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-2">Monthly Subscription</p>
                                <p className="text-4xl font-poppins font-bold text-white">UGX {subscriptionFee.toLocaleString()}</p>
                            </div>

                            <ul className="space-y-5">
                                <li className="flex items-center text-gray-300 font-medium">
                                    <CheckCircle size={18} className="text-primary mr-4 shrink-0" />
                                    30 Days Full Platform Access
                                </li>
                                <li className="flex items-center text-gray-300 font-medium">
                                    <CheckCircle size={18} className="text-primary mr-4 shrink-0" />
                                    Unlimited Note Downloads
                                </li>
                                <li className="flex items-center text-gray-300 font-medium">
                                    <CheckCircle size={18} className="text-primary mr-4 shrink-0" />
                                    Priority Teacher Response
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Payment Card */}
                    <div className="bg-[#131C2B] rounded-[2.5rem] p-8 shadow-2xl border border-gray-800 flex flex-col min-h-[320px] relative">
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="p-4 bg-orange-500/10 text-orange-400 rounded-2xl">
                                <Smartphone size={32} />
                            </div>
                            <h2 className="text-2xl font-poppins font-bold text-white">Instant Top Up</h2>
                        </div>
                        
                        {statusMessage && (
                            <div className={`p-4 rounded-2xl mb-6 flex items-center border animate-in fade-in slide-in-from-top-4 duration-300 text-sm ${
                                statusMessage.includes('Successful') 
                                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                                : 'bg-primary/10 border-primary/30 text-primary-dark dark:text-blue-300'
                            }`}>
                                <div className="shrink-0 mr-3">
                                    {transactionId ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                </div>
                                <span className="font-bold">{statusMessage}</span>
                            </div>
                        )}

                        <form onSubmit={handlePayment} className="flex flex-col flex-grow">
                            <div className="space-y-6 flex-grow flex flex-col">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-3 ml-1">
                                        Mobile Money Number
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="2567..." 
                                            value={phone}
                                            onChange={e => setPhone(e.target.value)}
                                            className="w-full px-6 py-4 bg-[#0B1120] border-2 border-gray-800 rounded-[1.2rem] focus:ring-4 focus:ring-primary/20 focus:border-primary outline-none text-xl font-poppins text-white transition-all placeholder:text-gray-700"
                                            disabled={loading || !!transactionId}
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 font-bold uppercase text-[10px] tracking-widest pointer-events-none">UG</div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 mt-3 ml-1 font-medium">Format: 2567XXXXXXXX</p>
                                </div>
                                
                                <div className="flex flex-col gap-3 mt-auto pt-6">
                                    <button 
                                        type="submit" 
                                        disabled={loading || !!transactionId}
                                        className="w-full bg-primary text-white font-bold py-5 rounded-[1.2rem] hover:bg-primary-dark transition-all shadow-xl shadow-blue-500/20 flex justify-center items-center text-lg group disabled:opacity-50 active:scale-95"
                                    >
                                        {loading && !transactionId ? (
                                            <RefreshCw size={24} className="animate-spin mr-3" />
                                        ) : (
                                            <CreditCard size={24} className="mr-3" />
                                        )}
                                        {loading && !transactionId ? 'Initializing...' : transactionId ? 'Waiting for PIN' : `Pay UGX ${subscriptionFee.toLocaleString()}`}
                                    </button>

                                    {(loading || !!transactionId) && (
                                        <button 
                                            type="button"
                                            onClick={handleCancel}
                                            className="w-full py-4 bg-transparent text-gray-500 font-bold rounded-[1.2rem] hover:text-white hover:bg-gray-800 transition-all flex justify-center items-center text-xs uppercase tracking-widest"
                                        >
                                            <XCircle size={14} className="mr-2" /> Cancel Payment
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                
                <p className="text-center text-[10px] font-bold text-gray-700 uppercase tracking-[0.4em] pt-12 border-t border-gray-800/50">
                    © 2025 Class Nest — Secure Learning Node
                </p>
            </div>
        </div>
    );
};

export default StudentSubscription;
