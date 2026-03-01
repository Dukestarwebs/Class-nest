import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ChatMessage } from '../types';
import { sendMessage, getMessages } from '../data';
import { Send, Smile, Paperclip, MoreVertical, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatRoomProps {
    classLevel: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ classLevel }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const load = async () => {
            const msgs = await getMessages(classLevel);
            setMessages(msgs);
        };
        load();
        const interval = setInterval(load, 3000);
        return () => clearInterval(interval);
    }, [classLevel]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputText.trim() || !user) return;

        const newMsg: Omit<ChatMessage, 'id'> = {
            senderId: user.id,
            senderName: user.name,
            text: inputText,
            role: user.role,
            timestamp: new Date().toISOString(),
        };

        await sendMessage(classLevel, newMsg);
        setInputText('');
        const msgs = await getMessages(classLevel);
        setMessages(msgs);
    };

    return (
        <div className="flex flex-col h-full bg-secondary border border-border-main rounded-card overflow-hidden shadow-2xl relative">
            {/* Chat Header */}
            <div className="bg-bg-card p-6 flex items-center justify-between shadow-lg border-b border-border-main z-10">
                <div className="flex items-center">
                    <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-bold mr-4 shadow-lg shadow-primary/20">
                        {classLevel}
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-lg font-poppins">{classLevel} Learning Community</h3>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-[0.2em]">Secure Class Node</p>
                    </div>
                </div>
                <button className="text-gray-500 hover:text-white transition-colors p-2 rounded-full hover:bg-white/5">
                    <MoreVertical size={20}/>
                </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth pattern-bg bg-[#0B0F14]">
                <AnimatePresence>
                    {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-600 uppercase tracking-[0.3em] font-bold text-xs opacity-50">
                            Class channel opened. Start learning.
                        </div>
                    ) : messages.map((msg) => {
                        const isMe = msg.senderId === user?.id;
                        return (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={msg.id} 
                                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] p-4 shadow-xl relative ${
                                    isMe 
                                        ? 'bg-primary text-white rounded-t-2xl rounded-bl-2xl' 
                                        : 'bg-bg-card text-gray-100 rounded-t-2xl rounded-br-2xl border border-border-main'
                                }`}>
                                    {!isMe && (
                                        <p className="text-[9px] font-bold text-highlight mb-1 uppercase tracking-widest">
                                            {msg.senderName} • {msg.role}
                                        </p>
                                    )}
                                    <p className="text-sm md:text-base leading-relaxed font-medium">{msg.text}</p>
                                    <div className="flex justify-end items-center gap-1 mt-2">
                                        <span className={`text-[8px] font-bold uppercase ${isMe ? 'text-white/60' : 'text-gray-500'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {isMe && <CheckCheck size={12} className="text-highlight" />}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="bg-bg-card p-6 border-t border-border-main flex items-center gap-3">
                <button type="button" className="text-gray-500 hover:text-primary transition-colors p-2"><Smile size={24}/></button>
                <button type="button" className="text-gray-500 hover:text-primary transition-colors p-2"><Paperclip size={24}/></button>
                <input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type message to class..." 
                    className="flex-1 bg-bg-main border border-border-main text-white py-4 px-6 rounded-2xl outline-none focus:ring-2 focus:ring-primary/50 text-sm shadow-inner transition-all placeholder:text-gray-700"
                />
                <button 
                    type="submit" 
                    className="bg-primary hover:bg-primary-dark text-white p-4 rounded-2xl shadow-xl shadow-primary/20 transition-all active:scale-90"
                >
                    <Send size={20} />
                </button>
            </form>

            <style>{`
                .pattern-bg {
                    background-image: url("https://www.transparenttextures.com/patterns/dark-matter.png");
                    background-repeat: repeat;
                }
            `}</style>
        </div>
    );
};

export default ChatRoom;