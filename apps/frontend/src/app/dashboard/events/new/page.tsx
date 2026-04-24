"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { eventApi } from "@/lib/api";

export default function NewEventPage() {
  const [form, setForm] = useState({ title: "", slug: "", description: "", start_date: "" });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await eventApi.create(form);
      router.push("/dashboard/events");
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Novo Evento</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block text-sm font-medium mb-1">Título</label>
          <input type="text" className="w-full border p-2 rounded" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug (URL)</label>
          <input type="text" className="w-full border p-2 rounded" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea className="w-full border p-2 rounded" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Data de Início</label>
          <input type="datetime-local" className="w-full border p-2 rounded" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-bold">Criar Evento</button>
      </form>
    </div>
  );
}
