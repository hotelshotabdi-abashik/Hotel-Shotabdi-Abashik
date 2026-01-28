
import React, { useState } from 'react';
import { Compass, ArrowRight, MapPin, Search, Camera, RefreshCw, Trash2, Plus, Globe, ExternalLink, Wand2, CheckSquare, Map as MapIcon, Phone } from 'lucide-react';
import { Attraction } from '../types';

interface Props {
  touristGuides: Attraction[];
  isEditMode?: boolean;
  onUpdate?: (tg: Attraction[]) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const DEFAULT_ATTRACTIONS: Attraction[] = [
  { id: 1, name: "Keane Bridge", subtitle: "Historic Landmark", distance: "0.8 km", description: "The 'Gateway to Sylhet'. An iconic 1936 steel structure offering panoramic river views.", image: "https://images.unsplash.com/photo-1623057000739-30ac5bb06227?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Keane+Bridge+Sylhet" },
  { id: 2, name: "Shah Jalal Dargah", subtitle: "Spiritual Center", distance: "1.5 km", description: "The most sacred spiritual site in the region, housing the tomb of the famous saint.", image: "https://images.unsplash.com/photo-1596701062351-be5f6a210d7d?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Shah+Jalal+Dargah+Sylhet" },
  { id: 3, name: "Malnicherra Tea Estate", subtitle: "Nature & Heritage", distance: "3.5 km", description: "The oldest tea garden in South Asia. Rolling hills of green as far as the eye can see.", image: "https://images.unsplash.com/photo-1594631252845-29fc4586c55c?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Malnicherra+Tea+Estate" },
  { id: 4, name: "Ratargul Swamp Forest", subtitle: "Natural Wonder", distance: "26 km", description: "Bangladesh's only freshwater swamp forest. A mystical boat journey through submerged trees.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Ratargul+Swamp+Forest" },
  { id: 5, name: "Bisnakandi", subtitle: "Stone & Stream", distance: "42 km", description: "Where the Meghalaya mountains meet the clear blue streams. A paradise for nature lovers.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Bisnakandi+Sylhet" },
  { id: 6, name: "Jaflong", subtitle: "Stone Collection", distance: "56 km", description: "Famous for its stone collection from the riverbed and the stunning Zero Point border.", image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Jaflong+Sylhet" },
  { id: 7, name: "Shah Paran Dargah", subtitle: "Spiritual Center", distance: "7.0 km", description: "The shrine of Shah Paran, a nephew of Shah Jalal. A peaceful pilgrimage site.", image: "https://images.unsplash.com/photo-1596701062351-be5f6a210d7d?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Shah+Paran+Dargah+Sylhet" },
  { id: 8, name: "Lakkatura Tea Garden", subtitle: "Nature", distance: "3.0 km", description: "One of the largest and most accessible tea gardens, perfect for evening walks.", image: "https://images.unsplash.com/photo-1594631252845-29fc4586c55c?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Lakkatura+Tea+Garden" },
  { id: 9, name: "Pangthumai Waterfall", subtitle: "Waterfall", distance: "52 km", description: "A beautiful waterfall located on the border with India, known as Borhill Falls in India.", image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Pangthumai+Waterfall+Sylhet" },
  { id: 10, name: "Khadimnagar National Park", subtitle: "Eco Park", distance: "14 km", description: "A biodiversity hotspot with trekking trails and rich flora and fauna.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Khadimnagar+National+Park" },
  { id: 11, name: "Adventure World", subtitle: "Amusement Park", distance: "8.5 km", description: "Popular family destination with rides and water activities near the airport.", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Adventure+World+Sylhet" },
  { id: 12, name: "Dreamland Amusement Park", subtitle: "Amusement Park", distance: "11 km", description: "Features a variety of rides and a large water park for all ages.", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Dreamland+Park+Sylhet" },
  { id: 13, name: "Osmani Museum", subtitle: "History", distance: "1.2 km", description: "The former home of General M.A.G. Osmani, now a museum showcasing liberation war history.", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Osmani+Museum+Sylhet" },
  { id: 14, name: "Museum of Rajas", subtitle: "History", distance: "1.5 km", description: "Dedicated to Hason Raja, the folk poet and mystic philosopher of Bengal.", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Museum+of+Rajas+Sylhet" },
  { id: 15, name: "Ali Amjad's Clock", subtitle: "Landmark", distance: "0.8 km", description: "A historical clock tower built in 1874 by Nawab Ali Amjad Khan.", image: "https://images.unsplash.com/photo-1623057000739-30ac5bb06227?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Ali+Amjad+Clock+Sylhet" },
  { id: 16, name: "Sylhet Shahi Eidgah", subtitle: "Architecture", distance: "2.5 km", description: "A Mughal-era massive prayer ground with beautiful arches and history.", image: "https://images.unsplash.com/photo-1596701062351-be5f6a210d7d?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Sylhet+Shahi+Eidgah" },
  { id: 17, name: "Tilagarh Eco Park", subtitle: "Eco Park", distance: "5.5 km", description: "Small wildlife sanctuary with deers, peacocks, and lush greenery.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Tilagarh+Eco+Park+Sylhet" },
  { id: 18, name: "Shahjalal University Campus", subtitle: "Education", distance: "6.0 km", description: "Beautiful hilly campus known for its natural beauty and modern architecture.", image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=SUST+Sylhet" },
  { id: 19, name: "Surma River Cruise", subtitle: "Leisure", distance: "0.7 km", description: "Boat rides available along the Surma river for a serene sunset view.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Surma+River+Sylhet" },
  { id: 20, name: "Lala Khal", subtitle: "Nature", distance: "38 km", description: "A turquoise blue water river surrounded by lush green hills.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Lala+Khal+Sylhet" },
  { id: 21, name: "Tanguar Haor", subtitle: "Nature", distance: "95 km", description: "A massive wetland system known for biodiversity and crystal clear water.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Tanguar+Haor" },
  { id: 22, name: "Niladri Lake", subtitle: "Nature", distance: "110 km", description: "Often called the 'Switzerland of Bengal', a stunning limestone lake.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Niladri+Lake+Sunamganj" },
  { id: 23, name: "Jadnukata River", subtitle: "Nature", distance: "105 km", description: "A very wide river with white sand and blue water, framed by Meghalaya hills.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Jadukata+River" },
  { id: 24, name: "Shimul Bagan", subtitle: "Nature", distance: "102 km", description: "The largest cotton tree garden in Bangladesh, stunning during bloom season.", image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Shimul+Bagan+Sunamganj" },
  { id: 25, name: "Bibir Pukur", subtitle: "History", distance: "1.0 km", description: "A historical pond in the heart of the city associated with local legends.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Bibir+Pukur+Sylhet" },
  { id: 26, name: "Tamabil Border", subtitle: "Border Point", distance: "54 km", description: "The gateway to Meghalaya, India. A scenic mountain road entry point.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Tamabil+Border+Sylhet" },
  { id: 27, name: "Gowainghat River", subtitle: "Nature", distance: "45 km", description: "Quiet boat rides through lush greenery and rural Sylhet landscapes.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Gowainghat+Sylhet" },
  { id: 28, name: "Hason Raja Museum", subtitle: "History", distance: "1.6 km", description: "Exploring the life and songs of the legendary folk mystic Hason Raja.", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Hason+Raja+Museum+Sylhet" },
  { id: 29, name: "Sylhet Railway Station", subtitle: "Architecture", distance: "2.0 km", description: "Modern architectural design representing the local heritage and tourism.", image: "https://images.unsplash.com/photo-1474487585632-70d28581014a?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Sylhet+Railway+Station" },
  { id: 30, name: "Osmani International Airport", subtitle: "Landmark", distance: "9.0 km", description: "A beautifully maintained international airport surrounded by tea gardens.", image: "https://images.unsplash.com/photo-1436491865332-7a61a109c0f2?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Osmani+Airport+Sylhet" },
  { id: 31, name: "Blue Water Shopping City", subtitle: "Leisure", distance: "1.1 km", description: "The primary high-end shopping destination in the heart of Sylhet city.", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Blue+Water+Shopping+Sylhet" },
  { id: 32, name: "Al-Hamra Shopping City", subtitle: "Leisure", distance: "1.2 km", description: "Popular shopping mall for electronics, clothing, and local fashion.", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Al+Hamra+Shopping+Sylhet" },
  { id: 33, name: "Zindabazar Market", subtitle: "Leisure", distance: "1.0 km", description: "The busiest commercial hub of Sylhet, famous for traditional silk and crafts.", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Zindabazar+Sylhet" },
  { id: 34, name: "Sylhet Circuit House", subtitle: "Landmark", distance: "0.9 km", description: "Historical government building with beautiful architecture and gardens.", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Sylhet+Circuit+House" },
  { id: 35, name: "Govt. Pilot School", subtitle: "History", distance: "1.1 km", description: "One of the oldest educational institutions in the region with legacy architecture.", image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Sylhet+Govt+Pilot+High+School" },
  { id: 36, name: "Madhabpur Lake", subtitle: "Nature", distance: "88 km", description: "A stunning lake surrounded by tea gardens and lily pads.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Madhabpur+Lake+Sylhet" },
  { id: 37, name: "Hum Hum Waterfall", subtitle: "Adventure", distance: "92 km", description: "A hidden waterfall deep in the Rajkandi forest, requiring a trek.", image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Hum+Hum+Waterfall" },
  { id: 38, name: "Lawachara National Park", subtitle: "Nature", distance: "85 km", description: "The most famous rain forest in Bangladesh, home to the Hoolock Gibbon.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Lawachara+National+Park" },
  { id: 39, name: "Baikka Beel", subtitle: "Nature", distance: "90 km", description: "A bird sanctuary known for migratory birds and observation towers.", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Baikka+Beel" },
  { id: 40, name: "Finlay Tea Estate", subtitle: "Nature", distance: "82 km", description: "Pristine tea gardens known for their systematic layout and natural charm.", image: "https://images.unsplash.com/photo-1594631252845-29fc4586c55c?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Finlay+Tea+Estate" },
  { id: 41, name: "Monipuri Para", subtitle: "Culture", distance: "3.5 km", description: "Home to the Monipuri community, famous for their traditional hand-loomed cloth.", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Monipuri+Para+Sylhet" },
  { id: 42, name: "MC College", subtitle: "Education", distance: "4.5 km", description: "Historical college campus with iconic red buildings and a long history.", image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=MC+College+Sylhet" },
  { id: 43, name: "Sylhet Stadium", subtitle: "Sports", distance: "8.0 km", description: "Known as one of the most beautiful cricket grounds, carved into a hill.", image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Sylhet+International+Cricket+Stadium" },
  { id: 44, name: "Rose View Pool Side", subtitle: "Leisure", distance: "1.5 km", description: "A luxurious place to relax with a panoramic view of the city skyline.", image: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Rose+View+Hotel+Pool" },
  { id: 45, name: "Jafflong Zero Point", subtitle: "Nature", distance: "57 km", description: "The exact point where the river enters Bangladesh from the Indian mountains.", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Jaflong+Zero+Point" },
  { id: 46, name: "Sangam Restaurant Corner", subtitle: "Food", distance: "0.5 km", description: "Historical food corner famous for traditional breakfast and snacks.", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Sangam+Sylhet" },
  { id: 47, name: "Amborkhana Point", subtitle: "Landmark", distance: "1.8 km", description: "A major intersection and gateway to the airport and tea gardens.", image: "https://images.unsplash.com/photo-1623057000739-30ac5bb06227?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Amborkhana+Point+Sylhet" },
  { id: 48, name: "Bandar Bazar", subtitle: "Leisure", distance: "0.9 km", description: "One of the oldest wholesale and retail markets in the city.", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Bandar+Bazar+Sylhet" },
  { id: 49, name: "Shah Amanat Shopping", subtitle: "Leisure", distance: "1.2 km", description: "Reliable shopping mall for local needs and affordable clothing.", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Shah+Amanat+Shopping+Sylhet" },
  { id: 50, name: "Hotel Shotabdi Lobby", subtitle: "Home", distance: "0 km", description: "Our very own lobby lounge, providing information and travel assistance for guests.", image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80", mapUrl: "https://www.google.com/maps/search/?api=1&query=Hotel+Shotabdi+Residential+Sylhet" }
];

const TouristGuide: React.FC<Props> = ({ touristGuides = [], isEditMode, onUpdate, onImageUpload }) => {
  const [visibleCount, setVisibleCount] = useState(12);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingId, setUploadingId] = useState<number | null>(null);

  const displayList = touristGuides.length > 0 ? touristGuides : DEFAULT_ATTRACTIONS;

  const filtered = displayList.filter(spot => 
    spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spot.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const generateMapUrl = (name: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' Sylhet, Bangladesh')}`;
  };

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

  const syncMapLink = (id: number) => {
    const spot = displayList.find(s => s.id === id);
    if (spot && spot.name) {
      updateSpot(id, 'mapUrl', generateMapUrl(spot.name));
    }
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
      mapUrl: "",
      phone: ""
    };
    onUpdate?.([newItem, ...displayList]);
  };

  return (
    <section id="guide" className="bg-gray-50/50 min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-8 md:pt-12 pb-8 md:pb-12">
        <div className="text-center flex flex-col items-center">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-blue-600/10 rounded-xl md:rounded-2xl flex items-center justify-center text-blue-600 mb-4 md:mb-6 shadow-sm">
              <Compass size={24} />
            </div>
            <h2 className="text-3xl md:text-6xl font-sans text-gray-900 mb-4 md:mb-6 font-black tracking-tighter">Sylhet Navigator</h2>
            <p className="text-gray-500 text-xs md:text-lg max-w-2xl mx-auto leading-relaxed font-light mb-8 md:mb-10 px-4">
               Explore shrines, nature, and culture. Distances from <span className="text-hotel-primary font-black">Hotel Shotabdi</span>.
            </p>
            
            <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-2xl px-4 md:px-0">
              <div className="relative flex-1 w-full">
                  <input 
                      type="text" 
                      placeholder="Search landmarks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-gray-100 shadow-xl rounded-xl md:rounded-[1.5rem] py-3 md:py-5 pl-10 md:pl-14 pr-4 text-xs md:text-sm focus:border-blue-600 outline-none transition-all"
                  />
                  <Search className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
              </div>
              
              {isEditMode && (
                <button 
                  onClick={addSpot}
                  className="bg-green-600 text-white px-6 md:px-8 py-3 md:py-5 rounded-xl md:rounded-[1.5rem] font-black text-[8px] md:text-[10px] uppercase tracking-widest flex items-center gap-2 md:gap-3 shadow-xl shadow-green-100 hover:scale-105 active:scale-95 transition-all w-full md:w-auto shrink-0"
                >
                  <Plus size={16} /> Add Place
                </button>
              )}
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-32">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-8">
          {filtered.slice(0, visibleCount).map((spot) => (
            <div key={spot.id} className="bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 group flex flex-col h-full relative hover:shadow-2xl transition-all duration-700">
              <div className="relative h-32 md:h-52 overflow-hidden shrink-0">
                <img src={spot.image} alt={spot.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                
                <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-white/95 backdrop-blur shadow-xl text-blue-600 text-[7px] md:text-[9px] font-black px-2 py-1 rounded-lg md:rounded-xl border border-blue-50">
                  <span className="flex items-center gap-1"><MapPin size={8} /> {spot.distance}</span>
                </div>

                {isEditMode && (
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <label className="cursor-pointer bg-white p-2 rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                        <input type="file" className="hidden" onChange={(e) => handleImageChange(spot.id, e)} />
                        {uploadingId === spot.id ? <RefreshCw size={14} className="animate-spin" /> : <Camera size={14} />}
                     </label>
                     <button 
                      onClick={() => deleteSpot(spot.id)}
                      className="bg-white p-2 rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all"
                     >
                       <Trash2 size={14} />
                     </button>
                  </div>
                )}
              </div>

              <div className="p-3 md:p-6 flex-1 flex flex-col">
                <div className="mb-2 md:mb-4">
                  {isEditMode ? (
                    <input 
                      className="text-sm md:text-lg font-black text-gray-900 border-b border-blue-600 outline-none w-full mb-1"
                      value={spot.name}
                      placeholder="Name"
                      onChange={(e) => updateSpot(spot.id, 'name', e.target.value)}
                    />
                  ) : (
                    <h3 className="text-[12px] md:text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-1">{spot.name}</h3>
                  )}
                  <span className="text-[7px] md:text-[9px] font-black text-blue-600 tracking-wider uppercase block mt-0.5">{spot.subtitle}</span>
                </div>

                <div className="mb-2 md:mb-4">
                  {spot.phone && (
                    <a href={`tel:${spot.phone}`} className="flex items-center gap-1 text-[8px] md:text-[10px] font-black text-blue-600 hover:underline">
                      <Phone size={8} /> {spot.phone}
                    </a>
                  )}
                </div>
                
                {isEditMode ? (
                  <textarea 
                    className="text-[9px] md:text-[11px] text-gray-500 bg-gray-50 rounded-lg p-2 h-16 w-full outline-none leading-relaxed font-medium"
                    value={spot.description}
                    onChange={(e) => updateSpot(spot.id, 'description', e.target.value)}
                  />
                ) : (
                  <p className="text-[9px] md:text-[11px] text-gray-500 leading-relaxed mb-3 md:mb-6 flex-grow line-clamp-2 md:line-clamp-3 italic">
                    {spot.description}
                  </p>
                )}

                <div className="mt-auto pt-3 md:pt-6 border-t border-gray-50">
                  <a 
                    href={spot.mapUrl.startsWith('http') ? spot.mapUrl : generateMapUrl(spot.mapUrl || spot.name)} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-500 font-black text-[8px] md:text-[10px] uppercase tracking-widest py-2 md:py-4 rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-1.5 group/btn"
                  >
                    <MapIcon size={12} className="group-hover/btn:text-white transition-colors" /> Location
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {visibleCount < filtered.length && (
          <div className="mt-12 md:mt-20 text-center">
            <button 
              onClick={() => setVisibleCount(prev => prev + 12)}
              className="px-8 md:px-10 py-3 md:py-5 bg-blue-600 text-white font-black text-[9px] md:text-[11px] uppercase tracking-[0.2em] md:tracking-[0.3em] rounded-xl md:rounded-[2rem] shadow-2xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
            >
              Load More Places
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TouristGuide;
