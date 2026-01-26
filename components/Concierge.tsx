
import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Loader2 } from 'lucide-react';
import { getConciergeResponse } from '../services/geminiService';
import { ChatMessage } from '../types';

const Concierge: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Namaste! Welcome to Hotel Shotabdi. I am your AI concierge. How can I assist you with your stay in Sylhet today?' }
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
      const responseText = await getConciergeResponse(messages, userMessage);
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
        <p className="text-sm text-gray-500">Ask about rooms, facilities, or local attractions in Sylhet.</p>
      </div>

      <div className="flex-1 bg-white rounded-[1.5rem] shadow-lg border border-gray-100 flex flex-col overflow-hidden relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth no-scrollbar"
        >
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-hotel-primary text-white' : 'bg-gray-100 text-hotel-primary'
                }`}>
                  {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-hotel-primary text-white rounded-tr-none' 
                    : 'bg-hotel-accent text-gray-700 rounded-tl-none border border-gray-50'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <div className="w-7 h-7 rounded-full bg-gray-100 text-hotel-primary flex items-center justify-center animate-pulse">
                  <Bot size={14} />
                </div>
                <div className="p-3 rounded-2xl bg-hotel-accent text-gray-400 flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-[10px] font-medium italic">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything..."
              className="w-full bg-white border border-gray-200 focus:border-hotel-primary outline-none rounded-xl py-3 pl-5 pr-14 shadow-sm text-sm transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={loading}
              className="absolute right-2 p-2.5 bg-hotel-primary text-white rounded-lg hover:bg-hotel-secondary transition-colors disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Concierge;
