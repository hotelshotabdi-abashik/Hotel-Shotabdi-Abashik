
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, User, Bot, Sparkles, Loader2, ShieldCheck, 
  MessageSquare, Clock, AlertTriangle, ChevronLeft, Search,
  CheckCircle2, Info
} from 'lucide-react';
import { 
  db, auth, ref, onValue, push, set, update, 
  createNotification, OWNER_EMAIL, get 
} from '../services/firebase';
import { HelpDexMessage, ChatSession, UserProfile } from '../types';

interface HelpDexProps {
  profile: UserProfile | null;
}

const HelpDex: React.FC<HelpDexProps> = ({ profile }) => {
  const user = auth.currentUser;
  const isAdmin = user?.email === OWNER_EMAIL;
  
  const [messages, setMessages] = useState<HelpDexMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(isAdmin ? null : user?.uid || null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cooldown logic for guests
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Admin: Load all active sessions
  useEffect(() => {
    if (!isAdmin) return;
    const sessionsRef = ref(db, 'help_dex/active_chats');
    const unsub = onValue(sessionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val()) as ChatSession[];
        setSessions(data.sort((a, b) => b.lastTimestamp - a.lastTimestamp));
      } else {
        setSessions([]);
      }
    });
    return () => unsub();
  }, [isAdmin]);

  // Load messages for the active conversation
  useEffect(() => {
    if (!activeUserId) {
      setMessages([]);
      return;
    }
    const msgsRef = ref(db, `help_dex/messages/${activeUserId}`);
    const unsub = onValue(msgsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val()) as HelpDexMessage[];
        setMessages(data.sort((a, b) => a.timestamp - b.timestamp));
        
        // Reset unread count if admin is viewing this chat
        if (isAdmin) {
          update(ref(db, `help_dex/active_chats/${activeUserId}`), { unreadCount: 0 });
        }
      } else {
        setMessages([]);
      }
    });
    return () => unsub();
  }, [activeUserId, isAdmin]);

  const handleSend = async () => {
    if (!input.trim() || !user || !activeUserId || loading) return;
    if (!isAdmin && cooldown > 0) return;

    setLoading(true);
    const text = input.trim();
    setInput('');

    try {
      const msgRef = push(ref(db, `help_dex/messages/${activeUserId}`));
      const timestamp = Date.now();
      
      const newMessage: HelpDexMessage = {
        id: msgRef.key!,
        senderId: user.uid,
        senderName: isAdmin ? 'Registry Admin' : (profile?.legalName || user.displayName || 'Guest'),
        senderPhoto: user.photoURL || '',
        text,
        timestamp,
        role: isAdmin ? 'owner' : 'guest'
      };

      await set(msgRef, newMessage);

      // Update Session Overview
      if (!isAdmin) {
        // GUEST SENDING MESSAGE
        const currentRef = ref(db, `help_dex/active_chats/${user.uid}`);
        const snapshot = await get(currentRef);
        const currentUnread = (snapshot.exists() ? snapshot.val().unreadCount : 0) + 1;
        
        const sessionData: Partial<ChatSession> = {
          userId: user.uid,
          userName: profile?.legalName || user.displayName || 'Unverified Guest',
          userPhoto: user.photoURL || '',
          lastMessage: text,
          lastTimestamp: timestamp,
          unreadCount: currentUnread
        };

        await update(currentRef, sessionData);
        setCooldown(60); // 1 minute anti-spam
      } else {
        // ADMIN SENDING MESSAGE
        // We update the session without overwriting the guest's name/photo in the list
        await update(ref(db, `help_dex/active_chats/${activeUserId}`), {
          lastMessage: text,
          lastTimestamp: timestamp,
          unreadCount: 0 // Admin viewing/replying resets unread
        });
      }

      // Create Notification
      await createNotification(isAdmin ? activeUserId : 'hotelshotabdiabashik@gmail.com', {
        title: isAdmin ? 'New Registry Message' : 'Help Dex Inquiry',
        message: text,
        type: 'chat_message'
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = sessions.filter(s => 
    (s.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.lastMessage || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-10 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-300 mb-6">
          <MessageSquare size={40} />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Help Dex Login</h2>
        <p className="text-sm text-gray-400 max-w-xs font-medium">Please authorize your account to access our priority live assistance hub.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-88px)] md:h-[85vh] flex overflow-hidden bg-white border-t border-gray-100 animate-fade-in">
      
      {/* Sidebar: Chat List (Admin Only) */}
      {isAdmin && (
        <div className={`w-full md:w-80 border-r border-gray-100 flex-col bg-gray-50/50 ${activeUserId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 bg-white border-b border-gray-100">
             <h2 className="text-lg font-serif font-black text-gray-900 mb-4">Help Dex Sessions</h2>
             <div className="relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="Search inquiries..." 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold outline-none focus:bg-white focus:border-hotel-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => (
                <button 
                  key={session.userId} 
                  onClick={() => setActiveUserId(session.userId)}
                  className={`w-full p-6 text-left border-b border-gray-50 transition-all flex gap-4 relative group ${activeUserId === session.userId ? 'bg-white shadow-inner' : 'hover:bg-white'}`}
                >
                  <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 shadow-sm ring-2 ring-white">
                    <img src={session.userPhoto || `https://ui-avatars.com/api/?name=${session.userName}&background=random`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                       <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-tight truncate">{session.userName || 'Unknown Guest'}</h4>
                       <span className="text-[8px] font-bold text-gray-300 shrink-0">{new Date(session.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium truncate italic">{session.lastMessage}</p>
                  </div>
                  {session.unreadCount > 0 && (
                    <div className="absolute right-4 bottom-4 w-5 h-5 bg-hotel-primary text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-bounce">
                      {session.unreadCount}
                    </div>
                  )}
                  {activeUserId === session.userId && <div className="absolute left-0 top-4 bottom-4 w-1 bg-hotel-primary rounded-r-full"></div>}
                </button>
              ))
            ) : (
              <div className="p-10 text-center opacity-30">
                 <Bot size={32} className="mx-auto mb-3" />
                 <p className="text-[9px] font-black uppercase tracking-widest">No active sessions</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-white ${isAdmin && !activeUserId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {!activeUserId ? (
           <div className="text-center opacity-20 p-20 select-none">
              <MessageSquare size={64} className="mx-auto mb-6" />
              <h3 className="text-2xl font-serif font-black uppercase tracking-widest">Select a Resident Inquiry</h3>
              <p className="text-sm font-bold mt-2">Manage live assistance and registry queries from this panel.</p>
           </div>
        ) : (
          <>
            {/* Header */}
            <div className="px-6 py-4 md:px-10 md:py-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <button onClick={() => setActiveUserId(null)} className="md:hidden p-2 text-gray-400"><ChevronLeft /></button>
                )}
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-hotel-primary/5 flex items-center justify-center text-hotel-primary shrink-0 shadow-inner">
                   <MessageSquare size={20} />
                </div>
                <div>
                   <h3 className="text-base font-black text-gray-900 leading-none">
                      {isAdmin ? sessions.find(s => s.userId === activeUserId)?.userName : 'Registry Assistant'}
                   </h3>
                   <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-[9px] font-black text-green-600 uppercase tracking-widest">Active Connection</span>
                   </div>
                </div>
              </div>
              {!isAdmin && (
                <div className="hidden lg:flex items-center gap-2 bg-hotel-primary/5 text-hotel-primary px-4 py-2 rounded-xl border border-hotel-primary/10">
                   <ShieldCheck size={14} />
                   <span className="text-[9px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
                </div>
              )}
            </div>

            {/* Message Pane */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 no-scrollbar bg-gray-50/20">
               {messages.length === 0 && (
                 <div className="max-w-xs mx-auto text-center space-y-4 py-10 opacity-40">
                    <Info size={32} className="mx-auto text-hotel-primary" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] leading-relaxed">
                       How can we assist you today? Please describe your query regarding bookings, facilities, or registry status.
                    </p>
                 </div>
               )}
               {messages.map((msg) => {
                 const isOwn = msg.senderId === user.uid;
                 return (
                   <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`max-w-[85%] md:max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                        <div className={`flex items-center gap-3 mb-2 px-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                           <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                             {msg.role === 'owner' ? 'Registry Admin' : isOwn ? 'You' : msg.senderName.split(' ')[0]}
                           </span>
                           <span className="text-[8px] text-gray-300 font-bold">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className={`p-5 rounded-[1.8rem] text-[13px] leading-relaxed shadow-sm ring-1 ring-black/5 ${
                          isOwn 
                          ? 'bg-hotel-primary text-white rounded-tr-none' 
                          : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                   </div>
                 );
               })}
            </div>

            {/* Input Bar */}
            <div className="p-6 md:p-8 bg-white border-t border-gray-100">
               {!isAdmin && cooldown > 0 && (
                 <div className="mb-4 flex items-center justify-center gap-3 bg-red-50 text-hotel-primary p-3 rounded-xl border border-red-100 animate-fade-in">
                    <AlertTriangle size={14} className="animate-bounce" />
                    <p className="text-[9px] font-black uppercase tracking-widest">Anti-Spam active: Wait {cooldown}s to send next message</p>
                 </div>
               )}
               <div className="relative group flex items-center gap-3">
                  <input 
                    type="text" 
                    placeholder={cooldown > 0 && !isAdmin ? "Cooling down..." : "Type your message..."}
                    className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-6 pr-14 text-sm focus:bg-white focus:border-hotel-primary outline-none transition-all focus:ring-4 focus:ring-hotel-primary/5 disabled:opacity-50"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={!isAdmin && cooldown > 0}
                  />
                  <button 
                    onClick={handleSend}
                    disabled={loading || (!isAdmin && cooldown > 0) || !input.trim()}
                    className="p-4 bg-hotel-primary text-white rounded-2xl hover:bg-hotel-secondary transition-all disabled:opacity-30 shadow-xl shadow-red-100 active:scale-95 flex items-center justify-center shrink-0"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                  </button>
               </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HelpDex;
