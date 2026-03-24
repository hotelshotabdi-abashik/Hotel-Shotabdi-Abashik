
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Tag, Bed, Utensils, Map, History, MessageSquare, 
  ChevronRight, Sparkles, ShieldCheck, Clock
} from 'lucide-react';

import { translations, Language } from '../translations';

interface HomeShortcutsProps {
  language: Language;
}

const HomeShortcuts: React.FC<HomeShortcutsProps> = ({ language }) => {
  const t = translations[language];
  
  const shortcuts = [
    {
      id: 'offers',
      title: t.exclusiveOffers || 'Exclusive Offers',
      desc: language === 'EN' ? 'Save 25% on your next luxury stay with verified deals.' : 'আপনার পরবর্তী লাক্সারি স্টে-তে ২৫% সেভ করুন ভেরিফাইড ডিল সহ।',
      icon: <Tag size={24} />,
      path: '/offers',
      color: 'bg-red-500',
      lightColor: 'bg-red-50'
    },
    {
      id: 'rooms',
      title: t.rooms || 'Our Rooms',
      desc: language === 'EN' ? 'Explore premium suites designed for ultimate comfort.' : 'আপনার সর্বোচ্চ আরামের জন্য ডিজাইন করা প্রিমিয়াম স্যুটগুলো এক্সপ্লোর করুন।',
      icon: <Bed size={24} />,
      path: '/rooms',
      color: 'bg-blue-600',
      lightColor: 'bg-blue-50'
    },
    {
      id: 'restaurants',
      title: t.nearbyDining || 'Nearby Dining',
      desc: language === 'EN' ? 'Discover the best food spots in the heart of Sylhet.' : 'সিলেটের প্রাণকেন্দ্রে সেরা খাবারের জায়গাগুলো আবিষ্কার করুন।',
      icon: <Utensils size={24} />,
      path: '/restaurants',
      color: 'bg-orange-500',
      lightColor: 'bg-orange-50'
    },
    {
      id: 'guide',
      title: t.touristGuide || 'Tourist Guide',
      desc: language === 'EN' ? 'Visit shrines and tea gardens near our residence.' : 'আমাদের রেসিডেন্সের কাছে মাজার এবং চা বাগানগুলো ভিজিট করুন।',
      icon: <Map size={24} />,
      path: '/guide',
      color: 'bg-green-600',
      lightColor: 'bg-green-50'
    },
    {
      id: 'mystays',
      title: t.stayHistory || 'Stay Records',
      desc: language === 'EN' ? 'Access your digital invoices and identity receipts.' : 'আপনার ডিজিটাল ইনভয়েস এবং আইডেন্টিটি রিসিটগুলো অ্যাক্সেস করুন।',
      icon: <History size={24} />,
      path: '/mystays',
      color: 'bg-purple-600',
      lightColor: 'bg-purple-50'
    },
    {
      id: 'helpdex',
      title: t.helpDesk || 'Registry Support',
      desc: language === 'EN' ? 'Connect with our team for 24/7 resident assistance.' : '২৪/৭ রেসিডেন্ট অ্যাসিস্ট্যান্সের জন্য আমাদের টিমের সাথে কানেক্ট করুন।',
      icon: <MessageSquare size={24} />,
      path: '/helpdesk',
      color: 'bg-hotel-primary',
      lightColor: 'bg-red-50'
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-10 py-16 md:py-24 w-full animate-fade-in">
      <div className="mb-12 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-hotel-primary/5 text-hotel-primary text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] mb-4">
           <Sparkles size={12} fill="currentColor" /> {language === 'EN' ? 'Quick Access' : 'কুইক অ্যাক্সেস'}
        </div>
        <h2 className="text-3xl md:text-5xl font-serif font-black text-gray-900 tracking-tighter">{t.exploreHub}</h2>
        <p className="text-gray-500 text-xs md:text-lg mt-3 font-light max-w-2xl leading-relaxed">
          {language === 'EN' ? 'Everything you need for a verified and comfortable stay at' : 'আপনার ভেরিফাইড এবং আরামদায়ক স্টে-র জন্য যা কিছু প্রয়োজন'} <span className="text-hotel-primary font-black">{t.hotelName}</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {shortcuts.map((item) => (
          <Link 
            key={item.id}
            to={item.path}
            className="group relative bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
          >
            <div className={`w-14 h-14 rounded-2xl ${item.lightColor} flex items-center justify-center text-hotel-primary mb-6 transition-all duration-500 group-hover:scale-110 group-hover:bg-hotel-primary group-hover:text-white shadow-inner`}>
              {item.icon}
            </div>
            
            <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-hotel-primary transition-colors">{item.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium mb-8 flex-1">{item.desc}</p>
            
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-gray-50">
               <span className="text-[10px] font-black text-hotel-primary uppercase tracking-[0.2em] flex items-center gap-2">
                 Enter Section <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
               </span>
               <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center">
                    <ShieldCheck size={10} className="text-green-500" />
                  </div>
               </div>
            </div>

            {/* Decorative Corner Glow */}
            <div className={`absolute -top-2 -right-2 w-24 h-24 ${item.lightColor} rounded-full blur-[40px] opacity-0 group-hover:opacity-60 transition-opacity`}></div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HomeShortcuts;
