"use client";

import { useState, useEffect } from "react";
import VenueCard from "./VenueCard";

interface Venue {
  fsq_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
  distance: number;
  rating?: number;
  photo_url?: string;
  category?: string;
}

interface VenueSuggestionsModalProps {
  capacity: number;
  onSelect: (venue: Venue) => void;
  onClose: () => void;
}

export default function VenueSuggestionsModal({ capacity, onSelect, onClose }: VenueSuggestionsModalProps) {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Get Geolocation
      const pos: any = await new Promise((res, rej) => 
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })
      );

      const { latitude: lat, longitude: lng } = pos.coords;

      // 2. Fetch Suggestions
      const response = await fetch(`/api/venues/suggestions?lat=${lat}&lng=${lng}&capacity=${capacity}`);
      const data = await response.json();

      if (data.error) throw new Error(data.error);
      setVenues(data.venues);
    } catch (err: any) {
      setError(err.message === "User denied Geolocation" ? "Permissão de localização negada." : "Erro ao buscar locais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-950 border border-gray-800 w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl flex flex-col">
        <div className="p-8 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black">Sugestões de Locais</h2>
            <p className="text-gray-500 text-sm">Baseado na capacidade de {capacity} pessoas na sua região.</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white font-bold">Fechar</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 font-bold">Buscando os melhores espaços...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 font-bold mb-4">{error}</p>
              <button onClick={onClose} className="text-sm underline text-gray-500">Digitar endereço manualmente</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {venues.map(venue => (
                <VenueCard 
                  key={venue.fsq_id} 
                  venue={venue} 
                  onSelect={() => onSelect(venue)} 
                />
              ))}
            </div>
          )}
        </div>
        
        <div className="p-8 border-t border-gray-800 bg-gray-900/50">
          <p className="text-xs text-center text-gray-600 uppercase tracking-widest font-black">Powered by Foursquare & Basileia Intel</p>
        </div>
      </div>
    </div>
  );
}
