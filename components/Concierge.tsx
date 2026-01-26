
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Loader2, ShieldCheck } from 'lucide-react';
import { getConciergeResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { auth } from '../services/firebase';

const Concierge: React.FC = () => {
  const user = auth.currentUser;
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Guest';

  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'model', 
      text: `Namaste ${userName}! Welcome to Hotel Shotabdi. I am your AI concierge. How can I assist you with your stay in Sylhet today?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // We pass a personalized context to the AI
      const personalizedPrompt = user 
        ? `[User is logged in as ${userName}]. ${userMessage}` 
        : userMessage;
        
      const responseText = await getConciergeResponse(messages, personalizedPrompt);
      setMessages(prev => [...prev, { role: 'model', text: responseText || "I'm sorry, I'm having trouble connecting right now." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "I apologize, but I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto py-8 px-6 h-[85vh] flex flex-col">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center p-2 bg-hotel-primary/10 rounded-xl mb-3">
          <Sparkles className="text-hotel-primary" size={20} />
        </div>
        <h2 className="text-3xl font-serif text-gray-900 mb-1">AI Concierge</h2>
        <div className="flex items-center justify-center gap-2">
          <p className="text-sm text-gray-500">Ask about rooms, facilities, or local attractions.</p>
          {user && (
            <span className="flex items-center gap-1 text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full uppercase tracking-widest border border-green-100">
              <ShieldCheck size={10} /> Secure Profile Linked
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl shadow-red-50 border border-gray-100 flex flex-col overflow-hidden relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth no-scrollbar"
        >
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                  msg.role === 'user' ? 'bg-hotel-primary text-white' : 'bg-hotel-muted text-hotel-primary border border-hotel-primary/10'
                }`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-[1.5rem] text-[13px] leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-hotel-primary text-white rounded-tr-none' 
                    : 'bg-hotel-muted text-gray-700 rounded-tl-none border border-gray-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-4 max-w-[80%]">
                <div className="w-8 h-8 rounded-xl bg-hotel-muted text-hotel-primary border border-hotel-primary/10 flex items-center justify-center animate-pulse">
                  <Bot size={16} />
                </div>
                <div className="p-4 rounded-[1.5rem] bg-hotel-muted text-gray-400 flex items-center gap-2 border border-gray-100">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-[11px] font-bold italic uppercase tracking-widest">Consulting Registry...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-50">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={user ? `What can I do for you, ${userName}?` : "Ask your AI concierge..."}
              className="w-full bg-gray-50 border border-gray-100 focus:border-hotel-primary focus:bg-white outline-none rounded-2xl py-4 pl-6 pr-16 shadow-inner text-sm transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="absolute right-2 p-3 bg-hotel-primary text-white rounded-xl hover:bg-hotel-secondary transition-all disabled:opacity-50 shadow-lg shadow-red-100 active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Concierge;
