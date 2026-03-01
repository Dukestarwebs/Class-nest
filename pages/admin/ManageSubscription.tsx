import React, { useState, useEffect } from 'react';
import { CreditCard, Save, RefreshCw, Users, TrendingUp, AlertCircle, CheckCircle, ShieldCheck, User, Briefcase, Building } from 'lucide-react';
import { getSystemSettings, updateSystemSetting, getStudents, getAllPayments } from '../../data';

const ManageSubscription: React.FC = () => {
    const [fees, setFees] = useState({ student: 10000, teacher: 50000, school: 300000, developer: 25000 });
    const [initialFees, setInitialFees] = useState({ student: 10000, teacher: 50000, school: 300000, developer: 25000 });
    const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true);
    const [initialSubscriptionsEnabled, setInitialSubscriptionsEnabled] = useState(true);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        totalSubscribers: 0,
        activeSubscribers: 0,
        expiredSubscribers: 0,
        revenueThisMonth: 0
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const [settings, students, payments] = await Promise.all([
                getSystemSettings(),
                getStudents(),
                getAllPayments()
            ]);

            const currentFees = {
                student: settings.studentFee,
                teacher: settings.teacherFee,
                school: settings.schoolFee,
                developer: settings.developerPlanPrice
            };
            setFees(currentFees);
            setInitialFees(currentFees);
            setSubscriptionsEnabled(settings.subscriptionsEnabled);
            setInitialSubscriptionsEnabled(settings.subscriptionsEnabled);

            const now = new Date();
            const active = students.filter(s => s.subscription_expiry && new Date(s.subscription_expiry) > now).length;
            
            const thisMonth = now.getMonth();
            const thisYear = now.getFullYear();
            const monthlyRevenue = payments
                .filter(p => {
                    const pDate = new Date(p.date);
                    return p.status === 'completed' && pDate.getMonth() === thisMonth && pDate.getFullYear() === thisYear;
                })
                .reduce((sum, p) => sum + p.amount, 0);

            setStats({
                totalSubscribers: students.length,
                activeSubscribers: active,
                expiredSubscribers: students.length - active,
                revenueThisMonth: monthlyRevenue
            });
        } catch (err) {
            console.error(err);
            setError('Failed to load subscription data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSaveFees = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSuccess('');
        setError('');

        try {
            const updates = [];
            if (fees.student !== initialFees.student) {
                updates.push(updateSystemSetting('student_fee', String(fees.student)));
            }
            if (fees.teacher !== initialFees.teacher) {
                updates.push(updateSystemSetting('teacher_fee', String(fees.teacher)));
            }
            if (fees.school !== initialFees.school) {
                updates.push(updateSystemSetting('school_fee', String(fees.school)));
            }
            if (fees.developer !== initialFees.developer) {
                updates.push(updateSystemSetting('developer_plan_price', String(fees.developer)));
            }
            if (subscriptionsEnabled !== initialSubscriptionsEnabled) {
                updates.push(updateSystemSetting('subscriptions_enabled', String(subscriptionsEnabled)));
            }

            if (updates.length > 0) {
                await Promise.all(updates);
                setInitialFees(fees);
                setInitialSubscriptionsEnabled(subscriptionsEnabled);
                setSuccess('Settings updated successfully!');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setSuccess('No changes to save.');
                 setTimeout(() => setSuccess(''), 3000);
            }

        } catch (err) {
            console.error(err);
            setError('Failed to update one or more fees.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-12">
            <div className="flex justify-between items-center">
                <h1 className="text-5xl font-poppins font-bold text-white tracking-tight">Finances</h1>
                <button onClick={fetchData} className="p-3 bg-bg-card rounded-xl border border-border-main hover:bg-white/5 transition-all">
                    <RefreshCw size={20} className="text-gray-500"/>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Students" value={stats.totalSubscribers} icon={<Users size={32}/>} color="primary" />
                <StatCard title="Active Passes" value={stats.activeSubscribers} icon={<CheckCircle size={32}/>} color="green-500" />
                <StatCard title="Expired Passes" value={stats.expiredSubscribers} icon={<AlertCircle size={32}/>} color="danger" />
                <StatCard title="Revenue (MTD)" value={`UGX ${stats.revenueThisMonth.toLocaleString()}`} icon={<TrendingUp size={32}/>} color="highlight" />
            </div>

            <div className="bg-bg-card p-8 rounded-card border border-border-main shadow-2xl flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold font-poppins text-white mb-1">Global Subscriptions</h2>
                    <p className="text-gray-500">Enable or disable subscription requirements across the entire platform.</p>
                </div>
                <button 
                    type="button"
                    onClick={() => setSubscriptionsEnabled(!subscriptionsEnabled)}
                    className={`relative inline-flex h-10 w-20 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-main ${subscriptionsEnabled ? 'bg-primary' : 'bg-gray-700'}`}
                >
                    <span className={`inline-block h-8 w-8 transform rounded-full bg-white transition-transform ${subscriptionsEnabled ? 'translate-x-11' : 'translate-x-1'}`} />
                </button>
            </div>

            <form onSubmit={handleSaveFees} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-8">
                    <PlanCard 
                        icon={<User size={28}/>}
                        title="Standard Plan"
                        period="per month"
                        value={fees.student}
                        onChange={val => setFees(f => ({ ...f, student: val }))}
                    />
                    <PlanCard 
                        icon={<ShieldCheck size={28}/>}
                        title="Developer Plan"
                        period="per month"
                        value={fees.developer}
                        onChange={val => setFees(f => ({ ...f, developer: val }))}
                    />
                    <PlanCard 
                        icon={<Briefcase size={28}/>}
                        title="Teacher Plan"
                        period="per 3 months"
                        value={fees.teacher}
                        onChange={val => setFees(f => ({ ...f, teacher: val }))}
                    />
                    <PlanCard 
                        icon={<Building size={28}/>}
                        title="School Plan"
                        period="per term"
                        value={fees.school}
                        onChange={val => setFees(f => ({ ...f, school: val }))}
                    />
                </div>
                
                <div className="max-w-md mx-auto">
                    {success && (
                        <div className="p-4 rounded-2xl bg-green-500/10 text-green-400 border border-green-500/20 flex items-center font-bold text-sm animate-in fade-in slide-in-from-left-4 mb-4">
                            <CheckCircle size={18} className="mr-3"/> {success}
                        </div>
                    )}
                    {error && (
                        <div className="p-4 rounded-2xl bg-danger/10 text-danger border border-danger/20 flex items-center font-bold text-sm mb-4">
                            <AlertCircle size={18} className="mr-3"/> {error}
                        </div>
                    )}

                    <button 
                        type="submit"
                        disabled={saving}
                        className="w-full bg-primary text-white font-bold py-5 rounded-2xl hover:bg-primary-dark transition-all shadow-xl shadow-primary/25 flex justify-center items-center text-xl group disabled:opacity-50 active:scale-95"
                    >
                        {saving ? <RefreshCw size={24} className="animate-spin mr-3"/> : <Save size={24} className="mr-3 group-hover:rotate-12 transition-transform"/>}
                        Save Pricing Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }: { title: string, value: string|number, icon: React.ReactNode, color:string }) => (
    <div className={`bg-bg-card p-8 rounded-card border border-border-main shadow-2xl group hover:border-${color}/30 transition-all`}>
        <div className={`bg-${color}/10 p-4 rounded-2xl text-${color} w-fit mb-6 group-hover:scale-110 transition-transform`}>{icon}</div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-2">{title}</p>
        <p className="text-4xl font-bold text-white font-poppins">{value}</p>
    </div>
);

const PlanCard = ({ icon, title, period, value, onChange }: {icon: React.ReactNode, title: string, period: string, value: number, onChange: (v: number) => void}) => (
    <div className="bg-bg-card p-10 rounded-card border border-border-main shadow-2xl">
        <div className="flex items-center space-x-4 mb-10">
            <div className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20">{icon}</div>
            <div>
                <h2 className="text-2xl font-bold font-poppins text-white">{title}</h2>
                <p className="text-gray-500 font-medium">{period}</p>
            </div>
        </div>
        <div>
            <label className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 ml-1">
                Rate (UGX)
            </label>
            <div className="relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 font-bold text-xl">UGX</div>
                <input 
                    type="number"
                    value={value}
                    onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                    className="w-full pl-24 pr-8 py-5 bg-bg-main border-2 border-border-main rounded-2xl focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none text-3xl font-poppins font-bold text-white transition-all shadow-inner"
                />
            </div>
        </div>
    </div>
);

export default ManageSubscription;