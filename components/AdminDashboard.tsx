
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Users, User, Calendar, Search, CheckCircle2, 
  Loader2, Mail, Phone, IdCard, ShieldCheck, 
  Building2, Eye, Trash2, AlertTriangle, ShieldAlert,
  MapPin, UserCheck, Key, Shield, X, Maximize2, Database, ClipboardCheck, History, Activity, BarChart3, RefreshCw, Settings, Plus, Save, PhoneCall, Star, ChevronRight
} from 'lucide-react';
import { 
  db, 
  createNotification, 
  OWNER_EMAIL, 
  auth, 
  createAdminLog, 
  query, 
  limit, 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  setDoc, 
  orderBy 
} from '../services/firebase';
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
  const isOwner = currentUser?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
  
  const [activeTab, setActiveTab] = useState<'users'>('users');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
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
    const profilesRef = collection(db, 'profiles');
    const bookingsRef = collection(db, 'bookings');
    const logsRef = collection(db, 'logs');

    let loadedCount = 0;
    const totalToLoad = 3;

    const checkLoadingFinished = () => {
      loadedCount++;
      if (loadedCount >= totalToLoad) {
        setLoading(false);
      }
    };

    const handleLoadError = (err: any) => {
      console.error("Registry Sync Error:", err);
      setLoadError("Some administrative data could not be synced. Check permissions.");
      checkLoadingFinished();
    };

    const uUnsub = onSnapshot(profilesRef, (snapshot) => {
      const usersList: UserProfile[] = [];
      snapshot.forEach(d => usersList.push({ ...d.data(), uid: d.id } as UserProfile));
      setUsers(usersList);
      setLoading(false);
    }, handleLoadError);

    const bUnsub = onSnapshot(bookingsRef, (snapshot) => {
      const data: Booking[] = [];
      snapshot.forEach(d => data.push({ ...d.data(), id: d.id } as Booking));
      setBookings(data.sort((a, b) => b.createdAt - a.createdAt));
    }, handleLoadError);

    return () => { uUnsub(); bUnsub(); };
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const filtered = bookings.filter(b => b.userId === selectedUser.uid);
      setUserBookings(filtered);
    }
  }, [selectedUser, bookings]);

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
      const userRef = doc(db, 'profiles', uid);
      const roleRef = doc(db, 'roles', uid);
      
      await updateDoc(userRef, { role: newRole });
      await setDoc(roleRef, { role: newRole }, { merge: true });
      
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
      
      const bookingRef = doc(db, 'bookings', booking.id);
      const userBookingRef = doc(db, 'user_registry', booking.userId, 'bookings', booking.id);
      
      await updateDoc(bookingRef, updates);
      await updateDoc(userBookingRef, updates);
      
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
              <h1 className="text-3xl font-serif font-black text-gray-900 leading-none">User Directory</h1>
              <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest ${isOwner ? 'bg-hotel-primary/10 text-hotel-primary' : 'bg-blue-50 text-blue-600'}`}>
                {currentAdminRole}
              </span>
            </div>
            <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.2em]">Authorized: {currentUser?.displayName || currentUser?.email}</p>
          </div>
        </div>
      </div>

      <div className="relative mb-10 group">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#B22222] transition-colors" size={20} />
        <input type="text" placeholder="Search residents by name or email..." className="w-full bg-white border border-gray-100 rounded-[2rem] py-6 pl-16 pr-8 text-sm font-semibold outline-none focus:border-[#B22222] shadow-xl shadow-gray-100/50 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 mb-2">Registered Accounts</h4>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto no-scrollbar pr-2">
            {filteredUsers.map(user => (
              <div 
                key={user.uid} 
                onClick={() => setSelectedUser(user)}
                className={`bg-white rounded-[2rem] border p-5 flex items-center justify-between cursor-pointer transition-all group ${selectedUser?.uid === user.uid ? 'border-hotel-primary shadow-xl ring-1 ring-hotel-primary/10' : 'border-gray-100 hover:border-hotel-primary/30 hover:shadow-lg'}`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-md shrink-0 bg-gray-50 flex items-center justify-center">
                    {user.photoURL ? (
                      <img src={user.photoURL} className="w-full h-full object-cover" alt={user.legalName} referrerPolicy="no-referrer" />
                    ) : (
                      <User className="text-gray-300" size={20} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-black text-gray-900 truncate">{user.legalName || 'New Resident'}</h3>
                    <p className="text-[9px] text-gray-400 truncate font-bold">{user.email}</p>
                  </div>
                </div>
                <ChevronRight size={18} className={`transition-transform ${selectedUser?.uid === user.uid ? 'text-hotel-primary translate-x-1' : 'text-gray-200 group-hover:text-gray-400'}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedUser ? (
            <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden animate-fade-in flex flex-col h-full min-h-[70vh]">
              <div className="p-8 md:p-10 border-b border-gray-50 bg-gray-50/30">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                  <div className="relative group">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl">
                      <img 
                        src={selectedUser.photoURL || `https://ui-avatars.com/api/?name=${selectedUser.legalName}`} 
                        className="w-full h-full object-cover" 
                        alt={selectedUser.legalName} 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    {selectedUser.role === 'owner' && (
                      <div className="absolute -top-2 -right-2 bg-hotel-primary text-white p-2 rounded-xl shadow-lg">
                        <Key size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl md:text-4xl font-serif font-black text-gray-900 tracking-tighter">{selectedUser.legalName}</h2>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        selectedUser.role === 'owner' ? 'bg-hotel-primary text-white' :
                        selectedUser.role === 'manager' ? 'bg-blue-600 text-white' :
                        selectedUser.role === 'staff' ? 'bg-purple-600 text-white' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {selectedUser.role || 'guest'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      <span className="flex items-center gap-2"><Mail size={14} className="text-hotel-primary"/> {selectedUser.email}</span>
                      <span className="flex items-center gap-2"><Phone size={14} className="text-hotel-primary"/> {selectedUser.phone || 'No Phone'}</span>
                    </div>
                  </div>
                  {isOwner && selectedUser.role !== 'owner' && (
                    <div className="flex items-center bg-white p-2 rounded-2xl border border-gray-100 shadow-sm gap-2">
                      <button 
                        onClick={() => handleUpdateRole(selectedUser.uid, 'guest')}
                        disabled={roleUpdatingUid === selectedUser.uid}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${selectedUser.role === 'guest' || !selectedUser.role ? 'bg-hotel-primary text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                      >
                        Guest
                      </button>
                      <button 
                        onClick={() => handleUpdateRole(selectedUser.uid, 'staff')}
                        disabled={roleUpdatingUid === selectedUser.uid}
                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${selectedUser.role === 'staff' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                      >
                        Staff
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-12 no-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-50 pb-3">
                      <IdCard size={16} className="text-hotel-primary" /> Identity Verification
                    </h4>
                    <div className="space-y-4">
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">NID Number</p>
                        <p className="text-sm font-black text-gray-900">{selectedUser.nidNumber || 'Not Provided'}</p>
                      </div>
                      {selectedUser.nidImageUrl && (
                        <div className="relative group cursor-pointer" onClick={() => setLightboxUrl(selectedUser.nidImageUrl)}>
                          <img src={selectedUser.nidImageUrl} className="w-full h-40 object-cover rounded-2xl border border-gray-100 shadow-sm" alt="NID Scan" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                            <Maximize2 className="text-white" size={24} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-50 pb-3">
                      <UserCheck size={16} className="text-hotel-primary" /> Emergency Contact
                    </h4>
                    <div className="space-y-4">
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Guardian Name</p>
                        <p className="text-sm font-black text-gray-900">{selectedUser.guardianName || 'Not Provided'}</p>
                      </div>
                      <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Guardian Phone</p>
                        <p className="text-sm font-black text-gray-900">{selectedUser.guardianPhone || 'Not Provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-100 pb-3">
                    <History size={16} className="text-hotel-primary" /> Stay History & Bookings
                  </h4>
                  <div className="space-y-4">
                    {userBookings.length === 0 ? (
                      <div className="p-10 text-center bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No stay records found for this resident.</p>
                      </div>
                    ) : (
                      userBookings.map(booking => (
                        <div 
                          key={booking.id} 
                          onClick={() => setSelectedBooking(booking)}
                          className="p-6 bg-white border border-gray-100 rounded-[2rem] flex items-center justify-between hover:shadow-xl transition-all cursor-pointer group"
                        >
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-hotel-primary group-hover:bg-hotel-primary group-hover:text-white transition-all">
                              <Building2 size={20} />
                            </div>
                            <div>
                              <h5 className="text-sm font-black text-gray-900">{booking.roomTitle}</h5>
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{booking.checkIn} — {booking.checkOut}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                              booking.status === 'accepted' ? 'bg-green-50 text-green-600' :
                              booking.status === 'rejected' ? 'bg-red-50 text-red-600' :
                              'bg-amber-50 text-amber-600'
                            }`}>
                              {booking.status}
                            </span>
                            <Eye size={18} className="text-gray-300 group-hover:text-hotel-primary transition-colors" />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-[0.3em] flex items-center gap-3 border-b border-gray-50 pb-3">
                    <Activity size={16} className="text-hotel-primary" /> System Metadata
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Joined</p>
                      <p className="text-[10px] font-black text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Active</p>
                      <p className="text-[10px] font-black text-gray-900">{selectedUser.lastActive ? new Date(selectedUser.lastActive).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Last Path</p>
                      <p className="text-[10px] font-black text-gray-900 truncate">{selectedUser.lastSeenPath || '/'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">UID</p>
                      <p className="text-[10px] font-black text-gray-900 truncate">{selectedUser.uid}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200 p-10 text-center">
              <div className="w-20 h-20 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-gray-200 mb-6">
                <Users size={40} />
              </div>
              <h3 className="text-xl font-serif font-black text-gray-900 mb-2">Select a Resident</h3>
              <p className="text-xs text-gray-400 font-medium max-w-xs leading-relaxed">Choose an account from the directory to view detailed profile information, stay history, and identity verification.</p>
            </div>
          )}
        </div>
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
                                   <div className="mt-4"><div onClick={() => setLightboxUrl(guest.nidImageUrl)} className="w-full aspect-video rounded-[1.5rem] overflow-hidden shadow-md border-2 border-white bg-gray-100 relative group cursor-zoom-in"><img src={guest.nidImageUrl} className="w-full h-full object-contain" referrerPolicy="no-referrer" /><div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center"><Maximize2 className="text-white opacity-0 group-hover:opacity-100" size={24} /></div></div></div>
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
          <img src={lightboxUrl} className="max-w-full max-h-full object-contain shadow-2xl rounded-xl" alt="Document Full View" referrerPolicy="no-referrer" />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
