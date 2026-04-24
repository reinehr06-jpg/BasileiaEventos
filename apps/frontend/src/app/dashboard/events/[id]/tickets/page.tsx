"use client";

import { useEffect, useState, use } from "react";
import { ticketApi, eventApi } from "@/lib/api";

export default function TicketManagementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const [event, setEvent] = useState<any>(null);
  const [types, setTypes] = useState<any[]>([]);
  const [newType, setNewType] = useState({ name: "", price: 0, quantity: 0 });

  useEffect(() => {
    eventApi.get(eventId).then(setEvent).catch(console.error);
    loadTypes();
  }, [eventId]);

  const loadTypes = () => {
    ticketApi.listTypes(eventId).then(setTypes).catch(console.error);
  };

  const handleCreateType = async (e: React.FormEvent) => {
    e.preventDefault();
    await ticketApi.createType({ ...newType, event_id: eventId });
    setNewType({ name: "", price: 0, quantity: 0 });
    loadTypes();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Ingressos: {event?.title}</h1>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Tipos de Ingresso</h2>
          <div className="space-y-4">
            {types.map(type => (
              <div key={type.id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-bold">{type.name}</h3>
                    <p className="text-sm text-gray-600">R$ {type.price} - {type.quantity} unidades</p>
                  </div>
                </div>
                {/* Lotes */}
                <LotSection typeId={type.id} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded shadow h-fit">
            <h2 className="text-xl font-semibold mb-4">Novo Tipo</h2>
            <form onSubmit={handleCreateType} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Nome</label>
                <input type="text" className="w-full border p-2 rounded" value={newType.name} onChange={e => setNewType({...newType, name: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium">Preço Base (R$)</label>
                <input type="number" step="0.01" className="w-full border p-2 rounded" value={newType.price} onChange={e => setNewType({...newType, price: parseFloat(e.target.value)})} required />
              </div>
              <div>
                <label className="block text-sm font-medium">Capacidade Máxima</label>
                <input type="number" className="w-full border p-2 rounded" value={newType.quantity} onChange={e => setNewType({...newType, quantity: parseInt(e.target.value)})} required />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white p-2 rounded font-bold">Adicionar Tipo</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function LotSection({ typeId }: { typeId: string }) {
  const [lots, setLots] = useState<any[]>([]);
  const [newLot, setNewLot] = useState({ name: "", price: 0, quantity: 0, payment_link: "" });

  useEffect(() => {
    loadLots();
  }, [typeId]);

  const loadLots = () => {
    ticketApi.listLots(typeId).then(setLots).catch(console.error);
  };

  const handleCreateLot = async (e: React.FormEvent) => {
    e.preventDefault();
    await ticketApi.createLot({ ...newLot, ticket_type_id: typeId });
    setNewLot({ name: "", price: 0, quantity: 0, payment_link: "" });
    loadLots();
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="font-semibold text-sm mb-2">Lotes</h4>
      <div className="space-y-2 mb-4">
        {lots.map(lot => (
          <div key={lot.id} className="text-xs bg-gray-50 p-2 rounded flex justify-between">
            <span>{lot.name} (R$ {lot.price})</span>
            <span className="text-gray-500">{lot.sold}/{lot.quantity}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleCreateLot} className="grid grid-cols-2 gap-2">
        <input type="text" placeholder="Nome do Lote" className="text-xs border p-1 rounded" value={newLot.name} onChange={e => setNewLot({...newLot, name: e.target.value})} required />
        <input type="number" placeholder="Preço" className="text-xs border p-1 rounded" value={newLot.price} onChange={e => setNewLot({...newLot, price: parseFloat(e.target.value)})} required />
        <input type="number" placeholder="Qtd" className="text-xs border p-1 rounded" value={newLot.quantity} onChange={e => setNewLot({...newLot, quantity: parseInt(e.target.value)})} required />
        <input type="text" placeholder="Link Pagamento" className="text-xs border p-1 rounded" value={newLot.payment_link} onChange={e => setNewLot({...newLot, payment_link: e.target.value})} />
        <button type="submit" className="col-span-2 bg-blue-500 text-white text-xs p-1 rounded">Add Lote</button>
      </form>
    </div>
  );
}
