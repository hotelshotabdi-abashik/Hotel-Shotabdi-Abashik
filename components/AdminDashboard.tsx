
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, User, Calendar, Search, CheckCircle2, 
  Loader2, Mail, Phone, IdCard, ShieldCheck, 
  Building2, Eye, Trash2, AlertTriangle, ShieldAlert,
  MapPin, UserCheck, Key, Shield, X,  Maximize2, Database, ClipboardCheck, History, Activity, BarChart3, RefreshCw, Settings, Plus, Save, PhoneCall, Star
} from 'lucide-react';
import { db, ref, onValue, update, createNotification, OWNER_EMAIL, auth, createAdminLog, get, query, limitToLast, set } from '../services/firebase';
import { sendGuestEmail } from '../services/emailService';
import { UserProfile, Booking, SiteConfig, HelpDeskNumber } from '../types';

import { ROOMS_DATA, SYLHET_RESTAURANTS, SYLHET_ATTRACTIONS, LOGO_ICON_URL, NAV_ITEMS } from '../constants';
import { translations, Language } from '../translations';

interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  details: string;
  timestamp: number;
}

interface AdminProps {
  language: Language;
  siteConfig: SiteConfig;
  setSiteConfig: React.Dispatch<React.SetStateAction<SiteConfig>>;
}

