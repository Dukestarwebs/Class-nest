
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Users, Target, Heart } from 'lucide-react';

const AboutUs: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-secondary dark:bg-gray-900 transition-colors duration-200 font-roboto text-text-primary dark:text-gray-100">
            {/* Header */}
            <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
                <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
                   <div className="bg-primary text-white p-2 rounded-lg">
                      <Book className="w-6 h-6" />
                   </div>
                  <span className="text-2xl font-poppins font-bold text-primary tracking-tight">Class Nest</span>
                </div>
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium"
                >
                    <ArrowLeft size={18} className="mr-2" /> Back to Home
                </button>
            </nav>

            <main className="container mx-auto px-6 py-12 md:py-20">
                <div className="max-w-4xl mx-auto">
                    {/* Hero Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-poppins font-bold text-gray-900 dark:text-white mb-6">Empowering Education Through Technology</h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                            Class Nest is dedicated to bridging the digital divide in modern classrooms, making learning accessible, organized, and engaging for everyone.
                        </p>
                    </div>

                    {/* Mission Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border-t-4 border-blue-500">
                            <Target className="w-12 h-12 text-blue-500 mb-4" />
                            <h3 className="text-xl font-bold mb-3 font-poppins">Our Mission</h3>
                            <p className="text-gray-600 dark:text-gray-400">To simplify the workflow between teachers and students, ensuring that focus remains on learning rather than logistics.</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border-t-4 border-green-500">
                            <Users className="w-12 h-12 text-green-500 mb-4" />
                            <h3 className="text-xl font-bold mb-3 font-poppins">Our Community</h3>
                            <p className="text-gray-600 dark:text-gray-400">We build for diverse classrooms, supporting Primary and Secondary education levels with tailored tools.</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border-t-4 border-red-500">
                            <Heart className="w-12 h-12 text-red-500 mb-4" />
                            <h3 className="text-xl font-bold mb-3 font-poppins">Our Passion</h3>
                            <p className="text-gray-600 dark:text-gray-400">Driven by the belief that every student deserves access to high-quality educational resources anytime, anywhere.</p>
                        </div>
                    </div>

                    {/* Story Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 shadow-xl mb-12 flex flex-col md:flex-row items-center gap-10">
                        <div className="md:w-1/2">
                             <div className="bg-primary/10 rounded-2xl p-6 rotate-3 transform transition-transform hover:rotate-0">
                                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80" alt="Team working" className="rounded-xl shadow-md w-full" />
                             </div>
                        </div>
                        <div className="md:w-1/2">
                            <h2 className="text-3xl font-bold font-poppins mb-4 text-gray-900 dark:text-white">Our Story</h2>
                            <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                                Class Nest began as a simple idea: what if students could access their notes as easily as they check social media?
                            </p>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                Developed for Teacher Sylvia and her students, the platform has evolved into a comprehensive Learning Management System (LMS) that handles everything from assignments and notes to video skills development and real-time announcements.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-white dark:bg-gray-800 py-8 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
                <p>© 2025 Class Nest. Built with ❤️ for Education.</p>
            </footer>
        </div>
    );
};

export default AboutUs;
