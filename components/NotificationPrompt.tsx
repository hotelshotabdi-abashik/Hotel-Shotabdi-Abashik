
import React from 'react';
import { BellRing, ShieldCheck, X } from 'lucide-react';

interface Props {
  onAccept: () => void;
  onDecline: () => void;
}

const NotificationPrompt: React.FC<Props> = ({ onAccept, onDecline }) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 ring-1 ring-black/5">
        <div className="bg-hotel-primary p-8 text-white text-center relative">
          <button onClick={onDecline} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors">
            <X size={18} />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4">
            <BellRing size={32} className="animate-bounce" />
          </div>
          <h3 className="text-xl font-serif font-black">Stay Alerts</h3>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-80 mt-1">Registry Synchronization</p>
        </div>
        
        <div className="p-8 space-y-6 text-center">
          <p className="text-xs text-gray-500 leading-relaxed font-medium">
            Enable notifications to receive real-time updates on your <span className="text-hotel-primary font-bold">Booking Status</span> and check-in clearances.
          </p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={onAccept}
              className="w-full bg-hotel-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-red-100 hover:brightness-110 transition-all flex items-center justify-center gap-3 active:scale-95"
            >
              <ShieldCheck size={16} /> Enable Notifications
            </button>
            <button 
              onClick={onDecline}
              className="w-full text-gray-400 py-2 text-[9px] font-black uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;