const AdminDashboard: React.FC<AdminProps> = ({ language, siteConfig, setSiteConfig }) => {
  const t = translations[language];
  
  const formatNumber = (num: number | string) => {
    if (language === 'EN') return String(num);
    return String(num).split('').map(char => t.numbers[char as keyof typeof t.numbers] || char).join('');
  };

  const currentUser = auth.currentUser;
  const isOwner = currentUser?.email === OWNER_EMAIL;
  
  const [activeTab, setActiveTab] = useState<'users' | 'bookings' | 'data' | 'settings' | 'guide'>('bookings');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [roomNumberInput, setRoomNumberInput] = useState('');
  const [rejectionReason, setRejectionReason] = useState('Registry verification failed');
  const [actionLoading, setActionLoading] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Help Desk Settings State
  const [helpDeskNumbers, setHelpDeskNumbers] = useState<HelpDeskNumber[]>(siteConfig.helpDeskNumbers || [
    { number: "+880177425702", labelEn: "Primary Support", labelBn: "প্রাথমিক সহায়তা" }
  ]);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [roleUpdatingUid, setRoleUpdatingUid] = useState<string | null>(null);

  useEffect(() => {
    const profilesRef = ref(db, 'profiles');
    const bookingsRef = ref(db, 'bookings');
    const logsRef = ref(db, 'logs');

    let loadedCount = 0;
    const totalToLoad = 3;

    const checkLoadingFinished = () => {
      loadedCount++;
      if (loadedCount >= totalToLoad) {
        setLoading(false);
      }
    };

    const handleLoadError = (err: Error) => {
      console.error("Registry Sync Error:", err);
      setLoadError("Some administrative data could not be synced. Check permissions.");
      checkLoadingFinished();
    };

    const uUnsub = onValue(profilesRef, (snapshot) => {
      if (snapshot.exists()) setUsers(Object.values(snapshot.val()));
      else setUsers([]);
      setLoading(false);
    }, handleLoadError);

    const bUnsub = onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val()) as Booking[];
        setBookings(data.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setBookings([]);
      }
    }, handleLoadError);

    // Optimize: Limit logs to last 50 to save bandwidth
    const logsQuery = query(logsRef, limitToLast(50));
    const lUnsub = onValue(logsQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val()) as AuditLog[];
        setLogs(data.sort((a, b) => b.timestamp - a.timestamp));
      } else {
        setLogs([]);
      }
    }, handleLoadError);

    // Optimize: Movements are expensive. We only need the latest status from profiles
    // instead of the full movement history tree.
    const mUnsub = onValue(profilesRef, (snapshot) => {
      if (snapshot.exists()) {
        const profilesData = snapshot.val();
        const allMovements: any[] = [];
        Object.keys(profilesData).forEach(uid => {
          const p = profilesData[uid];
          if (p.lastSeenPath) {
            allMovements.push({ 
              uid, 
              path: p.lastSeenPath, 
              timestamp: p.lastActive || Date.now(),
              userName: p.legalName || p.email || 'Guest'
            });
          }
        });
        setMovements(allMovements.sort((a, b) => b.timestamp - a.timestamp).slice(0, 50));
      }
    });

    return () => { uUnsub(); bUnsub(); lUnsub(); mUnsub(); };
  }, [users]);

  const triggerRoleNotification = async (uid: string, newRole: string) => {
    const targetUser = users.find(u => u.uid === uid);
    if (!targetUser) return;
    const roleName = newRole.toUpperCase();
    const message = `Your account access level has been updated to: ${roleName}.`;
    await createNotification(uid, {
      title: 'Registry Access Updated',
      message: message,
      type: 'system'
    });
    sendGuestEmail({
      to_name: targetUser.legalName || 'Resident',
      to_email: targetUser.email,
      subject: `Registry Status: Account Role Updated to ${roleName}`,
      message: message,
      booking_id: "ROLE-AUTH"
    });
  };

  const handleUpdateRole = async (uid: string, newRole: 'guest' | 'staff') => {
    setRoleUpdatingUid(uid);
    try {
      const targetUser = users.find(u => u.uid === uid);
      await update(ref(db), {
        [`roles/${uid}`]: newRole,
        [`profiles/${uid}/role`]: newRole
      });
      await createAdminLog('ROLE_CHANGE', `Changed role for ${targetUser?.legalName || uid} to ${newRole.toUpperCase()}`);
      await triggerRoleNotification(uid, newRole);
    } catch (err) {
      alert("Role update failed. Connection error.");
    } finally {
      setRoleUpdatingUid(null);
    }
  };

  const handleBookingAction = async (booking: Booking, status: 'accepted' | 'rejected', meta?: string) => {
    setActionLoading(true);
    try {
      const updates: any = {
        status,
        roomNumber: status === 'accepted' ? meta : null,
        rejectionReason: status === 'rejected' ? meta : null
      };
      await update(ref(db, `bookings/${booking.id}`), updates);
      
      // Senior Architect Fix: Sync update to user_registry so guest sees it live
      await update(ref(db, `user_registry/${booking.userId}/bookings/${booking.id}`), updates);
      
      await createAdminLog(status === 'accepted' ? 'BOOKING_ACCEPTED' : 'BOOKING_REJECTED', `${status === 'accepted' ? 'Verified stay' : 'Rejected stay'} for ${booking.userName}. ID: ${booking.id}`);
      const message = status === 'accepted' 
        ? `Your booking for ${booking.roomTitle} is confirmed! Room No: ${meta}.` 
        : `Booking rejected: ${meta}.`;
      await createNotification(booking.userId, {
        title: `Stay ${status === 'accepted' ? 'Confirmed' : 'Rejected'}`,
        message,
        type: 'booking_update'
      });
      sendGuestEmail({
        to_name: booking.userName,
        to_email: booking.userEmail,
        subject: status === 'accepted' ? "Stay Verified - Hotel Shotabdi Residential" : "Registry Update Required",
        message: message,
        booking_id: booking.id
      });
      setSelectedBooking(null);
      setRoomNumberInput('');
      setRejectionReason('Registry verification failed');
    } catch (err) { 
      alert("Action failed. Check database connection.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => 
    b.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.legalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const analyticsBookings = bookings.filter(b => {
    const timestamp = b.createdAt;
    const start = new Date(dateRange.start).getTime();
    const end = new Date(dateRange.end).getTime() + 86400000;
    return timestamp >= start && timestamp <= end;
  });

  const acceptedCount = analyticsBookings.filter(b => b.status === 'accepted').length;
  const rejectedCount = analyticsBookings.filter(b => b.status === 'rejected').length;
  const pendingCount = analyticsBookings.filter(b => b.status === 'pending').length;

  const currentAdminRole = isOwner ? 'Owner' : 'Admin';

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32 lg:pb-10 animate-fade-in relative z-10">
      {loading && (
        <div className="fixed top-24 right-8 z-[100] flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-sm animate-pulse">
          <Loader2 className="animate-spin text-hotel-primary" size={14} />
          <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Syncing...</span>
        </div>
      )}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-[1.5rem] shadow-xl ${isOwner ? 'bg-hotel-primary text-white' : 'bg-blue-600 text-white'}`}>
             {isOwner ? <Key size={32} /> : <Shield size={32} />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-serif font-black text-gray-900 leading-none">Registry Control</h1>
              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${isOwner ? 'bg-hotel-primary/10 text-hotel-primary' : 'bg-blue-50 text-blue-600'}`}>
                {currentAdminRole}
              </span>
            </div>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">Authorized: {currentUser?.displayName || currentUser?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {['bookings', 'users', 'data', 'settings', 'guide'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => { setActiveTab(tab as any); setSearchQuery(''); }} 
              className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab ? 'bg-hotel-primary text-white shadow-xl shadow-red-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
            >
              {tab === 'bookings' ? t.bookings : tab === 'users' ? t.users : tab === 'data' ? t.data : tab === 'settings' ? t.settings : t.touristGuide}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-10 group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#B22222] transition-colors" size={20} />
        <input type="text" placeholder={`Search ${activeTab}...`} className="w-full bg-white border border-gray-100 rounded-[2rem] py-6 pl-16 pr-8 text-sm font-semibold outline-none focus:border-[#B22222] shadow-xl shadow-gray-100/50 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="space-y-5">
        {activeTab === 'bookings' && filteredBookings.map(booking => (
          <div key={booking.id} onClick={() => setSelectedBooking(booking)} className="bg-white rounded-[2rem] border border-gray-100 p-6 flex items-center justify-between cursor-pointer hover:shadow-2xl transition-all group">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lg bg-gray-50 flex items-center justify-center">
                {booking.guests?.[0]?.nidImageUrl ? <img src={booking.guests[0].nidImageUrl} className="w-full h-full object-cover" /> : <User className="text-gray-300" />}
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">{booking.userName}</h3>
                <p className="text-[9px] font-black text-[#B22222] uppercase tracking-widest">{booking.roomTitle}</p>
                <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">{booking.checkIn} to {booking.checkOut}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <a 
                 href={`tel:${booking.guests?.[0]?.phone}`} 
                 onClick={(e) => e.stopPropagation()}
                 className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors"
                 title="Call Guest"
               >
                 <Phone size={20} />
               </a>
               <span className={`text-[9px] font-black uppercase tracking-widest px-4 py-2 rounded-xl ${
                 booking.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                 booking.status === 'accepted' ? 'bg-green-50 text-green-600' :
                 'bg-red-50 text-red-600'
               }`}>
                 {booking.status}
               </span>
               <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:text-hotel-primary transition-colors">
                  <Eye size={20} />
               </div>
            </div>
          </div>
        ))}

        {activeTab === 'users' && filteredUsers.map(user => (
          <div key={user.uid} className="bg-white rounded-[2rem] border border-gray-100 p-6 flex items-center justify-between group overflow-hidden">
            <div className="flex items-center gap-5 min-w-0">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-lg shrink-0">
                <img src={user.photoURL} className="w-full h-full object-cover" alt={user.legalName} />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black text-gray-900 truncate">{user.legalName || 'New Resident'}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                   <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                     user.role === 'owner' ? 'bg-hotel-primary text-white border-hotel-primary' :
                     user.role === 'manager' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                     user.role === 'staff' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                     'bg-gray-50 text-gray-500 border-gray-100'
                   }`}>
                     {user.role || 'guest'}
                   </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
               {isOwner && user.role !== 'owner' ? (
                 <div className="flex items-center bg-gray-50 p-1.5 rounded-xl border border-gray-100 gap-1">
                    <button 
                      onClick={() => handleUpdateRole(user.uid, 'guest')}
                      disabled={roleUpdatingUid === user.uid}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${user.role === 'guest' || !user.role ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Guest
                    </button>
                    <button 
                      onClick={() => handleUpdateRole(user.uid, 'staff')}
                      disabled={roleUpdatingUid === user.uid}
                      className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${user.role === 'staff' ? 'bg-white shadow-sm text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      Staff
                    </button>
                 </div>
               ) : (
                 <div className="flex items-center gap-2">
                    {user.role === 'owner' && <span className="text-[9px] font-black text-hotel-primary uppercase tracking-widest flex items-center gap-1.5 pr-4"><Key size={12}/> Owner</span>}
                    {user.role === 'manager' && !isOwner && <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 pr-4"><Shield size={12}/> Manager</span>}
                 </div>
               )}
               {roleUpdatingUid === user.uid && <Loader2 className="animate-spin text-hotel-primary" size={16} />}
            </div>
          </div>
        ))}

        {activeTab === 'data' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
            <div className="lg:col-span-4 space-y-6">
               <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                  <div>
                     <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3"><BarChart3 size={16} className="text-hotel-primary"/> Statistics</h4>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                           <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Accepted</p>
                           <p className="text-2xl font-sans font-black text-green-600 leading-none">{acceptedCount}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                           <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Rejected</p>
                           <p className="text-2xl font-sans font-black text-red-600 leading-none">{rejectedCount}</p>
                        </div>
                     </div>
                     <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                        <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">Pending Sync</p>
                        <p className="text-2xl font-sans font-black text-amber-700 leading-none">{pendingCount}</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-8">
               <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
                  <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                     <div className="flex items-center gap-3">
                        <Activity size={18} className="text-hotel-primary" />
                        <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Live User Movements</h4>
                      </div>
                      <span className="text-[9px] font-bold text-gray-400 uppercase">{movements.length} entries</span>
                   </div>
                   <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
                      {movements.map((m, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex justify-between items-center">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-hotel-primary font-black text-[10px]">
                                {m.userName.charAt(0)}
                              </div>
                              <div>
                                 <p className="text-[10px] font-black text-gray-900">{m.userName}</p>
                                 <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Visited: {m.path}</p>
                              </div>
                           </div>
                           <span className="text-[8px] font-bold text-gray-300">{new Date(m.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))}
                   </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
                   <div className="p-8 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <ClipboardCheck size={18} className="text-hotel-primary" />
                         <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Audit Logs</h4>
                     </div>
                     <span className="text-[9px] font-bold text-gray-400 uppercase">{logs.length} entries</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-8 space-y-4 no-scrollbar">
                     {logs.map((log) => (
                       <div key={log.id} className="p-5 bg-gray-50 rounded-[1.5rem] border border-gray-100 flex gap-5 items-start">
                          <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                             {/* Fix: Included missing RefreshCw icon from lucide-react */}
                             {log.action.includes('BOOKING') ? <ClipboardCheck size={18} className="text-green-600" /> : log.action.includes('ROLE') ? <Shield size={18} className="text-blue-600" /> : <RefreshCw size={18} className="text-amber-600" />}
                          </div>
                          <div className="min-w-0 flex-1">
                             <div className="flex justify-between items-start mb-1">
                                <h5 className="text-[11px] font-black text-gray-900 uppercase tracking-tighter truncate">{log.action.replace('_', ' ')}</h5>
                                <span className="text-[8px] font-bold text-gray-400 whitespace-nowrap ml-2">{new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                             </div>
                             <p className="text-[12px] text-gray-600 leading-relaxed font-medium mb-2">{log.details}</p>
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Actor: {log.actorName}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8 animate-fade-in">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-hotel-primary/10 rounded-2xl flex items-center justify-center text-hotel-primary">
                    <Settings size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Help Desk Configuration</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Manage live contact numbers</p>
                  </div>
                </div>
                <button 
                  onClick={() => setHelpDeskNumbers([...helpDeskNumbers, { number: '', labelEn: '', labelBn: '' }])}
                  className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-800 transition-all active:scale-95"
                >
                  <Plus size={16} /> Add Number
                </button>
              </div>

              <div className="space-y-4">
                {helpDeskNumbers.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gray-50 rounded-2xl border border-gray-100 items-end">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative">
                        <PhoneCall size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text" 
                          placeholder="+880..." 
                          className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-xs font-bold outline-none focus:border-hotel-primary"
                          value={item.number}
                          onChange={(e) => {
                            const next = [...helpDeskNumbers];
                            next[idx].number = e.target.value;
                            setHelpDeskNumbers(next);
                          }}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Label (English)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Reception" 
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-hotel-primary"
                        value={item.labelEn}
                        onChange={(e) => {
                          const next = [...helpDeskNumbers];
                          next[idx].labelEn = e.target.value;
                          setHelpDeskNumbers(next);
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Label (Bengali)</label>
                      <input 
                        type="text" 
                        placeholder="যেমন: রিসেপশন" 
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-hotel-primary"
                        value={item.labelBn}
                        onChange={(e) => {
                          const next = [...helpDeskNumbers];
                          next[idx].labelBn = e.target.value;
                          setHelpDeskNumbers(next);
                        }}
                      />
                    </div>
                    <button 
                      onClick={() => setHelpDeskNumbers(helpDeskNumbers.filter((_, i) => i !== idx))}
                      className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
                <button 
                  onClick={async () => {
                    setIsSavingSettings(true);
                    try {
                      const updatedConfig = { ...siteConfig, helpDeskNumbers };
                      await set(ref(db, 'site-config'), updatedConfig);
                      setSiteConfig(updatedConfig);
                      await createAdminLog('SETTINGS_UPDATE', 'Updated Help Desk contact numbers');
                      alert("Settings updated successfully!");
                    } catch (err) {
                      alert("Failed to save settings.");
                    } finally {
                      setIsSavingSettings(false);
                    }
                  }}
                  disabled={isSavingSettings}
                  className="bg-hotel-primary text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 flex items-center gap-3 hover:brightness-110 active:scale-95 transition-all"
                >
                  {isSavingSettings ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save Configuration</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-serif font-black text-gray-900">Manage Tourist Guides</h3>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Add, edit, or remove local attractions for guests.</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => {
                    if (window.confirm("This will replace all current guides with the 30 default entries. Continue?")) {
                      setSiteConfig(prev => ({ ...prev, touristGuides: SYLHET_ATTRACTIONS }));
                      createAdminLog('GUIDE_RESET', 'Reset tourist guides to 30 defaults');
                    }
                  }}
                  className="bg-amber-50 text-amber-600 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 transition-all active:scale-95"
                >
                  Reset to 30 Defaults
                </button>
                <button 
                  onClick={() => {
                    const newItem = {
                      id: Date.now(),
                      name: "New Attraction",
                      subtitle: "Category",
                      distance: "5.0 km",
                      description: "A short but engaging description of this local treasure.",
                      image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80",
                      mapUrl: "",
                      phone: "",
                      isRecommended: false
                    };
                    setSiteConfig(prev => ({ ...prev, touristGuides: [newItem, ...(prev.touristGuides || [])] }));
                  }}
                  className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-gray-800 transition-all active:scale-95"
                >
                  <Plus size={16} /> Add New Place
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(siteConfig.touristGuides || []).map((spot, idx) => (
                <div key={spot.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group flex flex-col">
                  <div className="relative h-48 overflow-hidden">
                    <img src={spot.image} alt={spot.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                       <button 
                        onClick={() => {
                          const url = window.prompt("Enter Image URL:", spot.image);
                          if (url) {
                            const updated = [...(siteConfig.touristGuides || [])];
                            updated[idx] = { ...updated[idx], image: url };
                            setSiteConfig(prev => ({ ...prev, touristGuides: updated }));
                          }
                        }}
                        className="bg-white p-3 rounded-2xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-xl"
                       >
                         <RefreshCw size={18} />
                       </button>
                       <button 
                        onClick={() => {
                          const updated = [...(siteConfig.touristGuides || [])];
                          updated[idx] = { ...updated[idx], isRecommended: !updated[idx].isRecommended };
                          setSiteConfig(prev => ({ ...prev, touristGuides: updated }));
                        }}
                        className={`p-3 rounded-2xl transition-all shadow-xl ${spot.isRecommended ? 'bg-amber-400 text-gray-900' : 'bg-white text-gray-400 hover:text-amber-400'}`}
                       >
                         <Star size={18} fill={spot.isRecommended ? "currentColor" : "none"} />
                       </button>
                    </div>
                  </div>
                  <div className="p-8 space-y-5 flex-1 flex flex-col">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Place Name</label>
                      <input 
                        className="w-full bg-gray-50 border border-transparent focus:border-blue-600 rounded-xl px-4 py-3 text-sm font-black text-gray-900 outline-none transition-all"
                        value={spot.name}
                        onChange={(e) => {
                          const updated = [...(siteConfig.touristGuides || [])];
                          updated[idx] = { ...updated[idx], name: e.target.value };
                          setSiteConfig(prev => ({ ...prev, touristGuides: updated }));
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Category / Subtitle</label>
                      <input 
                        className="w-full bg-gray-50 border border-transparent focus:border-blue-600 rounded-xl px-4 py-3 text-[10px] font-black text-blue-600 uppercase tracking-widest outline-none transition-all"
                        value={spot.subtitle}
                        onChange={(e) => {
                          const updated = [...(siteConfig.touristGuides || [])];
                          updated[idx] = { ...updated[idx], subtitle: e.target.value };
                          setSiteConfig(prev => ({ ...prev, touristGuides: updated }));
                        }}
                      />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                      <textarea 
                        className="w-full bg-gray-50 border border-transparent focus:border-blue-600 rounded-xl p-4 h-28 text-xs font-bold text-gray-500 outline-none resize-none transition-all leading-relaxed"
                        value={spot.description}
                        onChange={(e) => {
                          const updated = [...(siteConfig.touristGuides || [])];
                          updated[idx] = { ...updated[idx], description: e.target.value };
                          setSiteConfig(prev => ({ ...prev, touristGuides: updated }));
                        }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Distance</label>
                        <input 
                          className="w-full bg-gray-50 border border-transparent focus:border-blue-600 rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all"
                          value={spot.distance}
                          placeholder="e.g. 5.0 km"
                          onChange={(e) => {
                            const updated = [...(siteConfig.touristGuides || [])];
                            updated[idx] = { ...updated[idx], distance: e.target.value };
                            setSiteConfig(prev => ({ ...prev, touristGuides: updated }));
                          }}
                        />
                      </div>
                      <div className="flex items-end">
                        <button 
                          onClick={() => {
                            if (window.confirm("Delete this attraction?")) {
                              const updated = (siteConfig.touristGuides || []).filter(s => s.id !== spot.id);
                              setSiteConfig(prev => ({ ...prev, touristGuides: updated }));
                            }
                          }}
                          className="w-full bg-red-50 text-red-600 py-3 rounded-xl hover:bg-red-100 transition-all flex items-center justify-center"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100 flex justify-end">
              <button 
                onClick={async () => {
                  setIsSavingSettings(true);
                  try {
                    await set(ref(db, 'site-config'), siteConfig);
                    await createAdminLog('GUIDE_UPDATE', 'Updated tourist guide listings');
                    alert("Tourist guides updated successfully!");
                  } catch (err) {
                    alert("Failed to save tourist guides.");
                  } finally {
                    setIsSavingSettings(false);
                  }
                }}
                disabled={isSavingSettings}
                className="bg-hotel-primary text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 flex items-center gap-3 hover:brightness-110 active:scale-95 transition-all"
              >
                {isSavingSettings ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save Guide Changes</>}
              </button>
            </div>
          </div>
        )}

      </div>

      {selectedBooking && createPortal(
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-0 md:p-6 animate-fade-in">
          <div className="bg-white w-full max-w-5xl rounded-none md:rounded-[3rem] shadow-2xl flex flex-col max-h-[100vh] md:max-h-[95vh] border border-white/20 overflow-hidden relative">
            <div className="px-6 md:px-10 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-hotel-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-red-100">
                     <ClipboardCheck size={24} />
                  </div>
                  <div>
                     <h2 className="text-xl md:text-2xl font-serif font-black text-gray-900 tracking-tighter leading-none uppercase">Submission Audit</h2>
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                       <Database size={12} /> Registry ID: {selectedBooking.id}
                     </p>
                  </div>
               </div>
               <button onClick={() => setSelectedBooking(null)} className="p-4 bg-white rounded-2xl text-gray-400 hover:text-hotel-primary transition-all shadow-sm border border-gray-100 active:scale-95">
                 <X size={24}/>
               </button>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-10 space-y-10">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                     <section className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2"><Building2 size={12} className="text-hotel-primary" /> Stay Request</h4>
                        <div className="space-y-4">
                           <div>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Room Category</p>
                              <p className="text-lg font-black text-gray-900">{selectedBooking.roomTitle}</p>
                           </div>
                           <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                              <p className="text-[10px] font-black text-hotel-primary uppercase tracking-widest">Total Price</p>
                              <p className="text-xl font-sans font-black text-gray-900 tracking-tighter">৳{selectedBooking.price}</p>
                           </div>
                        </div>
                     </section>
                     {selectedBooking.status === 'pending' && (
                       <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 space-y-4">
                          <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Registry Action</h4>
                          <div className="space-y-4">
                             <div className="space-y-1.5">
                                <label className="text-[9px] font-black text-amber-600 uppercase tracking-widest ml-1">Assign Room No</label>
                                <input placeholder="e.g. 302" className="w-full bg-white border border-amber-200 rounded-xl px-4 py-3 text-sm font-black outline-none focus:border-hotel-primary" value={roomNumberInput} onChange={e => setRoomNumberInput(e.target.value)} />
                             </div>
                             <button onClick={() => handleBookingAction(selectedBooking, 'accepted', roomNumberInput)} disabled={!roomNumberInput || actionLoading} className="w-full bg-green-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-green-100 flex items-center justify-center gap-2 transition-all active:scale-95">
                               {actionLoading ? <Loader2 className="animate-spin" size={16} /> : <><CheckCircle2 size={16} /> Verify & Accept</>}
                             </button>
                             <div className="h-[1px] bg-amber-200"></div>
                             <button onClick={() => handleBookingAction(selectedBooking, 'rejected', rejectionReason)} disabled={actionLoading} className="w-full border border-red-200 text-red-600 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all">Reject Submission</button>
                          </div>
                       </div>
                     )}
                  </div>
                  <div className="lg:col-span-2 space-y-8">
                     <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-100 pb-3">
                        <Users size={16} className="text-hotel-primary" /> Submitted Guest Identities ({selectedBooking.totalGuests})
                     </h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedBooking.guests.map((guest, idx) => (
                          <div key={idx} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                             <div className="p-6 bg-gray-50 border-b border-gray-100 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-hotel-primary shadow-sm"><User size={20} /></div>
                                <div className="min-w-0">
                                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Guest {idx + 1}</p>
                                   <h5 className="text-sm font-black text-gray-900 truncate uppercase">{guest.legalName}</h5>
                                </div>
                             </div>
                             <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                   <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3 text-[11px] font-black text-gray-600"><Phone size={14} className="text-hotel-primary" /> {guest.phone || 'N/A'}</div>
                                      {guest.phone && (
                                         <a href={`tel:${guest.phone}`} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-all"><Phone size={12} /></a>
                                      )}
                                   </div>
                                   {guest.guardianPhone && (
                                      <div className="flex items-center justify-between">
                                         <div className="flex items-center gap-3 text-[11px] font-black text-gray-600"><Phone size={14} className="text-blue-500" /> {guest.guardianPhone} (Guardian)</div>
                                         <a href={`tel:${guest.guardianPhone}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all"><Phone size={12} /></a>
                                      </div>
                                   )}
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-mono font-black text-gray-900 bg-gray-50 p-3 rounded-xl border border-gray-100"><IdCard size={14} className="text-hotel-primary" /> NID: {guest.nidNumber || 'UNSUBMITTED'}</div>
                                {guest.nidImageUrl && (
                                   <div className="mt-4"><div onClick={() => setLightboxUrl(guest.nidImageUrl)} className="w-full aspect-video rounded-[1.5rem] overflow-hidden shadow-md border-2 border-white bg-gray-100 relative group cursor-zoom-in"><img src={guest.nidImageUrl} className="w-full h-full object-contain" /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"><Maximize2 className="text-white opacity-0 group-hover:opacity-100" size={24} /></div></div></div>
                                )}
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {lightboxUrl && (
        <div className="fixed inset-0 z-[10001] bg-black/95 flex items-center justify-center p-4 md:p-12 animate-fade-in" onClick={() => setLightboxUrl(null)}>
          <button className="absolute top-10 right-10 text-white/60 hover:text-white p-4 transition-colors"><X size={32} /></button>
          <img src={lightboxUrl} className="max-w-full max-h-full object-contain shadow-2xl rounded-xl" alt="Document Full View" />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
