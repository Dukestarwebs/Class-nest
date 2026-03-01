
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, Book, Users, Briefcase, CheckCircle } from 'lucide-react';
import { getSystemSettings } from '../data';

const PricingPage: React.FC = () => {
    const navigate = useNavigate();
    const [prices, setPrices] = useState({ student: '10,000', teacher: '100,000', school: '300,000' });
    const [subscriptionsEnabled, setSubscriptionsEnabled] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrices = async () => {
            try {
                const settings = await getSystemSettings();
                setPrices({
                    student: settings.studentFee.toLocaleString(),
                    teacher: settings.teacherFee.toLocaleString(),
                    school: settings.schoolFee.toLocaleString(),
                });
                setSubscriptionsEnabled(settings.subscriptionsEnabled);
            } catch (error) {
                console.error("Failed to load prices", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPrices();
    }, []);

    const plans = [
        {
            name: "School Plan",
            price: prices.school,
            period: "per term",
            icon: <Book size={32} />,
            color: "blue",
            features: [
                "Full School Dashboard",
                "Class Management",
                "Teacher & Student Profiles",
                "Attendance & Scheduling",
                "Administration History",
                "Student & School Analytics",
                "Revenue & Salary Management"
            ],
            path: "/register?plan=school"
        },
        {
            name: "Student Plan",
            price: prices.student,
            period: "per month",
            subtext: `UGX ${(parseInt(prices.student.replace(/,/g, '')) * 3).toLocaleString()} per term`,
            icon: <Users size={32} />,
            color: "green",
            features: [
                "Access to All Notes",
                "Assignment Submissions",
                "Personal Performance Tracking",
                "Class Chat & Q&A",
                "Announcements",
                "Personal Settings",
                "Help & Feedback"
            ],
            path: "/register?plan=student"
        },
        {
            name: "Coaching Teacher Plan",
            price: prices.teacher,
            period: "per 3 months",
            icon: <Briefcase size={32} />,
            color: "purple",
            features: [
                "My Classes Dashboard",
                "Course Material Upload",
                "Manage My Students",
                "Student Analytics",
                "Personal Schedule",
                "Class Communication",
                "Profile Management"
            ],
            path: "/register?plan=teacher"
        }
    ];

    return (
        <div className="min-h-screen bg-bg-main text-white">
            <nav className="container mx-auto px-6 py-8 flex justify-between items-center">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                  <div className="bg-primary text-white p-2 rounded-lg"><Book className="w-7 h-7" /></div>
                  <span className="text-2xl font-poppins font-bold text-primary">Class Nest</span>
                </div>
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center text-gray-400 hover:text-white transition-colors font-medium group"
                >
                    <div className="p-2 rounded-full group-hover:bg-white/10 mr-2 transition-colors"><ArrowLeft size={20} /></div>
                    Back to Home
                </button>
            </nav>

            <main className="container mx-auto px-6 py-12">
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-poppins font-bold mb-6">Choose Your Plan</h1>
                    <p className="text-lg text-gray-400 mb-8">
                        Flexible pricing for every need. Empower your learning journey or your entire institution with Class Nest.
                    </p>
                    {!subscriptionsEnabled && (
                        <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-green-400 font-bold inline-flex items-center gap-3">
                            <CheckCircle size={24} />
                            <span>Subscriptions are currently disabled. Registration is free for all users!</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {loading ? Array(3).fill(0).map((_, i) => (
                         <div key={i} className="bg-bg-card border-2 border-border-main rounded-card p-8 animate-pulse">
                            <div className="h-8 w-1/2 bg-gray-700 rounded mb-6"></div>
                            <div className="h-12 w-3/4 bg-gray-700 rounded mb-2"></div>
                             <div className="h-4 w-1/4 bg-gray-700 rounded mb-8"></div>
                             <div className="space-y-4 mb-8">
                                <div className="h-4 bg-gray-700 rounded"></div>
                                <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-700 rounded w-4/6"></div>
                             </div>
                             <div className="h-12 w-full bg-gray-700 rounded-xl mt-auto"></div>
                         </div>
                    )) : plans.map((plan, index) => (
                        <div key={index} className={`bg-bg-card border-2 border-border-main rounded-card p-8 flex flex-col hover:border-primary transition-all hover:scale-105 hover:shadow-2xl`}>
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`bg-primary/10 p-3 rounded-xl text-primary`}>
                                    {plan.icon}
                                </div>
                                <h2 className="text-2xl font-poppins font-bold">{plan.name}</h2>
                            </div>
                            
                            <div className="mb-6">
                                <span className="text-5xl font-bold font-poppins">UGX {plan.price}</span>
                                <span className="text-gray-400 ml-2">{plan.period}</span>
                                {plan.subtext && <p className="text-sm text-gray-500 mt-1">{plan.subtext}</p>}
                            </div>

                            <ul className="space-y-4 mb-8 flex-grow">
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-start">
                                        <Check className="w-5 h-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button 
                                onClick={() => navigate(plan.path)}
                                className="w-full mt-auto py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20"
                            >
                                {subscriptionsEnabled ? 'Get Started' : 'Join for Free'}
                            </button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default PricingPage;
