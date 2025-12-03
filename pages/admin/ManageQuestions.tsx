
import React, { useState, useEffect } from 'react';
import { Question } from '../../types';
import { Send, CheckCircle } from 'lucide-react';
import { getQuestions, answerQuestion } from '../../data';

const ManageQuestions: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'unanswered' | 'answered'>('unanswered');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
        const questionsList = await getQuestions();
        const sorted = questionsList.sort((a,b) => new Date(b.questionDate).getTime() - new Date(a.questionDate).getTime());
        setQuestions(sorted);
    } catch(e) {
        console.error("Error fetching questions: ", e);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleReplyChange = (questionId: string, text: string) => {
    setReplyText(prev => ({ ...prev, [questionId]: text }));
  };

  const handleSendReply = async (questionId: string) => {
    const reply = replyText[questionId];
    if (!reply || !reply.trim()) {
      alert('Reply cannot be empty.');
      return;
    }

    try {
        await answerQuestion(questionId, reply);
        await fetchQuestions();
        setReplyText(prev => {
            const newReplies = { ...prev };
            delete newReplies[questionId];
            return newReplies;
        });
    } catch (e) {
        console.error("Error sending reply: ", e);
        alert("Failed to send reply.");
    }
  };

  const unansweredQuestions = questions.filter(q => !q.isAnswered);
  const answeredQuestions = questions.filter(q => q.isAnswered);

  const renderQuestionList = (list: Question[]) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (list.length === 0) {
      return <p className="text-center text-gray-500 dark:text-gray-400 py-10">No questions in this category.</p>;
    }

    return (
      <div className="space-y-4">
        {list.map(q => (
          <div key={q.id} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg font-poppins text-text-primary dark:text-white">{q.studentName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(q.questionDate).toLocaleString()}</p>
              </div>
              {!q.isAnswered ? 
                <span className="text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 px-2 py-1 rounded-full">Pending</span> :
                <span className="text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full flex items-center"><CheckCircle size={14} className="mr-1"/> Answered</span>
              }
            </div>
            <p className="mt-3 text-gray-700 dark:text-gray-300 bg-secondary dark:bg-gray-700 p-3 rounded-lg">{q.questionText}</p>
            
            {q.isAnswered && q.answerText && (
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="font-semibold text-primary">Your Reply:</p>
                    <p className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mt-1">{q.answerText}</p>
                    {q.answerDate && <p className="text-xs text-gray-400 dark:text-gray-500 text-right mt-1">{new Date(q.answerDate).toLocaleString()}</p>}
                </div>
            )}
            
            {!q.isAnswered && (
              <div className="mt-4 flex gap-2">
                <textarea
                  value={replyText[q.id] || ''}
                  onChange={(e) => handleReplyChange(q.id, e.target.value)}
                  placeholder="Type your reply..."
                  className="flex-grow p-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-secondary dark:bg-gray-700 text-text-primary dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  rows={2}
                />
                <button
                  onClick={() => handleSendReply(q.id)}
                  className="bg-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-600 transition-opacity self-end flex items-center"
                >
                  <Send size={18} className="mr-2"/> Reply
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">Manage Questions</h1>
      
      <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-md flex space-x-2 transition-colors">
        <button 
          onClick={() => setActiveTab('unanswered')} 
          className={`flex-1 p-3 rounded-lg font-semibold transition-colors ${activeTab === 'unanswered' ? 'bg-primary text-white shadow' : 'hover:bg-secondary dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
          Unanswered <span className="ml-2 bg-white dark:bg-gray-700 text-primary dark:text-white px-2 py-0.5 rounded-full">{unansweredQuestions.length}</span>
        </button>
        <button 
          onClick={() => setActiveTab('answered')} 
          className={`flex-1 p-3 rounded-lg font-semibold transition-colors ${activeTab === 'answered' ? 'bg-primary text-white shadow' : 'hover:bg-secondary dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
        >
          Answered <span className="ml-2 bg-white dark:bg-gray-700 text-primary dark:text-white px-2 py-0.5 rounded-full">{answeredQuestions.length}</span>
        </button>
      </div>
      
      <div className="max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {activeTab === 'unanswered' ? renderQuestionList(unansweredQuestions) : renderQuestionList(answeredQuestions)}
      </div>
    </div>
  );
};

export default ManageQuestions;
