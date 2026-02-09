import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, User, Bot, Sparkles, Loader2, ShieldCheck, 
  MessageSquare, Clock, ChevronLeft, Search,
  CheckCircle2, MoreVertical, Mail, UserCheck, Check, CheckCheck
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

  // Load Sessions for Admin
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

  // Load Messages & Mark as Seen
  useEffect(() => {
    if (!activeUserId) {
      setMessages([]);
      return;
    }
    const msgsRef = ref(db, `help_dex/messages/${activeUserId}`);
    const unsub = onValue(msgsRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        const data = Object.values(rawData) as HelpDexMessage[];
        setMessages(data.sort((a, b) => a.timestamp - b.timestamp));
        
        // Mark Incoming Messages as Seen
        const updates: any = {};
        Object.keys(rawData).forEach(key => {
          const msg = rawData[key] as HelpDexMessage;
          // If I'm reading someone else's message and it's currently 'sent'
          if (msg.senderId !== user?.uid && msg.status !== 'seen') {
            updates[`help_dex/messages/${activeUserId}/${key}/status`] = 'seen';
          }
        });
        
        if (Object.keys(updates).length > 0) {
          update(ref(db), updates);
        }

        if (isAdmin) {
          update(ref(db, `help_dex/active_chats/${activeUserId}`), { unreadCount: 0 });
        }
      } else {
        setMessages([]);
      }
    });
    return () => unsub();
  }, [activeUserId, isAdmin, user?.uid]);

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
        role: isAdmin ? 'owner' : 'guest',
        status: 'sent'
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
        <div className={`w-full md:w-[400px] border-r border-gray-100 flex-col bg-white shrink-0 z-20 ${activeUserId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-8 pb-6 bg-white sticky top-0 z-10">
             <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight">Help Dex</h2>
                   <p className="text-[10px] text-hotel-primary font-black uppercase tracking-widest mt-1">Registry Support Hub</p>
                </div>
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                  <UserCheck size={20} />
                </div>
             </div>
             <div className="relative group">
                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-hotel-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search residents..." 
                  className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-semibold outline-none focus:ring-4 focus:ring-hotel-primary/5 focus:bg-white transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-4 space-y-1">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => (
                <button 
                  key={session.userId} 
                  onClick={() => setActiveUserId(session.userId)}
                  className={`w-full p-5 text-left transition-all flex gap-5 relative group rounded-[2rem] border ${activeUserId === session.userId ? 'bg-hotel-primary/5 border-hotel-primary/10 shadow-sm' : 'hover:bg-gray-50 border-transparent'}`}
                >
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden shadow-xl relative border-4 border-white ring-1 ring-gray-100 p-0.5">
                      <img 
                        src={session.userPhoto || `https://ui-avatars.com/api/?name=${session.userName}&background=E53935&color=fff`} 
                        className="w-full h-full object-cover rounded-[1.2rem]" 
                        alt={session.userName}
                      />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-[3px] border-white rounded-full shadow-md animate-pulse"></div>
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-baseline mb-1">
                       <h4 className={`text-[15px] tracking-tight truncate ${session.unreadCount > 0 || activeUserId === session.userId ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                         {String(session.userName || 'Resident')}
                       </h4>
                       <span className="text-[10px] font-bold text-gray-400 shrink-0 ml-2">
                         {new Date(session.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                       <p className={`text-xs truncate leading-tight ${session.unreadCount > 0 ? 'font-black text-gray-900' : 'text-gray-400 font-medium'}`}>
                         {String(session.lastMessage)}
                       </p>
                       <p className="text-[9px] text-gray-300 font-bold truncate tracking-tight uppercase mt-0.5">{String(session.userEmail)}</p>
                    </div>
                    {session.unreadCount > 0 && (
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 bg-hotel-primary text-white text-[10px] font-black flex items-center justify-center rounded-full shrink-0 shadow-lg shadow-red-200 animate-bounce">
                        {session.unreadCount}
                      </div>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-20 text-center opacity-20">
                 <MessageSquare size={64} className="mx-auto mb-6" />
                 <p className="text-xs font-black uppercase tracking-[0.3em]">Registry Empty</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className={`flex-1 flex flex-col bg-white h-full relative ${isAdmin && !activeUserId ? 'hidden md:flex items-center justify-center bg-gray-50/10' : 'flex'}`}>
        {!activeUserId ? (
           <div className="text-center select-none animate-fade-in px-12">
              <div className="w-28 h-28 flex items-center justify-center mx-auto mb-10 p-5 bg-white rounded-[2.5rem] shadow-2xl shadow-red-50 border border-gray-50">
                <img src={LOGO_ICON_URL} className="w-full h-full object-contain" alt="Hotel Logo" />
              </div>
              <h3 className="text-3xl font-serif font-black text-gray-900 tracking-tight">Registry Portal</h3>
              <p className="text-sm text-gray-400 mt-4 max-w-sm mx-auto font-medium leading-relaxed">Select a resident from the vault to begin high-priority synchronization.</p>
           </div>
        ) : (
          <>
            <div className="h-20 md:h-24 px-6 md:px-12 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-xl shrink-0 sticky top-0 z-30">
              <div className="flex items-center gap-5">
                {isAdmin && (
                  <button 
                    onClick={() => setActiveUserId(null)} 
                    className="md:hidden p-3 -ml-4 text-gray-400 hover:text-hotel-primary transition-colors"
                  >
                    <ChevronLeft size={28} />
                  </button>
                )}
                <div className="relative">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-[1.2rem] md:rounded-[1.5rem] overflow-hidden border-4 border-white shadow-lg ring-1 ring-gray-100 p-0.5">
                    <img 
                      src={isAdmin ? (activeSession?.userPhoto || `https://ui-avatars.com/api/?name=${activeSession?.userName}`) : LOGO_ICON_URL} 
                      className={`w-full h-full ${isAdmin ? 'object-cover rounded-[1rem]' : 'object-contain'}`} 
                    />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
                </div>
                <div className="min-w-0">
                   <h3 className="text-base md:text-xl font-black text-gray-900 leading-none truncate tracking-tight">
                      {isAdmin ? String(activeSession?.userName || 'Resident') : 'Registry Assistant'}
                   </h3>
                   <div className="flex items-center gap-2 mt-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-[10px] font-black text-green-600 tracking-widest uppercase">Live Connection</span>
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden lg:flex items-center gap-3 bg-gray-50 px-6 py-2.5 rounded-2xl text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] border border-gray-100">
                   <ShieldCheck size={16} className="text-green-500" /> Authorized Tunnel
                </div>
                <button className="p-3 text-gray-300 hover:text-gray-900 transition-colors bg-gray-50 rounded-2xl">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-10 md:px-16 md:py-16 space-y-3 no-scrollbar bg-white">
               {messages.length === 0 && (
                 <div className="max-w-sm mx-auto text-center space-y-6 py-20">
                    <div className="w-20 h-20 bg-gray-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 p-5 border border-gray-100 shadow-inner">
                      <img src={LOGO_ICON_URL} className="w-full h-full object-contain opacity-40" alt="Logo" />
                    </div>
                    <p className="text-[12px] font-black text-gray-300 uppercase tracking-[0.4em] leading-relaxed">
                       Synchronizing with Registry...
                    </p>
                 </div>
               )}
               
               {messages.map((msg, idx) => {
                 const isOwn = msg.senderId === user.uid;
                 const prevMsg = messages[idx - 1];
                 const isSameSender = prevMsg?.senderId === msg.senderId;
                 const isLastInGroup = messages[idx + 1]?.senderId !== msg.senderId;
                 
                 return (
                   <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isSameSender ? 'mt-1' : 'mt-8'}`}>
                      <div className={`max-w-[85%] md:max-w-[70%] flex gap-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                        {!isOwn && !isSameSender ? (
                          <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 mt-auto border-2 border-white shadow-md p-0.5 ring-1 ring-gray-100">
                            <img src={msg.senderPhoto || `https://ui-avatars.com/api/?name=${msg.senderName}`} className="w-full h-full object-contain rounded-xl" />
                          </div>
                        ) : (
                          !isOwn && <div className="w-10 shrink-0"></div>
                        )}

                        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                          <div className={`p-4 md:p-5 px-6 md:px-7 text-[15px] md:text-[16px] leading-relaxed shadow-sm transition-all ${
                            isOwn 
                            ? 'bg-hotel-primary text-white rounded-[2rem] rounded-tr-none' 
                            : 'bg-gray-100 text-gray-800 rounded-[2rem] rounded-tl-none'
                          }`}>
                            {String(msg.text)}
                          </div>
                          <div className="flex items-center gap-2 mt-2 px-2">
                             <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
                               {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                             {isOwn && (
                               <div className="flex items-center">
                                 {msg.status === 'seen' ? (
                                   <CheckCheck size={14} className="text-blue-500" />
                                 ) : (
                                   <Check size={14} className="text-gray-300" />
                                 )}
                               </div>
                             )}
                          </div>
                          {isOwn && msg.status === 'seen' && isLastInGroup && (
                            <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mt-1 px-2">Seen</span>
                          )}
                        </div>
                      </div>
                   </div>
                 );
               })}
            </div>

            <div className="p-6 md:p-10 bg-white border-t border-gray-100">
               {!isAdmin && cooldown > 0 && (
                 <div className="mb-6 flex items-center justify-center gap-3 bg-red-50 text-hotel-primary py-3 px-6 rounded-2xl border border-red-100 animate-fade-in shadow-sm">
                    <Clock size={14} className="animate-pulse" />
                    <p className="text-[11px] font-black uppercase tracking-[0.2em]">Registry Delay: {cooldown}s Remaining</p>
                 </div>
               )}
               <div className="relative flex items-center gap-4">
                  <div className="flex-1 relative group">
                    <input 
                      type="text" 
                      placeholder={cooldown > 0 && !isAdmin ? "Synchronizing..." : "Command the registry..."}
                      className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] py-5 px-8 text-base focus:bg-white focus:ring-4 focus:ring-hotel-primary/5 focus:border-hotel-primary outline-none transition-all disabled:opacity-50 font-semibold"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      disabled={!isAdmin && cooldown > 0}
                    />
                  </div>
                  <button 
                    onClick={handleSend}
                    disabled={loading || (!isAdmin && cooldown > 0) || !input.trim()}
                    className="w-16 h-16 bg-hotel-primary text-white rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 shadow-2xl shadow-red-200 shrink-0 flex items-center justify-center"
                  >
                    {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
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