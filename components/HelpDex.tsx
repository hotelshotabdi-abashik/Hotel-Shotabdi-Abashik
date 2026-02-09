import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, User, Bot, Sparkles, Loader2, ShieldCheck, 
  MessageSquare, Clock, ChevronLeft, Search,
  CheckCircle2, MoreVertical, Mail, UserCheck
} from 'lucide-react';
import { 
  db, auth, ref, onValue, push, set, update, 
  createNotification, OWNER_EMAIL, get 
} from '../services/firebase';
import { HelpDexMessage, ChatSession, UserProfile } from '../types';
import { LOGO_ICON_URL } from '../constants';

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

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeUserId]);

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
        id: String(msgRef.key!),
        senderId: String(user.uid),
        senderName: isAdmin ? 'Registry Admin' : String(profile?.legalName || user.displayName || 'Guest'),
        senderPhoto: String(user.photoURL || ''),
        text: String(text),
        timestamp,
        role: isAdmin ? 'owner' : 'guest'
      };

      await set(msgRef, newMessage);

      if (!isAdmin) {
        const currentRef = ref(db, `help_dex/active_chats/${user.uid}`);
        const snapshot = await get(currentRef);
        const currentUnread = (snapshot.exists() ? (snapshot.val().unreadCount || 0) : 0) + 1;
        
        await update(currentRef, {
          userId: String(user.uid),
          userName: String(profile?.legalName || user.displayName || 'Guest'),
          userEmail: String(user.email || ''),
          userPhoto: String(user.photoURL || ''),
          lastMessage: String(text),
          lastTimestamp: timestamp,
          unreadCount: currentUnread
        });
        setCooldown(60); 
      } else {
        await update(ref(db, `help_dex/active_chats/${activeUserId}`), {
          lastMessage: String(text),
          lastTimestamp: timestamp,
          unreadCount: 0 
        });
      }

      await createNotification(isAdmin ? activeUserId : OWNER_EMAIL, {
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
    String(s.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(s.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-10 text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center text-gray-300 mb-6">
          <MessageSquare size={40} />
        </div>
        <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tight">Access Assistance</h2>
        <p className="text-sm text-gray-400 max-w-xs font-medium">Please authorize your account to connect with our registry assistants.</p>
      </div>
    );
  }

  const activeSession = sessions.find(s => s.userId === activeUserId);

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-72px)] md:h-[calc(100vh-88px)] flex overflow-hidden bg-white animate-fade-in relative">
      
      {isAdmin && (
        <div className={`w-full md:w-96 border-r border-gray-100 flex-col bg-white shrink-0 z-20 ${activeUserId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-6 pb-4">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Support Inbox</h2>
                <div className="p-2 bg-hotel-primary/10 text-hotel-primary rounded-xl">
                  <UserCheck size={18} />
                </div>
             </div>
             <div className="relative">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="Search name or email..." 
                  className="w-full bg-gray-100 border-none rounded-2xl py-3.5 pl-11 pr-4 text-[13px] font-medium outline-none focus:ring-2 focus:ring-hotel-primary/10 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar py-2">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => (
                <button 
                  key={session.userId} 
                  onClick={() => setActiveUserId(session.userId)}
                  className={`w-full px-5 py-4 text-left transition-all flex gap-4 relative group mx-auto max-w-[94%] mb-1 rounded-3xl ${activeUserId === session.userId ? 'bg-hotel-primary/5 shadow-inner' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 shadow-sm relative border-2 border-white ring-1 ring-gray-100 p-0.5">
                    <img 
                      src={session.userPhoto || `https://ui-avatars.com/api/?name=${session.userName}&background=E53935&color=fff`} 
                      className="w-full h-full object-cover rounded-full" 
                      alt={session.userName}
                    />
                    <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-baseline mb-0.5">
                       <h4 className={`text-[14px] tracking-tight truncate ${session.unreadCount > 0 || activeUserId === session.userId ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                         {String(session.userName || 'Guest')}
                       </h4>
                       <span className="text-[9px] font-bold text-gray-400 shrink-0 ml-2">
                         {new Date(session.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                       <p className={`text-[11px] truncate leading-tight ${session.unreadCount > 0 ? 'font-black text-gray-900' : 'text-gray-400 font-medium'}`}>
                         {String(session.lastMessage)}
                       </p>
                       <p className="text-[9px] text-hotel-primary font-black truncate tracking-tight uppercase opacity-50">{String(session.userEmail)}</p>
                    </div>
                    {session.unreadCount > 0 && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 bg-hotel-primary text-white text-[8px] font-black flex items-center justify-center rounded-full shrink-0 shadow-lg shadow-red-100">
                        {session.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-10 text-center opacity-20 mt-10">
                 <MessageSquare size={48} className="mx-auto mb-4" />
                 <p className="text-[11px] font-black uppercase tracking-widest">No matching registry found</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`flex-1 flex flex-col bg-white h-full relative ${isAdmin && !activeUserId ? 'hidden md:flex items-center justify-center bg-gray-50/20' : 'flex'}`}>
        {!activeUserId ? (
           <div className="text-center select-none animate-fade-in px-10">
              <div className="w-24 h-24 flex items-center justify-center mx-auto mb-8 p-4">
                <img src={LOGO_ICON_URL} className="w-full h-full object-contain" alt="Hotel Logo" />
              </div>
              <h3 className="text-2xl font-serif font-black text-gray-900 tracking-tight">Concierge Desktop</h3>
              <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto font-medium">Select a resident from the inbox to begin live high-priority support.</p>
           </div>
        ) : (
          <>
            <div className="h-[72px] md:h-20 px-4 md:px-8 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md shrink-0 sticky top-0 z-30">
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <button 
                    onClick={() => setActiveUserId(null)} 
                    className="md:hidden p-2 -ml-2 text-gray-400 hover:text-hotel-primary transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                )}
                <div className="relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-100 p-0.5">
                    <img 
                      src={isAdmin ? (activeSession?.userPhoto || `https://ui-avatars.com/api/?name=${activeSession?.userName}`) : LOGO_ICON_URL} 
                      className={`w-full h-full ${isAdmin ? 'object-cover rounded-full' : 'object-contain'}`} 
                    />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="min-w-0">
                   <h3 className="text-[15px] font-black text-gray-900 leading-none truncate">
                      {isAdmin ? String(activeSession?.userName || 'Resident') : 'Registry Assistant'}
                   </h3>
                   <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-bold text-green-600 tracking-tight">Active Support Tunnel</span>
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden lg:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl text-gray-400 text-[10px] font-black uppercase tracking-widest border border-gray-100">
                   <ShieldCheck size={14} className="text-green-500" /> Secure
                </div>
                <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 md:px-10 md:py-12 space-y-2 no-scrollbar bg-white">
               {messages.length === 0 && (
                 <div className="max-w-xs mx-auto text-center space-y-4 py-12">
                    <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6 p-3">
                      <img src={LOGO_ICON_URL} className="w-full h-full object-contain" alt="Logo" />
                    </div>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] leading-relaxed">
                       You are now connected with the Hotel Shotabdi concierge team.
                    </p>
                 </div>
               )}
               
               {messages.map((msg, idx) => {
                 const isOwn = msg.senderId === user.uid;
                 const prevMsg = messages[idx - 1];
                 const isSameSender = prevMsg?.senderId === msg.senderId;
                 
                 return (
                   <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isSameSender ? 'mt-1' : 'mt-6'}`}>
                      <div className={`max-w-[78%] md:max-w-[65%] flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isOwn && !isSameSender ? (
                          <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 mt-auto border border-gray-100 shadow-sm p-0.5">
                            <img src={msg.senderPhoto || `https://ui-avatars.com/api/?name=${msg.senderName}`} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          !isOwn && <div className="w-9 shrink-0"></div>
                        )}

                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                          <div className={`p-4 px-6 text-[14.5px] leading-relaxed shadow-sm ring-1 ring-black/5 ${
                            isOwn 
                            ? 'bg-hotel-primary text-white rounded-[1.5rem] rounded-tr-none' 
                            : 'bg-gray-100 text-gray-800 rounded-[1.5rem] rounded-tl-none'
                          }`}>
                            {String(msg.text)}
                          </div>
                          {!isSameSender && (
                            <span className="text-[9px] font-black text-gray-300 mt-2 px-1 uppercase tracking-tighter">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                   </div>
                 );
               })}
            </div>

            <div className="p-4 md:p-8 bg-white border-t border-gray-50">
               {!isAdmin && cooldown > 0 && (
                 <div className="mb-4 flex items-center justify-center gap-2 bg-red-50 text-hotel-primary py-2 px-4 rounded-xl border border-red-100 animate-fade-in">
                    <Clock size={12} className="animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Team busy: {cooldown}s</p>
                 </div>
               )}
               <div className="relative flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder={cooldown > 0 && !isAdmin ? "Locked..." : "Type your query..."}
                      className="w-full bg-gray-100 border-none rounded-[1.8rem] py-4 px-7 text-[15px] focus:bg-gray-50 focus:ring-2 focus:ring-hotel-primary/20 outline-none transition-all disabled:opacity-50 font-medium"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      disabled={!isAdmin && cooldown > 0}
                    />
                  </div>
                  <button 
                    onClick={handleSend}
                    disabled={loading || (!isAdmin && cooldown > 0) || !input.trim()}
                    className="p-4 bg-hotel-primary text-white rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 shadow-xl shadow-red-100 shrink-0"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={20} />}
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