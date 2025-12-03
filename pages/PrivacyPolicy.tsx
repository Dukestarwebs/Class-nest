
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Shield, Lock, Eye } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
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

            <main className="container mx-auto px-6 py-12">
                <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 md:p-12 rounded-3xl shadow-lg">
                    <div className="text-center mb-12">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield size={32} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-poppins font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
                        <p className="text-gray-500 dark:text-gray-400">Last updated: May 20, 2025</p>
                    </div>

                    <div className="prose dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white mb-3 flex items-center">
                                <Eye className="mr-2 text-primary" size={20}/> 1. Information We Collect
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                Class Nest collects information necessary to provide educational services. This includes:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                                <li>**Personal Identification:** Name, Class Level, Email address, and Username.</li>
                                <li>**Educational Data:** Notes accessed, assignments submitted, questions asked, and feedback provided.</li>
                                <li>**Media:** Profile pictures and uploaded assignment files.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white mb-3 flex items-center">
                                <Lock className="mr-2 text-primary" size={20}/> 2. How We Use Your Information
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                The information we collect is used solely for educational purposes within the Class Nest platform:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                                <li>To provide access to class-specific notes and assignments.</li>
                                <li>To facilitate communication between teachers and students via announcements and Q&A.</li>
                                <li>To verify student identity and class placement during registration.</li>
                                <li>To send important notifications regarding account approval and assignments.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white mb-3">3. Data Security</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                We prioritize the security of your data. Class Nest uses industry-standard encryption and secure authentication protocols to ensure that student data is protected and only accessible by authorized users. We do not sell or share personal data with third parties.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white mb-3">4. Student Privacy</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                As an educational tool, we strictly adhere to guidelines protecting student privacy. Students can only view content relevant to their class level or content marked as "Public" by the administrator. Direct messages or questions are private between the student and the administrator.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white mb-3">5. Contact Us</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                If you have any questions about this Privacy Policy, please only use the "Help & Feedback" section within the application.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <footer className="bg-white dark:bg-gray-800 py-8 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-12">
                <p>© 2025 Class Nest. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default PrivacyPolicy;
