
import React, { useState, useEffect, useRef } from 'react';
import { 
  Image as ImageIcon, PlayCircle, Upload, Trash2, 
  Loader2, Plus, X, Maximize2, CheckCircle2
} from 'lucide-react';
import { 
  db, auth, ref, onValue, push, set, remove, 
  OWNER_EMAIL, get 
} from '../services/firebase';
import { GalleryItem } from '../types';
import { translations, Language } from '../translations';

interface GalleryProps {
  isEditMode?: boolean;
  language: Language;
  onImageUpload?: (file: File) => Promise<string>;
  onImageDelete?: (url: string) => Promise<boolean>;
}

const GallerySection: React.FC<GalleryProps> = ({ isEditMode, language, onImageUpload, onImageDelete }) => {
  const t = translations[language];
  const user = auth.currentUser;
  const isAdmin = user?.email === OWNER_EMAIL;

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const galleryRef = ref(db, 'gallery');
    
    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);

    const unsub = onValue(galleryRef, (snapshot) => {
      clearTimeout(timeout);
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val()) as GalleryItem[];
        setItems(data.sort((a, b) => b.createdAt - a.createdAt));
      } else {
        setItems([]);
      }
      setLoading(false);
    }, (error) => {
      console.error("Gallery fetch error:", error);
      clearTimeout(timeout);
      setLoading(false);
    });

    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;

    setUploading(true);
    try {
      const url = await onImageUpload(file);
      const isVideo = file.type.startsWith('video/');
      
      const newItemRef = push(ref(db, 'gallery'));
      const newItem: GalleryItem = {
        id: newItemRef.key!,
        url,
        type: isVideo ? 'video' : 'image',
        createdAt: Date.now(),
        title: file.name
      };
      
      await set(newItemRef, newItem);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Delete this item from gallery?")) return;
    
    try {
      // 1. Delete from R2 if onImageDelete is provided
      if (onImageDelete) {
        await onImageDelete(item.url);
      }
      
      // 2. Delete from Realtime Database
      await remove(ref(db, `gallery/${item.id}`));
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-hotel-primary mb-4" size={40} />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Loading Gallery...</p>
      </div>
    );
  }

  return (
    <section id="gallery" className="py-20 px-4 md:px-10 bg-white w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="text-left">
            <h2 className="text-4xl md:text-6xl font-serif font-black text-gray-900 tracking-tight mb-4">
              {language === 'EN' ? 'Visual Gallery' : 'ভিজ্যুয়াল গ্যালারি'}
            </h2>
            <p className="text-xs md:text-sm font-black text-hotel-primary uppercase tracking-[0.3em]">
              {language === 'EN' ? 'Moments of Excellence' : 'উৎকর্ষের মুহূর্ত'}
            </p>
          </div>

          {isAdmin && isEditMode && (
            <div className="flex items-center gap-4">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*,video/*"
                onChange={handleFileUpload}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-hotel-primary text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {uploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                {language === 'EN' ? 'Add to Gallery' : 'গ্যালারিতে যোগ করুন'}
              </button>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[3rem]">
            <ImageIcon size={48} className="mx-auto text-gray-200 mb-6" />
            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No items in gallery yet</p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {items.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="relative group cursor-pointer overflow-hidden rounded-3xl bg-gray-100 break-inside-avoid shadow-sm hover:shadow-2xl transition-all duration-500"
              >
                {item.type === 'video' ? (
                  <div className="relative">
                    <video 
                      src={item.url} 
                      className="w-full h-auto object-cover"
                      muted
                      loop
                      onMouseOver={(e) => e.currentTarget.play()}
                      onMouseOut={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <PlayCircle size={48} className="text-white opacity-80 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                ) : (
                  <img 
                    src={item.url} 
                    alt={item.title || "Gallery Item"} 
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                       <Maximize2 size={16} className="text-white" />
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">View Full</span>
                    </div>
                    {isAdmin && isEditMode && (
                      <button 
                        onClick={(e) => handleDelete(item, e)}
                        className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-10">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setSelectedItem(null)}></div>
          <button 
            onClick={() => setSelectedItem(null)}
            className="absolute top-6 right-6 md:top-10 md:right-10 z-[10001] p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"
          >
            <X size={24} />
          </button>
          
          <div className="relative max-w-6xl w-full max-h-[90vh] flex items-center justify-center animate-scale-in">
            {selectedItem.type === 'video' ? (
              <video 
                src={selectedItem.url} 
                className="max-w-full max-h-[80vh] rounded-3xl shadow-2xl"
                controls
                autoPlay
              />
            ) : (
              <img 
                src={selectedItem.url} 
                alt="Full view" 
                className="max-w-full max-h-[80vh] object-contain rounded-3xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            )}
            
            <div className="absolute -bottom-16 left-0 right-0 text-center">
               <p className="text-white font-black text-xs uppercase tracking-[0.4em] opacity-60">
                 {selectedItem.createdAt ? new Date(selectedItem.createdAt).toLocaleDateString() : '---'}
               </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
