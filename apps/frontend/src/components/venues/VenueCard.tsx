"use client";

interface Venue {
  fsq_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  distance: number;
  rating?: number;
  photo_url?: string;
  category?: string;
}

interface VenueCardProps {
  venue: Venue;
  onSelect: () => void;
}

export default function VenueCard({ venue, onSelect }: VenueCardProps) {
  const formatDistance = (m: number) => m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden group hover:border-purple-500 transition-all">
      {venue.photo_url ? (
        <img src={venue.photo_url} alt={venue.name} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-gray-800 flex items-center justify-center text-gray-600">Sem foto</div>
      )}
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg leading-tight">{venue.name}</h3>
          {venue.rating && (
            <div className="bg-yellow-500/10 text-yellow-500 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
              ★ {venue.rating.toFixed(1)}
            </div>
          )}
        </div>
        
        <p className="text-xs text-purple-400 font-bold uppercase tracking-wider mb-3">{venue.category}</p>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{venue.address}</p>
        
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <span className="flex items-center gap-1">📍 {formatDistance(venue.distance)}</span>
          <span>•</span>
          <span>{venue.city}</span>
        </div>
        
        <button 
          onClick={onSelect}
          className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Selecionar Local
        </button>
      </div>
    </div>
  );
}
