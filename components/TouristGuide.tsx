
import React, { useState } from 'react';
import { Compass, ArrowRight, MapPin, Search, Camera, RefreshCw, Trash2, Plus, Clock } from 'lucide-react';
import { Attraction } from '../types';

interface Props {
  touristGuides: Attraction[];
  isEditMode?: boolean;
  onUpdate?: (tg: Attraction[]) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const DEFAULT_ATTRACTIONS: Attraction[] = [
  { id: 1, name: "Keane Bridge", subtitle: "Historic Landmark", distance: "0.8 km", description: "The 'Gateway to Sylhet'. An iconic 1936 steel structure offering panoramic river views.", image: "https://images.unsplash.com/photo-1623057000739-30ac5bb06227?auto=format&fit=crop&q=80", mapUrl: "#" },
  { id: 2, name: "Shah Jalal Dargah", subtitle: "Spiritual Center", distance: "1.5 km", description: "The most sacred spiritual site in the region, housing the tomb of the famous saint.", image: "https://images.unsplash.com/photo-1596701062351-be5f6a210d7d?auto=format&fit=crop&q=80", mapUrl: "#" },
  { id: 3, name: "Malnicherra Tea Estate", subtitle: "Nature & Heritage", distance: "3.5 km", description: "The oldest tea garden in South Asia. Rolling hills of green as far as the eye can see.", image: "https://images.unsplash.com/photo-1594631252845-29fc4586c55c?auto=format&fit=crop&q=80", mapUrl: "#" },
  { id: 4, name: "Ratargul Swamp Forest", subtitle: "Natural Wonder", distance: "26 km", description: "Bangladesh's only freshwater swamp forest. A mystical boat journey through submerged trees.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80", mapUrl: "#" },
  { id: 5, name: "Bisnakandi", subtitle: "Stone & Stream", distance: "42 km", description: "Where the Meghalaya mountains meet the clear blue streams. A paradise for nature lovers.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80", mapUrl: "#" },
  { id: 6, name: "Jaflong", subtitle: "Stone Collection", distance: "56 km", description: "Famous for its stone collection from the riverbed and the stunning Zero Point border.", image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80", mapUrl: "#" },
  { id: 7, name: "Surma River Cruise", subtitle: "Waterway", distance: "0.5 km", description: "Enjoy a relaxing boat ride on the Surma River right in the heart of the city.", image: "https://images.unsplash.com/photo-1544735032-6a71dd6414fe?auto=format&fit=crop&q=80", mapUrl: "#" },
  { id: 8, name: "Shah Paran Dargah", subtitle: "Spiritual", distance: "8.0 km", description: "A major pilgrimage site located on a hilltop on the outskirts of Sylhet city.", image: "https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?auto=format&fit=crop&q=80", mapUrl: "#" },
  { id: 9, name: "Adventure World", subtitle: "Theme Park", distance: "5.5 km", description: "A popular amusement park for families and kids near the airport road.", image: "https://images.unsplash.com/photo-1502139214982-d0ad755818d8?auto=format&fit=crop&q=80", mapUrl: "#" },
  { id: 10, name: "Osmani Museum", subtitle: "Historical", distance: "1.2 km", description: "Dedicated to General M.A.G. Osmani, the commander-in-chief of Bangladesh's 1971 war.", image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80", mapUrl: "#" },
  { id: 11, name: "Lalakhal", subtitle: "Blue Water", distance: "38 km", description: "Known for its turquoise blue water and the scenic boat rides leading to the mountains.", image: "https://images.unsplash.com/photo-1439405326854-014607f694d7?auto=format&fit=crop&q=80", mapUrl: "#" },
  { id: 12, name: "Panthumai Waterfall", subtitle: "Waterfall", distance: "45 km", description: "One of the most beautiful waterfalls near the border, surrounded by lush forest.", image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80", mapUrl: "#" },
  { id: 13, name: "Lakkatura Tea Garden", subtitle: "Nature", distance: "4.2 km", description: "A peaceful retreat very close to the stadium, perfect for a morning walk.", image: "https://images.unsplash.com/photo-1594631252845-29fc4586c55c?auto=format&fit=crop&q=80", mapUrl: "#" },
  { id: 14, name: "Sreemangal", subtitle: "Tea Capital", distance: "95 km", description: "The tea capital of Bangladesh. Home to the Lawachara National Park.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80", mapUrl: "#" },
  { id: 15, name: "Ali Amjad Clock Tower", subtitle: "Historic", distance: "0.8 km", description: "A century-old clock tower located next to Keane Bridge on the river bank.", image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80", mapUrl: "#" }
];

const TouristGuide: React.FC<Props> = ({ touristGuides = [], isEditMode, onUpdate, onImageUpload }) => {
  const [visibleCount, setVisibleCount] = useState(8);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const displayList = touristGuides.length > 0 ? touristGuides : DEFAULT_ATTRACTIONS;

  const filtered = displayList.filter(spot => 
    spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spot.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageChange = async (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      setUploadingId(id);
      try {
        const url = await onImageUpload(file);
        const updated = displayList.map(r => r.id === id ? { ...r, image: url } : r);
        onUpdate?.(updated);
      } finally {
        setUploadingId(null);
      }
    }
  };

  const updateSpot = (id: number, field: keyof Attraction, value: any) => {
    const updated = displayList.map(r => r.id === id ? { ...r, [field]: value } : r);
    onUpdate?.(updated);
  };

  const deleteSpot = (id: number) => {
    if (window.confirm("Delete this attraction permanently?")) {
      onUpdate?.(displayList.filter(r => r.id !== id));
    }
  };

  const addSpot = () => {
    const newItem: Attraction = {
      id: Date.now(),
      name: "New Attraction",
      subtitle: "Category",
      distance: "5.0 km",
      description: "A short but engaging description of this local treasure.",
      image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80",
      mapUrl: "#"
    };
    onUpdate?.([newItem, ...displayList]);
  };

  return (
    <section className="bg-gray-50/50 min-h-screen w-full">
      {/* Search & Header Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-12">
        <div className="text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-600 mb-6 shadow-sm">
              <Compass size={32} />
            </div>
            <h2 className="text-3xl md:text-6xl font-sans text-gray-900 mb-6 font-black tracking-tighter">Sylhet Navigator</h2>
            <p className="text-gray-500 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed font-light mb-10">
               From spiritual shrines to mystical swamp forests, discover the absolute best of Sylhet. Distances are calculated from <span className="text-hotel-primary font-black">Hotel Shotabdi</span>.
            </p>
            
            <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-2xl">
              <div className="relative flex-1 w-full">
                  <input 
                      type="text" 
                      placeholder="Search landmarks, shrines, nature spots..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-gray-100 shadow-xl rounded-[1.5rem] py-5 pl-14 pr-6 text-sm focus:border-blue-600 outline-none transition-all"
                  />
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
              </div>
              
              {isEditMode && (
                <button 
                  onClick={addSpot}
                  className="bg-green-600 text-white px-8 py-5 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-green-100 hover:scale-105 active:scale-95 transition-all w-full md:w-auto shrink-0"
                >
                  <Plus size={20} /> Add Place
                </button>
              )}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {filtered.slice(0, visibleCount).map((spot) => (
            <div key={spot.id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 group flex flex-col h-full relative hover:shadow-2xl transition-all duration-700">
              <div className="relative h-52 overflow-hidden shrink-0">
                <img src={spot.image} alt={spot.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur shadow-xl text-blue-600 text-[9px] font-black px-3 py-1.5 rounded-xl border border-blue-50">
                  {isEditMode ? (
                    <div className="flex items-center gap-1">
                      <MapPin size={10} />
                      <input 
                        className="bg-transparent border-none outline-none w-14 font-black" 
                        value={spot.distance} 
                        onChange={(e) => updateSpot(spot.id, 'distance', e.target.value)} 
                      />
                    </div>
                  ) : (
                    <span className="flex items-center gap-1.5"><MapPin size={10} /> {spot.distance}</span>
                  )}
                </div>

                {isEditMode && (
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <label className="cursor-pointer bg-white p-3 rounded-2xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                        <input type="file" className="hidden" onChange={(e) => handleImageChange(spot.id, e)} />
                        {uploadingId === spot.id ? <RefreshCw size={20} className="animate-spin" /> : <Camera size={20} />}
                     </label>
                     <button 
                      onClick={() => deleteSpot(spot.id)}
                      className="bg-white p-3 rounded-2xl text-red-600 hover:bg-red-600 hover:text-white transition-all"
                     >
                       <Trash2 size={20} />
                     </button>
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="mb-4">
                  {isEditMode ? (
                    <input 
                      className="text-lg font-black text-gray-900 border-b-2 border-blue-600 outline-none w-full"
                      value={spot.name}
                      onChange={(e) => updateSpot(spot.id, 'name', e.target.value)}
                    />
                  ) : (
                    <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors">{spot.name}</h3>
                  )}
                  {isEditMode ? (
                    <input 
                      className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5 w-full bg-gray-50 rounded px-2 py-1 outline-none"
                      value={spot.subtitle}
                      onChange={(e) => updateSpot(spot.id, 'subtitle', e.target.value)}
                    />
                  ) : (
                    <span className="text-[9px] font-black text-blue-600 tracking-[0.2em] uppercase block mt-1.5">{spot.subtitle}</span>
                  )}
                </div>
                
                {isEditMode ? (
                  <textarea 
                    className="text-[11px] text-gray-500 bg-gray-50 rounded-xl p-3 h-28 w-full outline-none mt-2 leading-relaxed"
                    value={spot.description}
                    onChange={(e) => updateSpot(spot.id, 'description', e.target.value)}
                  />
                ) : (
                  <p className="text-[11px] text-gray-500 leading-relaxed mb-8 flex-grow line-clamp-3">
                    {spot.description}
                  </p>
                )}

                {!isEditMode && (
                  <div className="mt-auto pt-6 border-t border-gray-50">
                    <a 
                      href={spot.mapUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-2 text-gray-900 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-colors"
                    >
                      Plan Your Trip <ArrowRight size={14} className="text-blue-600" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {visibleCount < filtered.length && (
          <div className="mt-20 text-center">
            <button 
              onClick={() => setVisibleCount(prev => prev + 8)}
              className="px-10 py-5 bg-blue-600 text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95"
            >
              Explore More Landmarks
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TouristGuide;
