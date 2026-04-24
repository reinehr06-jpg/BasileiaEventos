"use client";

import { useState } from "react";
import { waitlistApi } from "@/lib/api";

export default function WaitlistModal({ eventId, ticketTypeId, onClose }: { eventId: string, ticketTypeId: string, onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await waitlistApi.join({ ...form, eventId, ticketTypeId });
      setSuccess(true);
    } catch (err) {
      alert("Erro ao entrar na fila.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[40px] w-full max-w-lg p-10 shadow-2xl animate-[scaleUp_0.3s_ease-out]">
        {!success ? (
          <>
            <h2 className="text-3xl font-black mb-2 italic">FILA DE ESPERA</h2>
            <p className="text-gray-500 mb-8 font-medium">Este lote está esgotado, mas não desista! Entre na fila e avisaremos assim que uma vaga abrir.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Seu Nome</label>
                <input required placeholder="Nome completo" className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 ring-blue-500 outline-none" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Seu E-mail</label>
                <input required type="email" placeholder="email@exemplo.com" className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 ring-blue-500 outline-none" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={onClose} className="flex-1 py-4 font-bold text-gray-400">Fechar</button>
                <button type="submit" disabled={submitting} className="flex-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/30">
                  {submitting ? "Entrando..." : "ENTRAR NA FILA"}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="text-center py-10 space-y-6">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-black italic">VOCÊ ESTÁ NA FILA!</h2>
            <p className="text-gray-500 font-medium">Fique de olho no seu e-mail. Se alguém cancelar, você será o primeiro a saber!</p>
            <button onClick={onClose} className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold">OK, ENTENDI</button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
