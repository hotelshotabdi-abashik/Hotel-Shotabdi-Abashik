
import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, Search, CheckCircle2, XCircle, 
  Loader2, Mail, Phone, IdCard, ShieldCheck, 
  Clock, Building2, Eye, Trash2, AlertTriangle, UserMinus
} from 'lucide-react';
import { db, ref, onValue, update, createNotification, deleteUserProfile } from '../services/firebase';
import { UserProfile, Booking } from '../types';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'bookings'>('bookings');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [acceptingBookingId, setAcceptingBookingId] = useState<string | null>(null);
  const [roomNumberInput, setRoomNumberInput] = useState('');
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const profilesRef = ref(db, 'profiles');
    const bookingsRef = ref(db, 'bookings');

    const uUnsub = onValue(profilesRef, (snapshot) => {
      if (snapshot.exists()) setUsers(Object.values(snapshot.val()));
      else setUsers([]);
      setLoading(false);
    });

    const bUnsub = onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val()) as Booking[];
        setBookings(data.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setBookings([]);
      }
    });

    return () => { uUnsub(); bUnsub(); };
  }, []);

  const handleBookingAction = async (booking: Booking, status: 'accepted' | 'rejected', roomNo?: string) => {
    try {
      await update(ref(db, `bookings/${booking.id}`), {
        status,
        roomNumber: roomNo || null
      });

      const message = status === 'accepted' 
        ? `Stay in ${booking.roomTitle} accepted. Room No: ${roomNo}.` 
        : `Booking for ${booking.roomTitle} rejected.`;

      await createNotification(booking.userId, {
        title: `Booking ${status === 'accepted' ? 'Accepted' : 'Rejected'}`,
        message,
        type: 'booking_update'
      });

      setAcceptingBookingId(null);
      setRoomNumberInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await deleteUserProfile(userToDelete.uid, userToDelete.username);
      setUserToDelete(null);
    } catch (err) {
      console.error("Deletion failed");
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.legalName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(b => 
    b.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.roomTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-hotel-primary mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-32 lg:pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-serif font-black text-gray-900 leading-none">Admin Panel</h1>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mt-2">Owner Access</p>
        </div>
        <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
          {['bookings', 'users'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => { setActiveTab(tab as any); setSearchQuery(''); }}
              className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white shadow-sm text-hotel-primary' : 'text-gray-400'}`}
            >
              {tab} {tab === 'bookings' && bookings.filter(b => b.status === 'pending').length > 0 && `(${bookings.filter(b => b.status === 'pending').length})`}
            </button>
          ))}
        </div>
      </div>

      <div className="relative mb-10 group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
        <input 
          type="text" 
          placeholder={`Search ${activeTab}...`}
          className="w-full bg-white border border-gray-100 rounded-3xl py-5 pl-14 pr-6 text-sm font-semibold outline-none focus:border-hotel-primary shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {activeTab === 'users' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredUsers.length > 0 ? filteredUsers.map(user => (
              <div key={user.uid} className="bg-white rounded-3xl border border-gray-100 p-5 flex items-center justify-between hover:shadow-xl group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100">
                    <img src={user.photoURL} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900">{user.legalName}</h3>
                    <p className="text-[9px] font-bold text-gray-400">@{user.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setSelectedUser(user)} className="p-3 text-gray-300 hover:text-hotel-primary">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => setUserToDelete(user)} className="p-3 text-gray-300 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-20 text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No users found</p>
              </div>
            )}
          </div>
        ) : (
          filteredBookings.length > 0 ? filteredBookings.map(booking => (
            <div key={booking.id} className={`bg-white rounded-3xl border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 ${booking.status === 'pending' ? 'ring-1 ring-hotel-primary/10 shadow-lg' : 'opacity-80'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${booking.status === 'pending' ? 'bg-hotel-primary text-white' : 'bg-gray-50 text-gray-400'}`}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-gray-900">{booking.roomTitle} {booking.roomNumber && <span className="text-green-600 text-[10px] ml-1">#{booking.roomNumber}</span>}</h3>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{booking.userName}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-center"><p className="text-[7px] font-black text-gray-400 uppercase">In</p><p className="text-[10px] font-black">{booking.checkIn}</p></div>
                 <div className="text-center"><p className="text-[7px] font-black text-gray-400 uppercase">Out</p><p className="text-[10px] font-black">{booking.checkOut}</p></div>
                 <div className="flex items-center gap-2">
                    {booking.status === 'pending' ? (
                      <>
                        <button onClick={() => handleBookingAction(booking, 'rejected')} className="p-3 text-gray-300 hover:text-hotel-primary"><XCircle size={22} /></button>
                        <button onClick={() => setAcceptingBookingId(booking.id)} className="bg-hotel-primary text-white px-6 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest">Accept</button>
                      </>
                    ) : (
                      <span className={`px-4 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest ${booking.status === 'accepted' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>{booking.status}</span>
                    )}
                 </div>
              </div>
            </div>
          )) : (
            <div className="py-20 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No bookings found</p>
            </div>
          )
        )}
      </div>

      {userToDelete && (
        <div className="fixed inset-0 z-[400] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl relative text-center">
            <h2 className="text-2xl font-serif font-black mb-2">Delete User?</h2>
            <p className="text-xs text-gray-500 mb-8">
              Are you sure you want to delete <span className="font-black text-gray-900">@{userToDelete.username}</span>?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 rounded-2xl"
              >
                Back
              </button>
              <button 
                disabled={deleting}
                onClick={handleDeleteUser}
                className="flex-1 bg-hotel-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-xl"
              >
                {deleting ? <Loader2 className="animate-spin" size={16} /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {acceptingBookingId && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl">
            <h2 className="text-2xl font-serif font-black mb-1">Set Room</h2>
            <p className="text-[9px] font-bold text-gray-400 uppercase mb-8 text-center">Enter room number</p>
            <input autoFocus type="text" placeholder="e.g. 101" className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 mb-6 font-black text-sm outline-none shadow-inner" value={roomNumberInput} onChange={(e) => setRoomNumberInput(e.target.value)} />
            <div className="flex gap-4">
              <button onClick={() => setAcceptingBookingId(null)} className="flex-1 py-4 text-[9px] font-black uppercase text-gray-400">Cancel</button>
              <button disabled={!roomNumberInput} onClick={() => { const b = bookings.find(x => x.id === acceptingBookingId); if (b) handleBookingAction(b, 'accepted', roomNumberInput); }} className="flex-1 bg-hotel-primary text-white py-4 rounded-2xl font-black text-[9px] uppercase shadow-lg">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-4">
                <img src={selectedUser.photoURL} className="w-12 h-12 rounded-xl border border-white" />
                <div>
                  <h3 className="text-xl font-black text-gray-900">{selectedUser.legalName}</h3>
                  <p className="text-[8px] font-black text-hotel-primary uppercase">User Record</p>
                </div>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 text-gray-400"><XCircle size={24} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div><p className="text-[8px] font-black text-gray-400 uppercase mb-1">NID</p><p className="text-xs font-mono font-black">{selectedUser.nidNumber}</p></div>
                 <div><p className="text-[8px] font-black text-gray-400 uppercase mb-1">Guardian</p><p className="text-xs font-black">{selectedUser.guardianPhone}</p></div>
              </div>
              <div className="rounded-[2rem] overflow-hidden border-2 border-gray-100 aspect-video bg-gray-100">
                <img src={selectedUser.nidImageUrl} className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
