
import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, User, Bot, Sparkles, Loader2, ShieldCheck, 
  MessageSquare, Clock, ChevronLeft, Search,
  CheckCircle2, MoreVertical, Mail, UserCheck, Check, CheckCheck, Wifi, WifiOff, Shield, Key, Circle
} from 'lucide-react';
import { 
  db, auth, ref, onValue, push, set, update, 
  createNotification, OWNER_EMAIL, get 
} from '../services/firebase';
import { sendGuestEmail } from '../services/emailService';
import { HelpDeskMessage, ChatSession, UserProfile } from '../types';

interface HelpDeskProps {
  profile: UserProfile | null;
  logoUrl?: string;
}

const HelpDesk: React.FC<HelpDeskProps> = ({ profile, logoUrl }) => {
  const user = auth.currentUser;
  const isOwner = user?.email === OWNER_EMAIL;
  const isManager = profile?.role === 'manager';
  const isAdmin = isOwner || isManager;
  
  const [messages, setMessages] = useState<HelpDeskMessage[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeUserId, setActiveUserId] = useState<string | null>(isAdmin ? null : user?.uid || null);
  const [activeUserPresence, setActiveUserPresence] = useState<{ online: boolean; lastLogin: number } | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Helper for relative time formatting
  const formatRelativeTime = (timestamp: number) => {
    if (!timestamp) return 'Offline';
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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

  // Monitor presence of the user/admin we are chatting with
  useEffect(() => {
    if (isAdmin && activeUserId) {
      // Admin tracks the active guest
      const presenceRef = ref(db, `profiles/${activeUserId}`);
      const unsub = onValue(presenceRef, (snap) => {
        if (snap.exists()) {
          const data = snap.val();
          setActiveUserPresence({
            online: data.onlineStatus === true,
            lastLogin: data.lastUpdated || data.lastLogin || 0
          });
        }
      });
      return () => unsub();
    } else if (!isAdmin) {
      // Guest tracks the owner (Registry Assistant)
      const profilesRef = ref(db, 'profiles');
      const unsub = onValue(profilesRef, (snapshot) => {
        if (snapshot.exists()) {
          const allProfiles = Object.values(snapshot.val()) as UserProfile[];
          // Search for any active Admin/Owner/Manager who is online
          const activeStaff = allProfiles.find(p => (p.role === 'owner' || p.role === 'manager') && p.onlineStatus === true);
          const ownerProfile = allProfiles.find(p => p.email === OWNER_EMAIL);
          
          if (activeStaff) {
             setActiveUserPresence({ online: true, lastLogin: Date.now() });
          } else if (ownerProfile) {
            setActiveUserPresence({
              online: ownerProfile.onlineStatus === true,
              lastLogin: ownerProfile.lastLogin || 0
            });
          }
        }
      });
      return () => unsub();
    }
  }, [activeUserId, isAdmin]);

  useEffect(() => {
    if (!activeUserId) {
      setMessages([]);
      return;
    }
    const msgsRef = ref(db, `help_dex/messages/${activeUserId}`);
    const unsub = onValue(msgsRef, (snapshot) => {
      if (snapshot.exists()) {
        const rawData = snapshot.val();
        const data = Object.values(rawData) as HelpDeskMessage[];
        setMessages(data.sort((a, b) => a.timestamp - b.timestamp));
        
        const updates: any = {};
        Object.keys(rawData).forEach(key => {
          const msg = rawData[key] as HelpDeskMessage;
          if (msg.senderId !== user?.uid && msg.status !== 'seen') {
            updates[`help_dex/messages/${activeUserId}/${key}/status`] = 'seen';
          }
        });
        
        if (Object.keys(updates).length > 0) update(ref(db), updates);
        if (isAdmin) update(ref(db, `help_dex/active_chats/${activeUserId}`), { unreadCount: 0 });
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
      
      const roleLabel = isOwner ? 'Owner' : isManager ? 'Manager' : 'Guest';
      const senderName = `${roleLabel}: ${profile?.legalName || user.displayName || 'Staff'}`;
      
      const newMessage: HelpDeskMessage = {
        id: String(msgRef.key!),
        senderId: String(user.uid),
        senderName: senderName,
        senderPhoto: String(user.photoURL || ''),
        text: String(text),
        timestamp,
        role: roleLabel.toLowerCase() as any,
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
        const guestProfileRef = ref(db, `profiles/${activeUserId}`);
        const guestSnap = await get(guestProfileRef);
        if (guestSnap.exists()) {
          const guestData = guestSnap.val();
          if (guestData.onlineStatus === false) {
             sendGuestEmail({
               to_name: guestData.legalName,
               to_email: guestData.email,
               subject: "New Registry Message - Action Required",
               message: `Our ${roleLabel} has replied to your inquiry: "${text}". Please log in to the portal to view full details.`,
               booking_id: "HELP-DESK"
             });
          }
        }

        await update(ref(db, `help_dex/active_chats/${activeUserId}`), {
          lastMessage: String(text),
          lastTimestamp: timestamp,
          unreadCount: 0 
        });
      }

      await createNotification(isAdmin ? activeUserId : OWNER_EMAIL, {
        title: isAdmin ? 'Message from Registry' : 'Help Desk Inquiry',
        message: text,
        type: 'chat_message'
      });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const filteredSessions = sessions.filter(s => 
    String(s.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(s.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto h-[calc(100vh-72px)] md:h-[calc(100vh-88px)] flex overflow-hidden bg-white relative">
      {isAdmin && (
        <div className={`w-full md:w-[400px] border-r border-gray-100 flex-col bg-white shrink-0 z-20 ${activeUserId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-8 pb-6 bg-white sticky top-0 z-10">
             <div className="flex items-center justify-between mb-8">
                <div className="min-w-0">
                   <h2 className="text-2xl font-black text-gray-900 tracking-tight truncate">Help Desk</h2>
                   <p className="text-[10px] text-hotel-primary font-black uppercase tracking-widest mt-1">Managed Registry Hub</p>
                </div>
                <div className={`w-12 h-12 ${isOwner ? 'bg-hotel-primary' : 'bg-blue-600'} rounded-2xl flex items-center justify-center text-white shadow-xl shrink-0 ml-4`}>
                  {isOwner ? <Key size={20} /> : <Shield size={20} />}
                </div>
             </div>
             <div className="relative group">
                <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text" 
                  placeholder="Search residents..." 
                  className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-semibold outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar py-2 px-4">
            {filteredSessions.map((session) => (
              <button 
                key={session.userId} 
                onClick={() => setActiveUserId(session.userId)}
                className={`w-full p-5 text-left transition-all flex gap-5 rounded-[2rem] border ${activeUserId === session.userId ? 'bg-hotel-primary/5 border-hotel-primary/10 shadow-sm' : 'hover:bg-gray-50 border-transparent'}`}
              >
                <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden shadow-xl border-4 border-white relative shrink-0 bg-gray-50">
                  <img src={session.userPhoto || `https://ui-avatars.com/api/?name=${session.userName}`} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex justify-between items-baseline gap-2">
                     <h4 className="text-[15px] font-black text-gray-900 truncate">{String(session.userName)}</h4>
                     <span className="text-[9px] font-bold text-gray-400 shrink-0">{new Date(session.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-xs truncate text-gray-400 font-medium">{String(session.lastMessage)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={`flex-1 flex flex-col bg-white relative ${isAdmin && !activeUserId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {!activeUserId ? (
           <div className="text-center animate-fade-in">
              <div className="w-28 h-28 flex items-center justify-center mx-auto mb-10 p-5 bg-white rounded-[2.5rem] shadow-2xl border border-gray-50">
                <img src={logoUrl} className="w-full h-full object-contain" />
              </div>
              <h3 className="text-3xl font-serif font-black text-gray-900 tracking-tight">Vault Authorized</h3>
              <p className="text-sm text-gray-400 mt-4 max-w-sm mx-auto">Select a user to begin synchronization.</p>
           </div>
        ) : (
          <>
            <div className="h-20 md:h-24 px-4 md:px-12 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-xl shrink-0 sticky top-0 z-30">
              <div className="flex items-center gap-4 md:gap-5 min-w-0 flex-1">
                {isAdmin && <button onClick={() => setActiveUserId(null)} className="md:hidden p-2 -ml-2 text-gray-400"><ChevronLeft size={24} /></button>}
                <div className="w-10 h-10 md:w-14 md:h-14 rounded-[1.2rem] overflow-hidden border-2 md:border-4 border-white shadow-lg shrink-0 relative bg-gray-50 flex items-center justify-center p-3 md:p-4 transition-all">
                  <img 
                    src={!isAdmin ? logoUrl : (sessions.find(s=>s.userId===activeUserId)?.userPhoto || `https://ui-avatars.com/api/?name=${sessions.find(s=>s.userId===activeUserId)?.userName}`)} 
                    className={`w-full h-full transition-transform duration-500 ${!isAdmin ? 'object-contain scale-90' : 'object-cover'}`} 
                    alt="Chat Profile"
                  />
                  {activeUserPresence?.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                   <h3 className="text-sm md:text-xl font-black text-gray-900 tracking-tight truncate leading-none mb-1">
                     {isAdmin ? (sessions.find(s=>s.userId===activeUserId)?.userName || 'Resident') : 'Registry Assistant'}
                   </h3>
                   <div className="flex items-center gap-1.5 overflow-hidden">
                      {activeUserPresence?.online ? (
                        <div className="flex items-center gap-1.5">
                           <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shrink-0 border-2 border-white"></div>
                           <span className="text-[8px] md:text-[10px] font-black text-green-600 tracking-widest uppercase whitespace-nowrap">Online Now</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                           <div className="w-2.5 h-2.5 bg-gray-300 rounded-full shrink-0 border-2 border-white"></div>
                           <span className="text-[8px] md:text-[10px] font-black text-gray-400 tracking-widest uppercase truncate">
                             Last seen: {formatRelativeTime(activeUserPresence?.lastLogin || 0)}
                           </span>
                        </div>
                      )}
                   </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                 <div className="hidden sm:flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    <Shield size={12} className="text-hotel-primary" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Encrypted</span>
                 </div>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-10 md:px-16 space-y-6 no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-[0.98]">
               {messages.map((msg, idx) => {
                 const isOwn = msg.senderId === user.uid;
                 return (
                   <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`max-w-[90%] md:max-w-[70%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                        {!isOwn && <span className="text-[9px] font-black text-hotel-primary uppercase tracking-widest mb-1.5 px-2">{msg.senderName}</span>}
                        <div className={`p-4 md:p-5 px-6 text-[14px] md:text-[15px] leading-relaxed shadow-sm ${isOwn ? 'bg-hotel-primary text-white rounded-[1.8rem] rounded-tr-none shadow-lg shadow-red-50' : 'bg-white text-gray-800 rounded-[1.8rem] rounded-tl-none border border-gray-100 shadow-sm'}`}>
                          {String(msg.text)}
                        </div>
                        <div className="flex items-center gap-2 mt-2 px-2">
                           <span className="text-[8px] font-bold text-gray-300 uppercase">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </span>
                           {isOwn && (
                             <span className="text-[8px] font-black uppercase text-hotel-primary/40 flex items-center gap-1">
                               {msg.status === 'seen' ? <><CheckCheck size={10} /> Seen</> : <><Check size={10} /> Sent</>}
                             </span>
                           )}
                        </div>
                      </div>
                   </div>
                 );
               })}
            </div>

            <div className="p-6 md:p-10 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
               <div className="relative flex items-center gap-4">
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder={!isAdmin && cooldown > 0 ? `Synchronization Delay: ${cooldown}s...` : "Command the registry..."}
                      className="w-full bg-gray-50 border border-gray-100 rounded-[2rem] py-5 px-8 text-sm md:text-base font-semibold outline-none focus:bg-white focus:border-hotel-primary transition-all disabled:opacity-50 pr-16"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      disabled={!isAdmin && cooldown > 0}
                    />
                    {!isAdmin && cooldown > 0 && (
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-hotel-primary animate-pulse">
                        {cooldown}s
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={handleSend}
                    disabled={loading || (!isAdmin && cooldown > 0) || !input.trim()}
                    className="w-14 h-14 md:w-16 md:h-16 bg-hotel-primary text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center shrink-0"
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

export default HelpDesk;
