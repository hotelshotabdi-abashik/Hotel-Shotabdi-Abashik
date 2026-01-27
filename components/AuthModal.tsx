
import React, { useState } from 'react';
import { X, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup
} from '../services/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (onSuccess) onSuccess(result.user);
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setLoading(false);
        return;
      }
      if (err.code === 'auth/unauthorized-domain') {
        setError("Domain Not Authorized: Add this URL to 'Authorized domains' in Firebase Console.");
      } else {
        setError(err.message.replace('Firebase:', '').trim());
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors z-10"
        >
          <X size={20} />
        </button>

        {/* Decorative Header */}
        <div className="bg-hotel-primary p-10 text-white text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
          
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/30 shadow-xl">
            <ShieldCheck size={32} />
          </div>
          
          <h3 className="text-2xl font-serif font-black mb-2">Verified Access</h3>
          <p className="text-white/70 text-[10px] font-bold uppercase tracking-[0.3em]">
            Shotabdi Residential
          </p>
        </div>

        <div className="p-10 space-y-8">
          <div className="text-center space-y-2">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Identify Yourself</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              To ensure a real and safe community, we only accept verified accounts via Google.
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 text-hotel-primary text-[10px] font-black rounded-2xl text-center uppercase tracking-widest animate-pulse">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-white border-2 border-gray-100 text-gray-700 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-sm hover:border-hotel-primary/30 hover:bg-gray-50 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin text-hotel-primary" />
              ) : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                  Continue with Google
                </>
              )}
            </button>
            
            <div className="flex items-center justify-center gap-2 pt-2">
              <Sparkles size={12} className="text-hotel-primary" />
              <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">No Registration Required</span>
            </div>
          </div>

          <div className="bg-gray-50 p-5 rounded-[2rem] border border-gray-100">
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-hotel-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-hotel-primary rounded-full"></div>
                </div>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Automatic identity verification via Google's secure infrastructure.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-hotel-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 bg-hotel-primary rounded-full"></div>
                </div>
                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Instantly access member-only room rates and local guides.</p>
              </div>
            </div>
          </div>
          
          <p className="text-center text-[8px] text-gray-300 font-bold uppercase tracking-widest">
            By continuing, you agree to our Residency Terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
