"use client";

import { useEffect, useState, use } from "react";
import { eventApi, ticketApi } from "@/lib/api";

export default function ZonesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const [event, setEvent] = useState<any>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [newZone, setNewZone] = useState({ name: "", description: "" });

  useEffect(() => {
    eventApi.get(eventId).then(setEvent).catch(console.error);
    loadZones();
    ticketApi.listTypes(eventId).then(setTypes).catch(console.error);
  }, [eventId]);

  const loadZones = async () => {
    // We'll need to add listZones to the API
    const res = await fetch(`/api/events/${eventId}/zones`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
    if (res.ok) setZones(await res.json());
  };

  const handleCreateZone = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/events/${eventId}/zones`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify(newZone)
    });
    setNewZone({ name: "", description: "" });
    loadZones();
  };

  const toggleZoneOnType = async (typeId: string, zoneId: string) => {
    await fetch(`/api/tickets/types/${typeId}/zones/${zoneId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    loadZones();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Zonas de Acesso: {event?.title}</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Configurar Zonas</h2>
          <div className="space-y-4">
            {zones.map(zone => (
              <div key={zone.id} className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                <h3 className="font-bold">{zone.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{zone.description}</p>
                
                <div className="mt-2 pt-2 border-t">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Tipos com acesso:</p>
                  <div className="flex flex-wrap gap-2">
                    {types.map(type => (
                      <button 
                        key={type.id}
                        onClick={() => toggleZoneOnType(type.id, zone.id)}
                        className={`text-xs px-2 py-1 rounded border transition-colors ${
                          type.zones?.includes(zone.id) ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-100 text-gray-600 border-gray-200'
                        }`}
                      >
                        {type.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded shadow h-fit">
          <h2 className="text-xl font-semibold mb-4">Nova Zona</h2>
          <form onSubmit={handleCreateZone} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nome (ex: Área VIP, Backstage)</label>
              <input type="text" className="w-full border p-2 rounded" value={newZone.name} onChange={e => setNewZone({...newZone, name: e.target.value})} required />
            </div>
            <div>
              <label className="block text-sm font-medium">Descrição</label>
              <textarea className="w-full border p-2 rounded" value={newZone.description} onChange={e => setNewZone({...newZone, description: e.target.value})} />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-bold">Criar Zona</button>
          </form>
        </div>
      </div>
    </div>
  );
}
