
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSystemSettings } from '../data';
import { Clock, ShieldAlert, Lock, Book, ArrowLeft } from 'lucide-react';

const MaintenancePage: React.FC = () => {
    const navigate = useNavigate();
    const [endTime, setEndTime] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);
    const [isMaintenanceOver, setIsMaintenanceOver] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            const settings = await getSystemSettings();
            
            // Check logic: If Mode OFF or Time Passed, go to home
            const now = new Date();
            const end = settings.maintenanceEndTime ? new Date(settings.maintenanceEndTime) : null;
            const isReallyActive = settings.maintenanceMode && (!end || now < end);

            if (!isReallyActive) {
                navigate('/');
            } else {
                setEndTime(settings.maintenanceEndTime);
            }
        };
        fetchSettings();
    }, [navigate]);

    useEffect(() => {
        if (!endTime) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(endTime).getTime();
            const distance = end - now;

            if (distance < 0) {
                clearInterval(interval);
                setIsMaintenanceOver(true);
                setTimeLeft(null);
                // Optional: Auto redirect when time hits 0
                // navigate('/'); 
            } else {
                const days = Math.floor(distance / (1000 * 60 * 60 * 24));
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);
                setTimeLeft({ days, hours, minutes, seconds });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-poppins">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px]"></div>
            </div>

            <div className="z-10 max-w-2xl w-full text-center">
                <div className="mb-8 flex justify-center">
                    <div className="bg-white/10 p-6 rounded-full border-4 border-white/20 shadow-2xl backdrop-blur-md">
                        <Lock size={64} className="text-accent" />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    System Maintenance
                </h1>

                <p className="text-xl text-gray-300 mb-8 leading-relaxed bg-black/30 p-6 rounded-2xl border border-white/10">
                    The app is under Development and is being improved. <br/>
                    Please wait until the timer ends to come back and try to login again.
                </p>

                {timeLeft && (
                    <div className="grid grid-cols-4 gap-4 mb-12">
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                            <span className="block text-4xl font-bold font-mono text-accent">{timeLeft.days}</span>
                            <span className="text-xs uppercase tracking-wider text-gray-400">Days</span>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                            <span className="block text-4xl font-bold font-mono text-accent">{timeLeft.hours}</span>
                            <span className="text-xs uppercase tracking-wider text-gray-400">Hours</span>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                            <span className="block text-4xl font-bold font-mono text-accent">{timeLeft.minutes}</span>
                            <span className="text-xs uppercase tracking-wider text-gray-400">Mins</span>
                        </div>
                        <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                            <span className="block text-4xl font-bold font-mono text-accent">{timeLeft.seconds}</span>
                            <span className="text-xs uppercase tracking-wider text-gray-400">Secs</span>
                        </div>
                    </div>
                )}

                {isMaintenanceOver && (
                    <div className="mb-8">
                        <div className="bg-green-500/20 text-green-300 p-4 rounded-xl border border-green-500/50 mb-4 inline-flex items-center">
                            <Clock className="mr-2" /> Maintenance should be complete.
                        </div>
                        <button 
                            onClick={() => navigate('/login')} 
                            className="block w-full max-w-xs mx-auto bg-primary hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105"
                        >
                            Try Login Now
                        </button>
                    </div>
                )}

                <div className="flex flex-col items-center gap-4 mb-10">
                    {!isMaintenanceOver && (
                        <button 
                            onClick={() => window.location.reload()}
                            className="text-gray-400 hover:text-white transition-colors flex items-center justify-center text-sm"
                        >
                            <Clock size={14} className="mr-2" /> Check Status
                        </button>
                    )}
                    
                    <button 
                        onClick={() => navigate('/')}
                        className="flex items-center justify-center text-white bg-white/10 hover:bg-white/20 px-6 py-2 rounded-full transition-all border border-white/20 backdrop-blur-sm"
                    >
                        <ArrowLeft size={16} className="mr-2" /> Back to Home
                    </button>
                </div>

                <div className="mt-8 text-sm text-gray-500 border-t border-white/10 pt-6">
                    <p className="font-mono">classnest@2025 - Dukestar Developers</p>
                </div>
            </div>

            {/* Admin Backdoor */}
            <div className="absolute bottom-4 right-4">
                <button 
                    onClick={() => navigate('/login?admin=true')} 
                    className="text-gray-700 hover:text-gray-500 text-xs opacity-50 hover:opacity-100"
                >
                    Admin Access
                </button>
            </div>
        </div>
    );
};

export default MaintenancePage;
