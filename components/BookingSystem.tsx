import React, { useState, useEffect } from 'react';
import { auth, rtdb, createBooking, cancelBooking } from '../services/firebase';
import { ref, onValue, query as rtdbQuery, orderByChild, equalTo } from 'firebase/database';
import { UserProfile, Booking } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Clock, Shield, AlertCircle, CheckCircle, XCircle, User, Phone, Image as ImageIcon, Fingerprint } from 'lucide-react';

export const BookingSystem: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  // 1. Sync Profile and Bookings
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const profileRef = ref(rtdb, `profiles/${user.uid}`);
    const unsubProfile = onValue(profileRef, (snap) => {
      if (snap.exists()) {
        setProfile(snap.val() as UserProfile);
      }
      setLoading(false);
    }, (err) => console.error("Profile sync failed", err));

    const bookingsRef = ref(rtdb, "bookings");
    const q = rtdbQuery(
      bookingsRef,
      orderByChild("userId"),
      equalTo(user.uid)
    );

    const unsubBookings = onValue(q, (snap) => {
      const list: Booking[] = [];
      snap.forEach(d => {
        list.push({ ...d.val(), id: d.key } as Booking);
      });
      // Sort by createdAt descending manually since RTDB doesn't support multiple orderBys easily
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setBookings(list);
    }, (err) => console.error("Bookings sync failed", err));

    return () => {
      unsubProfile();
      unsubBookings();
    };
  }, []);

  // 2. Cooldown Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const newCooldowns: Record<string, number> = {};
      
      bookings.forEach(booking => {
        if (booking.status === 'pending' && booking.cancelCooldownUntil) {
          const until = typeof booking.cancelCooldownUntil === 'number' 
            ? booking.cancelCooldownUntil 
            : new Date(booking.cancelCooldownUntil).getTime();
          
          if (until > now) {
            newCooldowns[booking.id] = Math.ceil((until - now) / 1000);
          }
        }
      });
      
      setCooldowns(newCooldowns);
    }, 1000);

    return () => clearInterval(timer);
  }, [bookings]);

  // 3. Profile Completion Check
  const isProfileIncomplete = profile && (
    !profile.legalName || 
    !profile.phone || 
    !profile.guardianName || 
    !profile.guardianPhone || 
    !profile.nidNumber || 
    !profile.nidImageUrl
  );

  // 4. Expiration Check (>24h Pending)
  const hasExpiredPendingBooking = bookings.some(b => {
    if (b.status !== 'pending') return false;
    const created = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
    return Date.now() - created > 24 * 60 * 60 * 1000;
  });

  const handleTestBooking = async () => {
    setBookingInProgress(true);
    try {
      await createBooking({
        roomTitle: "Luxury Suite 101",
        roomId: "room_101",
        checkIn: "2026-04-01",
        checkOut: "2026-04-05",
        totalGuests: 2,
        guests: [],
        price: "৳5000",
        bookingMode: 'website'
      });
    } catch (e) {
      console.error(e);
    } finally {
      setBookingInProgress(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (isProfileIncomplete) {
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border border-red-100 mt-10">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <Shield className="w-8 h-8" />
          <h2 className="text-xl font-bold">Profile Lock Active</h2>
        </div>
        <p className="text-gray-600 mb-6">
          To ensure security and compliance, please complete your profile before booking a room.
        </p>
        <div className="space-y-3 mb-8">
          {[
            { label: 'Full Legal Name', icon: User, done: !!profile?.legalName },
            { label: 'Phone Number', icon: Phone, done: !!profile?.phone },
            { label: 'Guardian Info', icon: Shield, done: !!profile?.guardianName },
            { label: 'NID Number', icon: Fingerprint, done: !!profile?.nidNumber },
            { label: 'NID Image', icon: ImageIcon, done: !!profile?.nidImageUrl },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
              </div>
              {item.done ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
            </div>
          ))}
        </div>
        <button 
          onClick={() => window.location.href = '/profile'}
          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors"
        >
          Complete Profile Now
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Expiration Warning */}
      <AnimatePresence>
        {hasExpiredPendingBooking && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-800"
          >
            <AlertCircle className="w-6 h-6 shrink-0" />
            <div>
              <p className="font-bold">All rooms are reserved</p>
              <p className="text-sm opacity-90">You have a pending booking that has exceeded the 24-hour verification window. Please contact support.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Booking Action */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Quick Book
          </h3>
          <div className="aspect-video bg-gray-100 rounded-xl mb-4 overflow-hidden">
            <img 
              src="https://picsum.photos/seed/room/800/450" 
              alt="Luxury Room" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="mb-6">
            <h4 className="font-bold text-xl">Luxury Suite 101</h4>
            <p className="text-gray-500 text-sm">Sylhet, Bangladesh · ৳5000/night</p>
          </div>
          <button 
            onClick={handleTestBooking}
            disabled={bookingInProgress || hasExpiredPendingBooking}
            className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {bookingInProgress ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>

        {/* Active Bookings */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            Your Bookings
          </h3>
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed">
                No active bookings found.
              </div>
            ) : (
              bookings.map((booking) => {
                const isPending = booking.status === 'pending';
                const cooldown = cooldowns[booking.id];
                const created = typeof booking.createdAt === 'number' ? booking.createdAt : (booking.createdAt?.toMillis?.() || Date.now());
                const isWithin24h = Date.now() - created < 24 * 60 * 60 * 1000;
                const canCancel = isPending && isWithin24h && !cooldown;

                return (
                  <motion.div 
                    layout
                    key={booking.id}
                    className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold">{booking.roomTitle}</h4>
                        <p className="text-xs text-gray-400">
                          {new Date(created).toLocaleDateString()} · {booking.price}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        booking.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                        booking.status === 'cancelled' ? 'bg-gray-100 text-gray-500' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    {isPending && (
                      <div className="mt-4 flex items-center gap-2">
                        <button
                          onClick={() => cancelBooking(booking.id)}
                          disabled={!canCancel}
                          className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                            canCancel 
                              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {cooldown ? (
                            <>
                              <Clock className="w-3 h-3 animate-pulse" />
                              Wait {Math.floor(cooldown / 60)}:{(cooldown % 60).toString().padStart(2, '0')}
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              Cancel Booking
                            </>
                          )}
                        </button>
                        {!isWithin24h && (
                          <div className="text-[10px] text-gray-400 italic">
                            Cancellation window expired
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSystem;
