import React, { useState } from 'react';
import { Compass, ArrowRight, MapPin, Search } from 'lucide-react';

interface Attraction {
  id: number;
  name: string;
  subtitle: string;
  distance: string;
  description: string;
  image: string;
  mapUrl: string;
}

const ATTRACTIONS: Attraction[] = [
  {
    id: 1,
    name: "Keane Bridge",
    subtitle: "Historic Landmark",
    distance: "0.8 km",
    description: "The 'Gateway to Sylhet'. Built in 1936, this iconic bridge offers stunning Surma river views.",
    image: "https://images.unsplash.com/photo-1623057000739-30ac5bb06227?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Keane+Bridge+Sylhet"
  },
  {
    id: 2,
    name: "Ali Amjad Clock",
    subtitle: "Heritage Site",
    distance: "0.8 km",
    description: "Oldest clock tower in Bangladesh, located right next to Keane Bridge on the river bank.",
    image: "https://images.unsplash.com/photo-1571210862729-78a52d3779a2?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Ali+Amjad+Clock+Tower"
  },
  {
    id: 3,
    name: "Shah Jalal Dargah",
    subtitle: "Spiritual Center",
    distance: "1.5 km",
    description: "The most sacred spiritual site in the region, housing the tomb of Hazrat Shah Jalal.",
    image: "https://images.unsplash.com/photo-1596701062351-be5f6a210d7d?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Shah+Jalal+Dargah+Sylhet"
  },
  {
    id: 4,
    name: "Malnicherra Tea Estate",
    subtitle: "Nature & Heritage",
    distance: "4.5 km",
    description: "The first tea garden established in the Indian subcontinent. Lush green trails for walking.",
    image: "https://images.unsplash.com/photo-1594664082500-114a57b47f9c?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Malnicherra+Tea+Garden"
  },
  {
    id: 5,
    name: "Sylhet Shahi Eidgah",
    subtitle: "Mughal Architecture",
    distance: "2.5 km",
    description: "A historic prayer ground built during the Mughal era, reflecting majestic ancient design.",
    image: "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Sylhet+Shahi+Eidgah"
  },
  {
    id: 6,
    name: "Osmani Museum",
    subtitle: "History Museum",
    distance: "1.2 km",
    description: "Home of General M.A.G. Osmani, showcasing artifacts from the Liberation War.",
    image: "https://images.unsplash.com/photo-1521109464564-2fa2faa95858?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Osmani+Museum+Sylhet"
  },
  {
    id: 7,
    name: "Ratargul Swamp Forest",
    subtitle: "Freshwater Swamp",
    distance: "26 km",
    description: "Explore the 'Amazon of Bangla' by boat through submerged evergreen trees.",
    image: "https://images.unsplash.com/photo-1624510373027-2c13d7890b0d?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Ratargul+Swamp+Forest"
  },
  {
    id: 8,
    name: "Bichanakandi",
    subtitle: "Mountain Stream",
    distance: "38 km",
    description: "A spectacular point where the hills of Meghalaya meet the crystal clear river stream.",
    image: "https://images.unsplash.com/photo-1622325350910-664f34691e84?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Bisnakandi+Sylhet"
  },
  {
    id: 9,
    name: "Jaflong Zero Point",
    subtitle: "Border View",
    distance: "55 km",
    description: "Famous for its stone collections and views of the Dawki Bridge and mountains.",
    image: "https://images.unsplash.com/photo-1623057000940-f60486c9973b?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Jaflong+Sylhet"
  },
  {
    id: 10,
    name: "Lalakhal River",
    subtitle: "Blue Water River",
    distance: "42 km",
    description: "Experience the unique turquoise blue water of the Shari River under a canopy of hills.",
    image: "https://images.unsplash.com/photo-1544735032-6a71fd699549?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Lalakhal+Sylhet"
  },
  {
    id: 11,
    name: "Shah Paran Dargah",
    subtitle: "Religious Site",
    distance: "7.0 km",
    description: "The sacred tomb of Hazrat Shah Paran, a renowned Sufi saint and nephew of Shah Jalal.",
    image: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Shah+Paran+Dargah+Sylhet"
  },
  {
    id: 12,
    name: "Bholaganj Pathor",
    subtitle: "Nature & Stone",
    distance: "35 km",
    description: "The white stone paradise of Sylhet, featuring a vast plain of stones and mountain water.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Bholaganj+Sada+Pathor"
  },
  {
    id: 13,
    name: "Tilagarh Eco Park",
    subtitle: "Mini Zoo & Forest",
    distance: "5.5 km",
    description: "A lush reserve area with small hills, wild deer, and various species of trees and birds.",
    image: "https://images.unsplash.com/photo-1444464666168-49d633b867ad?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Tilagarh+Eco+Park"
  },
  {
    id: 14,
    name: "Adventure World",
    subtitle: "Amusement Park",
    distance: "6.0 km",
    description: "Modern theme park offering rides and entertainment for families and children.",
    image: "https://images.unsplash.com/photo-1531572751523-53b984713bd0?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Adventure+World+Sylhet"
  },
  {
    id: 15,
    name: "Hasan Raja Museum",
    subtitle: "Culture & Music",
    distance: "1.0 km",
    description: "Dedicated to the mystic poet and folk singer Hasan Raja, located in his ancestral home.",
    image: "https://images.unsplash.com/photo-1518998053574-53fd620025f3?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Hasan+Raja+Museum+Sylhet"
  },
  {
    id: 16,
    name: "Dreamland Park",
    subtitle: "Water Park",
    distance: "12 km",
    description: "A popular destination for water slides, wave pools, and outdoor activities.",
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Dreamland+Amusement+Park+Sylhet"
  },
  {
    id: 17,
    name: "Khadimnagar Park",
    subtitle: "Rainforest Trail",
    distance: "15 km",
    description: "A biodiversity hotspot offering hiking trails through dense evergreen forests.",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Khadimnagar+National+Park"
  },
  {
    id: 18,
    name: "Tamabil Border",
    subtitle: "Border Gateway",
    distance: "53 km",
    description: "The scenic border crossing between Bangladesh and India, near Jaflong.",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Tamabil+Border+Sylhet"
  },
  {
    id: 19,
    name: "Lakkatura Estate",
    subtitle: "Tea Valley",
    distance: "5.0 km",
    description: "Vast tea plantation known for its picturesque hilly terrain and peaceful environment.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Lakkatura+Tea+Garden"
  },
  {
    id: 20,
    name: "Blue Water Mall",
    subtitle: "Shopping & Dining",
    distance: "1.2 km",
    description: "The modern commercial hub of Sylhet city for fashion, food, and electronics.",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Blue+Water+Shopping+City+Sylhet"
  },
  {
    id: 21,
    name: "Manipuri Palace",
    subtitle: "Historical Heritage",
    distance: "2.0 km",
    description: "Ruins of the royal palace of Manipuri kings, showcasing ancient heritage.",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Manipuri+Rajbari+Sylhet"
  },
  {
    id: 22,
    name: "Sylhet Junction",
    subtitle: "Architectural Hub",
    distance: "0.2 km",
    description: "One of the most uniquely designed stations in the country, just steps from the hotel.",
    image: "https://images.unsplash.com/photo-1474487022152-5a337f2233ad?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Sylhet+Railway+Station"
  },
  {
    id: 23,
    name: "MC College",
    subtitle: "Historic Education",
    distance: "3.5 km",
    description: "Established in 1892, this beautiful campus features British-colonial architecture.",
    image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/MC+College+Sylhet"
  },
  {
    id: 24,
    name: "Jaintiapur Ruins",
    subtitle: "Archaeological Site",
    distance: "40 km",
    description: "Ancient megalithic monuments and ruins of the Jaintia Kingdom's palace.",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Jaintiapur+Rajbari+Ruins"
  },
  {
    id: 25,
    name: "Pangthumai Fall",
    subtitle: "Hidden Waterfall",
    distance: "45 km",
    description: "A stunning white water cascade falling from the Indian mountains on the border.",
    image: "https://images.unsplash.com/photo-1433086566608-0429665744a8?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Pangthumai+Waterfall"
  },
  {
    id: 26,
    name: "Blue Ridge",
    subtitle: "Leisure Spot",
    distance: "4.0 km",
    description: "A hilltop resort area providing panoramic views of the Sylhet city skyline.",
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Sylhet+Hill+View"
  },
  {
    id: 27,
    name: "Surma River Cruise",
    subtitle: "River Experience",
    distance: "0.5 km",
    description: "Rent a small traditional boat for a sunset trip along the heart of the city.",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Surma+River+Sylhet"
  },
  {
    id: 28,
    name: "Govinda Fort",
    subtitle: "Ancient Ruins",
    distance: "2.8 km",
    description: "Site of the 14th-century fort of King Gour Govinda, overlooking the city.",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Gour+Govinda+Fort+Sylhet"
  },
  {
    id: 29,
    name: "Sripur Waterfall",
    subtitle: "Scenic Spot",
    distance: "50 km",
    description: "A seasonal waterfall near Jaflong, ideal for a quick dip in nature.",
    image: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Sripur+Waterfall+Sylhet"
  },
  {
    id: 30,
    name: "Lovachora Tea",
    subtitle: "Remote Paradise",
    distance: "65 km",
    description: "A remote and untouched tea garden near the Indian border, accessed by boat.",
    image: "https://images.unsplash.com/photo-1516528387618-afa90b13e000?auto=format&fit=crop&q=80",
    mapUrl: "https://www.google.com/maps/search/Lovachora+Tea+Garden"
  }
];

