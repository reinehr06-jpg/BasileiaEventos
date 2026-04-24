"use client";

import { useEffect, useState } from "react";
import { seatApi } from "@/lib/api";

interface Seat {
  id: string;
  label: string;
  status: 'available' | 'reserved' | 'occupied';
  x: number;
  y: number;
  radius: number;
}

export default function SeatMap({ eventId, onSelect }: { eventId: string, onSelect: (seat: Seat) => void }) {
  const [seats, setSeats] = useState<Seat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeats();
    const interval = setInterval(loadSeats, 10000); // Poll for availability every 10s
    return () => clearInterval(interval);
  }, [eventId]);

  const loadSeats = async () => {
    const data = await seatApi.listByEvent(eventId);
    setSeats(data);
    setLoading(false);
  };

  const handleSeatClick = async (seat: Seat) => {
    if (seat.status !== 'available') return;
    
    try {
      await seatApi.reserve({ seatId: seat.id });
      onSelect(seat);
      loadSeats(); // Refresh UI
    } catch (err: any) {
      alert(err.message || "Erro ao reservar assento.");
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando mapa...</div>;

  return (
    <div className="relative bg-gray-100 rounded-3xl p-8 overflow-auto flex items-center justify-center min-h-[400px]">
      <div className="relative bg-white shadow-2xl rounded-xl" style={{ width: '800px', height: '500px' }}>
        {/* Stage / Screen Indicator */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-48 h-4 bg-gray-300 rounded-full flex items-center justify-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
          PALCO / TELA
        </div>

        {/* Render Seats */}
        {seats.map(seat => (
          <button
            key={seat.id}
            onClick={() => handleSeatClick(seat)}
            className={`absolute flex items-center justify-center text-[8px] font-bold rounded-md transition-all duration-300 ${
              seat.status === 'occupied' ? 'bg-gray-300 cursor-not-allowed opacity-50' :
              seat.status === 'reserved' ? 'bg-yellow-400 cursor-not-allowed' :
              'bg-blue-600 hover:bg-blue-700 text-white hover:scale-110 shadow-lg'
            }`}
            style={{
              left: `${seat.x}px`,
              top: `${seat.y}px`,
              width: `${seat.radius * 2}px`,
              height: `${seat.radius * 2}px`
            }}
            title={seat.label + " - " + seat.status}
            disabled={seat.status !== 'available'}
          >
            {seat.label}
          </button>
        ))}
      </div>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 flex gap-4 text-xs font-bold bg-white/80 backdrop-blur-sm p-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-600 rounded-sm"></span> Disponível</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded-sm"></span> Reservado</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-300 rounded-sm"></span> Ocupado</div>
      </div>
    </div>
  );
}
