
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, MessageCircle, Users, ShieldCheck, Book } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary dark:bg-gray-900 transition-colors duration-200 font-roboto text-text-primary dark:text-gray-100 flex flex-col">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center z-10 relative">
        <div className="flex items-center space-x-3">
           <div className="bg-primary text-white p-2 rounded-lg">
              <Book className="w-6 h-6" />
           </div>
          <span className="text-2xl font-poppins font-bold text-primary tracking-tight">Class Nest</span>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-6 pt-10 pb-20 md:pt-20 md:pb-24 flex flex-col md:flex-row items-center relative">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="md:w-1/2 mb-12 md:mb-0 z-10">
          <div className="inline-flex items-center px-3 py-1 mb-6 text-xs font-bold tracking-wider text-primary uppercase bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <span className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></span>
            For Modern Education
          </div>
          <h1 className="text-5xl md:text-7xl font-poppins font-bold leading-tight mb-6 text-text-primary dark:text-white">
            The Digital <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Nest for Learning</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg leading-relaxed">
            Streamline your classroom with Class Nest. Share notes, post announcements, and answer questions in one secure, easy-to-use platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
                onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-full bg-primary text-white font-bold text-lg shadow-lg hover:bg-blue-600 hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center transform hover:-translate-y-1"
            >
                Enter Classroom <ArrowRight className="ml-2" size={20}/>
            </button>
          </div>
        </div>
        
        <div className="md:w-1/2 relative z-10 flex justify-center">
            {/* Hero Card/Image Representation */}
            <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent rounded-[2rem] transform rotate-6 opacity-50 blur-sm"></div>
                <div className="relative bg-white dark:bg-gray-800 rounded-[2rem] p-2 shadow-2xl border border-gray-100 dark:border-gray-700">
                    <div className="bg-secondary dark:bg-gray-900 rounded-[1.5rem] overflow-hidden p-6 h-80 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg mb-2">
                            <Book className="w-12 h-12 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-primary font-poppins">Class Nest</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Connect. Learn. Grow.</p>
                        </div>
                        <div className="flex gap-3 mt-4">
                             <div className="h-2 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                             <div className="h-2 w-8 bg-primary/50 rounded-full"></div>
                        </div>
                        <div className="flex gap-3">
                             <div className="h-2 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                             <div className="h-2 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                        </div>
                    </div>
                </div>
                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce" style={{ animationDuration: '3s' }}>
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                        <Users className="text-green-600 dark:text-green-400" size={20} />
                    </div>
                    <span className="font-bold text-sm">Student Connected</span>
                </div>
                 <div className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-lg flex items-center gap-3 animate-bounce" style={{ animationDuration: '4s' }}>
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                        <MessageCircle className="text-yellow-600 dark:text-yellow-400" size={20} />
                    </div>
                    <span className="font-bold text-sm">New Announcement</span>
                </div>
            </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="bg-white dark:bg-gray-800 py-20 transition-colors duration-200 flex-grow">
        <div className="container mx-auto px-6">
            <div className="text-center mb-16">
                <span className="text-primary font-bold uppercase tracking-wider text-sm">Features</span>
                <h2 className="text-3xl md:text-4xl font-poppins font-bold mt-2 mb-4 text-text-primary dark:text-white">Everything you need to succeed</h2>
                <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                    Powerful tools designed to bridge the gap between teachers and students, making education seamless.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<BookOpen className="text-white" size={24}/>}
                    title="Digital Notes Library"
                    description="Access lecture notes, PDFs, and study materials anytime, anywhere. Never miss a lesson point again."
                    color="bg-blue-500"
                />
                <FeatureCard 
                    icon={<MessageCircle className="text-white" size={24}/>}
                    title="Instant Announcements"
                    description="Stay updated with real-time notifications from your teacher. Important dates, events, and reminders at a glance."
                    color="bg-purple-500"
                />
                <FeatureCard 
                    icon={<Users className="text-white" size={24}/>}
                    title="Direct Q&A"
                    description="Ask questions directly to the teacher and get personalized answers. Learning doesn't stop at the bell."
                    color="bg-orange-500"
                />
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-gray-500 dark:text-gray-400 text-sm">
            <p className="mb-2 md:mb-0">© 2025 Class Nest. All rights reserved.</p>
            <div className="flex items-center space-x-6">
                <span className="flex items-center hover:text-primary transition-colors cursor-default"><ShieldCheck size={16} className="mr-1"/> Secure Platform</span>
                <button onClick={() => navigate('/about')} className="hover:text-primary transition-colors cursor-pointer">About Us</button>
                <button onClick={() => navigate('/privacy')} className="hover:text-primary transition-colors cursor-pointer">Privacy</button>
                <button onClick={() => navigate('/terms')} className="hover:text-primary transition-colors cursor-pointer">Terms</button>
            </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) => (
    <div className="p-8 rounded-3xl bg-secondary dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group">
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            {icon}
        </div>
        <h3 className="text-xl font-poppins font-bold mb-3 text-text-primary dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {description}
        </p>
    </div>
);

export default LandingPage;