const TouristGuide: React.FC = () => {
  const [visibleCount, setVisibleCount] = useState(8);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAttractions = ATTRACTIONS.filter(spot => 
    spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    spot.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 8, filteredAttractions.length));
  };

  return (
    <section className="bg-hotel-accent min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-12 pb-8 md:pb-10">
        <div className="text-center">
            <div className="inline-flex items-center justify-center p-2 bg-hotel-primary/10 rounded-full mb-4">
            <Compass className="text-hotel-primary" size={20} />
            </div>
            <h2 className="text-2xl md:text-5xl font-serif text-gray-900 mb-4 font-black">Discover Sylhet</h2>
            <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed font-light mb-8">
            The soul of Bangladesh lies in its tea valleys and sacred sites. Explore 30 top-rated attractions just minutes from Hotel Shotabdi.
            </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-10 relative">
            <input 
                type="text" 
                placeholder="Search places (e.g. Tea, Forest)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-100 shadow-sm rounded-2xl py-3.5 md:py-4 pl-12 pr-6 text-sm focus:border-hotel-primary outline-none transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24 lg:pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {filteredAttractions.slice(0, visibleCount).map((spot) => (
            <div 
              key={spot.id} 
              className="bg-white rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.02)] border border-gray-100 group hover:shadow-xl transition-all duration-500 flex flex-col h-full"
            >
              <div className="relative h-44 md:h-48 overflow-hidden">
                <img 
                  src={spot.image} 
                  alt={spot.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur shadow-sm text-hotel-secondary text-[9px] md:text-[10px] font-black px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl flex items-center gap-1">
                  <MapPin size={10} className="text-hotel-primary" />
                  {spot.distance}
                </div>
              </div>

              <div className="p-5 md:p-6 flex-1 flex flex-col">
                <div className="mb-2">
                  <h3 className="text-base md:text-lg font-bold text-gray-900 leading-tight">
                    {spot.name}
                  </h3>
                  <span className="text-[9px] font-black text-hotel-primary tracking-widest uppercase block mt-1">
                    {spot.subtitle}
                  </span>
                </div>
                
                <p className="text-[10px] md:text-[11px] text-gray-400 leading-relaxed mb-6 flex-grow">
                  {spot.description}
                </p>

                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                  <a 
                    href={spot.mapUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-1.5 text-hotel-secondary font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:text-hotel-primary transition-all"
                  >
                    Directions <ArrowRight size={12} />
                  </a>
                  <div className="w-2 h-2 rounded-full bg-hotel-primary/10"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {visibleCount < filteredAttractions.length && (
          <div className="mt-12 md:mt-16 text-center px-4">
            <button 
              onClick={loadMore}
              className="w-full max-w-xs md:w-auto px-8 md:px-12 py-3.5 md:py-4 bg-hotel-secondary text-white font-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] rounded-xl md:rounded-2xl hover:bg-hotel-primary transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 mx-auto"
            >
              See More Attractions
              <div className="bg-white/20 p-1 rounded-md">
                 <Compass size={14} />
              </div>
            </button>
            <p className="text-[9px] text-gray-400 mt-4 font-medium italic">
                Showing {Math.min(visibleCount, filteredAttractions.length)} of {filteredAttractions.length} unique destinations
            </p>
          </div>
        )}

        {filteredAttractions.length === 0 && (
            <div className="text-center py-20 px-4">
                <p className="text-gray-400 italic">No matching places found. Try a different search.</p>
            </div>
        )}
      </div>
    </section>
  );
};

export default TouristGuide;