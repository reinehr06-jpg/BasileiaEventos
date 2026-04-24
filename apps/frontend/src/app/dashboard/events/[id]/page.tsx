"use client";

import { useEffect, useState, use } from "react";
import { eventApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState({ title: "", slug: "", description: "", start_date: "", status: "draft" });

  useEffect(() => {
    eventApi.get(id).then(setEvent).catch(console.error);
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await eventApi.update(id, event);
    router.push("/dashboard/events");
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Editar Evento</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <label className="block text-sm font-medium">Título</label>
          <input type="text" className="w-full border p-2 rounded" value={event.title} onChange={e => setEvent({...event, title: e.target.value})} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Slug (URL)</label>
          <input type="text" className="w-full border p-2 rounded" value={event.slug} onChange={e => setEvent({...event, slug: e.target.value})} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Descrição</label>
          <textarea className="w-full border p-2 rounded" value={event.description} onChange={e => setEvent({...event, description: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium">Início</label>
          <input type="datetime-local" className="w-full border p-2 rounded" value={event.start_date.slice(0,16)} onChange={e => setEvent({...event, start_date: e.target.value})} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select className="w-full border p-2 rounded" value={event.status} onChange={e => setEvent({...event, status: e.target.value})}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="canceled">Cancelado</option>
          </select>
        </div>
        <div className="flex gap-4">
          <button type="submit" className="flex-1 bg-blue-600 text-white p-2 rounded font-bold">Salvar Alterações</button>
          <button type="button" onClick={() => router.back()} className="flex-1 bg-gray-200 p-2 rounded font-bold">Cancelar</button>
        </div>
      </form>
    </div>
  );
}
