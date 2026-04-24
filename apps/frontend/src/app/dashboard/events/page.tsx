"use client";

import { useEffect, useState } from "react";
import { eventApi } from "@/lib/api";
import Link from "next/link";

export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    eventApi.list().then(setEvents).catch(console.error);
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Meus Eventos</h1>
        <Link href="/dashboard/events/new" className="bg-blue-600 text-white px-4 py-2 rounded">
          Novo Evento
        </Link>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <div key={event.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">{event.title}</h2>
              <p className="text-gray-600">{new Date(event.start_date).toLocaleDateString()}</p>
              <span className={`text-sm px-2 py-1 rounded ${event.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {event.status}
              </span>
            </div>
            <div className="flex gap-4">
              <Link href={`/dashboard/events/${event.id}`} className="text-blue-600 hover:underline">Editar</Link>
              <Link href={`/dashboard/events/${event.id}/tickets`} className="text-green-600 hover:underline">Ingressos</Link>
              <Link href={`/dashboard/events/${event.id}/zones`} className="text-purple-600 hover:underline">Zonas</Link>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-center text-gray-500">Nenhum evento encontrado.</p>}
      </div>
    </div>
  );
}
