"use client";

import { useEffect, useState } from "react";
import { eventApi, checkinApi } from "@/lib/api";
import Link from "next/link";

export default function PortariaSelectionPage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    eventApi.list().then(setEvents).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-8 text-center">Portaria</h1>
        <p className="text-gray-600 mb-6 text-center italic">Selecione o evento ativo para iniciar o turno.</p>
        
        <div className="space-y-4">
          {events.map(event => (
            <Link 
              key={event.id} 
              href={`/portaria/scan?eventId=${event.id}`}
              className="block p-5 bg-gradient-to-r from-blue-50 to-white border border-blue-100 rounded-xl hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-blue-900 group-hover:text-blue-600">{event.title}</h3>
                  <p className="text-xs text-gray-500">{new Date(event.start_date).toLocaleDateString()}</p>
                </div>
                <div className="bg-blue-600 text-white p-2 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </div>
              </div>
            </Link>
          ))}
          {events.length === 0 && (
            <div className="text-center py-10 text-gray-400">Nenhum evento encontrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}
