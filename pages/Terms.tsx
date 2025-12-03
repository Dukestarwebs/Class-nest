
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, FileText, CheckCircle, AlertTriangle } from 'lucide-react';

const Terms: React.FC = () => {
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
                        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText size={32} />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-poppins font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
                        <p className="text-gray-500 dark:text-gray-400">Effective Date: May 20, 2025</p>
                    </div>

                    <div className="prose dark:prose-invert max-w-none space-y-8">
                        <section>
                            <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white mb-3">1. Acceptance of Terms</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                By accessing or using Class Nest, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white mb-3 flex items-center">
                                <CheckCircle className="mr-2 text-green-500" size={20}/> 2. Accounts
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-2">
                                When you create an account with us, you must provide information that is accurate, complete, and current. Failure to do so constitutes a breach of the Terms.
                            </p>
                            <ul className="list-disc pl-6 space-y-1 text-gray-600 dark:text-gray-300">
                                <li>You are responsible for safeguarding the password that you use to access the service.</li>
                                <li>You agree not to disclose your password to any third party.</li>
                                <li>New accounts require administrator approval before access is granted.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white mb-3 flex items-center">
                                <AlertTriangle className="mr-2 text-orange-500" size={20}/> 3. User Conduct
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                You agree to use Class Nest only for lawful educational purposes. You are prohibited from:
                            </p>
                            <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                                <li>Uploading inappropriate, offensive, or illegal content.</li>
                                <li>Harassing teachers or other students via the Q&A or Feedback forms.</li>
                                <li>Attempting to access accounts or data belonging to other users.</li>
                                <li>Sharing academic materials outside the platform without permission.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white mb-3">4. Intellectual Property</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                The content provided on Class Nest (notes, videos, assignments) is the property of the educational institution and its content creators. You are granted a limited license to access and use this material for personal study only.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-white mb-3">5. Termination</h2>
                            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
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

export default Terms;
