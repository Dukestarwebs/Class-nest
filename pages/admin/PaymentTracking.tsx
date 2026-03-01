
import React, { useState, useEffect } from 'react';
import { Payment } from '../../types';
import { getAllPayments, getWalletBalance, deletePayment } from '../../data';
import { RefreshCcw, DollarSign, CheckCircle, XCircle, Clock, Wallet, ArrowUpRight, Trash2 } from 'lucide-react';

const PaymentTracking: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [payData, balData] = await Promise.all([
                getAllPayments(),
                getWalletBalance()
            ]);
            setPayments(payData);
            setWalletBalance(balData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const bal = await getWalletBalance();
            setWalletBalance(bal);
            const pays = await getAllPayments();
            setPayments(pays);
        } finally {
            setTimeout(() => setSyncing(false), 1000);
        }
    };

    const handleDelete = async (id: string) => {
        // Confirmation removed for immediate deletion as requested
        try {
            await deletePayment(id);
            setPayments(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete the record.");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">Payment Tracking</h1>
                <button 
                    onClick={handleSync} 
                    disabled={syncing}
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center transition-all disabled:opacity-50"
                >
                    <RefreshCcw size={18} className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
                    {syncing ? 'Syncing...' : 'Sync Wallet'}
                </button>
            </div>

            {/* Wallet Balance Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-gradient-to-br from-primary to-blue-700 p-8 rounded-2xl shadow-xl text-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Wallet size={120} />
                    </div>
                    <div className="relative z-10">
                        <p className="text-blue-100 font-medium mb-1 flex items-center">
                            <Wallet size={16} className="mr-2" /> JulyPay Wallet Balance
                        </p>
                        <h2 className="text-4xl font-bold font-poppins mb-6">
                            UGX {walletBalance.toLocaleString()}
                        </h2>
                        <div className="flex items-center text-sm bg-white/10 w-fit px-3 py-1 rounded-full border border-white/20">
                            <ArrowUpRight size={14} className="mr-1" /> Available for Payout
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 flex flex-col justify-center">
                    <h3 className="text-lg font-bold mb-4 flex items-center dark:text-white">
                        <DollarSign size={20} className="mr-2 text-green-500" /> Payment Summary
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-secondary dark:bg-gray-700 p-4 rounded-xl">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Success</p>
                            <p className="text-2xl font-bold text-green-500">{payments.filter(p => p.status === 'completed').length}</p>
                        </div>
                        <div className="bg-secondary dark:bg-gray-700 p-4 rounded-xl">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">Processing</p>
                            <p className="text-2xl font-bold text-yellow-500">{payments.filter(p => p.status === 'processing').length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-4 font-bold text-gray-600 dark:text-gray-300">Date</th>
                                <th className="px-6 py-4 font-bold text-gray-600 dark:text-gray-300">Student</th>
                                <th className="px-6 py-4 font-bold text-gray-600 dark:text-gray-300">Transaction ID</th>
                                <th className="px-6 py-4 font-bold text-gray-600 dark:text-gray-300">Amount</th>
                                <th className="px-6 py-4 font-bold text-gray-600 dark:text-gray-300">Status</th>
                                <th className="px-6 py-4 font-bold text-gray-600 dark:text-gray-300 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-20">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mx-auto"></div>
                                    <p className="mt-4 text-gray-500">Loading payments...</p>
                                </td></tr>
                            ) : payments.length > 0 ? payments.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{new Date(p.date).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-medium dark:text-gray-200">{p.user_name || 'N/A'}</td>
                                    <td className="px-6 py-4 text-xs font-mono text-gray-400">{p.transaction_id}</td>
                                    <td className="px-6 py-4 font-bold text-primary">UGX {p.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center text-sm font-semibold">
                                            {p.status === 'completed' && <><CheckCircle size={16} className="text-green-500 mr-2" /> <span className="text-green-600">Completed</span></>}
                                            {p.status === 'failed' && <><XCircle size={16} className="text-red-500 mr-2" /> <span className="text-red-600">Failed</span></>}
                                            {p.status === 'processing' && <><Clock size={16} className="text-yellow-500 mr-2 animate-pulse" /> <span className="text-yellow-600">Processing</span></>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => handleDelete(p.id)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                            title="Delete Log Entry"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="text-center py-20 text-gray-500">No payment transactions found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentTracking;
