"use client";

import { useEffect, useState, use } from "react";
import { trackingApi, eventApi } from "@/lib/api";

export default function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const [event, setEvent] = useState<any>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [funnel, setFunnel] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [newLink, setNewLink] = useState({ name: "", utm_source: "", utm_medium: "", utm_campaign: "" });

  useEffect(() => {
    eventApi.get(eventId).then(setEvent).catch(console.error);
    loadData();
  }, [eventId]);

  const loadData = () => {
    trackingApi.listLinks(eventId).then(setLinks).catch(console.error);
    trackingApi.getFunnel(eventId).then(setFunnel).catch(console.error);
  };

  const createLink = async (e: React.FormEvent) => {
    e.preventDefault();
    await trackingApi.createLink({ ...newLink, eventId });
    setShowModal(false);
    setNewLink({ name: "", utm_source: "", utm_medium: "", utm_campaign: "" });
    loadData();
  };

  if (!event || !funnel) return <div className="p-10 text-center">Carregando...</div>;

  const convRate = funnel.views > 0 ? (funnel.purchases / funnel.views) * 100 : 0;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Rastreamento & ROI</h1>
          <p className="text-gray-500 font-medium">Campanhas e funil de vendas para <span className="text-blue-600">"{event.title}"</span></p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/20 active:scale-95 transition-transform"
        >
          Novo Link Rastreável
        </button>
      </header>

      {/* Funnel Dashboard */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Visualizações</p>
          <p className="text-3xl font-black text-gray-900">{funnel.views}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Inícios de Checkout</p>
          <p className="text-3xl font-black text-gray-900">{funnel.checkouts}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Vendas Finalizadas</p>
          <p className="text-3xl font-black text-green-600">{funnel.purchases}</p>
        </div>
        <div className="bg-blue-600 p-6 rounded-3xl shadow-lg shadow-blue-500/20 text-white">
          <p className="text-xs font-black opacity-70 uppercase tracking-widest mb-1">Taxa de Conversão</p>
          <p className="text-3xl font-black">{convRate.toFixed(1)}%</p>
        </div>
      </div>

      {/* Campaign List */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Canais de Divulgação</h3>
          <span className="text-xs font-bold text-gray-400 uppercase">Ordenado por ROI</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Canal / Campanha</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4">Vendas</th>
                <th className="px-6 py-4">Receita</th>
                <th className="px-6 py-4">ROI</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {links.map((link) => (
                <tr key={link.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-gray-900">{link.name}</p>
                    <p className="text-xs text-gray-400 font-medium">{link.utm_source} / {link.utm_campaign}</p>
                  </td>
                  <td className="px-6 py-5 font-bold">{link.views}</td>
                  <td className="px-6 py-5 font-bold text-green-600">{link.sales}</td>
                  <td className="px-6 py-5 font-bold">R$ {link.revenue}</td>
                  <td className="px-6 py-5">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-black">
                      {(link.revenue / (link.views || 1)).toFixed(2)} R$/V
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(`http://localhost:3000/event/\${event.slug}?utm_id=\${link.id}`);
                        alert("Link copiado!");
                      }}
                      className="text-blue-600 font-bold text-sm hover:underline"
                    >
                      Copiar Link
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {links.length === 0 && (
            <div className="p-12 text-center text-gray-400 italic">Nenhum link de rastreamento criado ainda.</div>
          )}
        </div>
      </div>

      {/* Widget/Pixel Info */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gray-900 p-8 rounded-[40px] text-white space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-xs">JS</span>
            Widget Embedável
          </h3>
          <p className="text-sm text-gray-400">Cole este script na sua landing page externa para vender diretamente.</p>
          <pre className="bg-black/50 p-4 rounded-2xl text-[10px] text-blue-400 overflow-x-auto">
{`<script src="http://localhost:3001/widget.js" 
  data-event="${eventId}" 
  data-tenant="basileia_tenant_admin"
  data-theme="dark">
</script>`}
          </pre>
        </div>
        <div className="bg-blue-600 p-8 rounded-[40px] text-white space-y-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
             <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-xs">PX</span>
             Pixel de Conversão
          </h3>
          <p className="text-sm opacity-80">Rastreie o comportamento dos usuários na sua página e meça o ROI automaticamente.</p>
          <pre className="bg-black/20 p-4 rounded-2xl text-[10px] text-white/70 overflow-x-auto">
{`<script src="http://localhost:3001/pixel.js" 
  data-tenant="basileia_tenant_admin">
</script>`}
          </pre>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[40px] w-full max-w-lg p-10 animate-[scaleUp_0.3s_ease-out]">
            <h2 className="text-3xl font-black mb-2">Criar Canal</h2>
            <p className="text-gray-500 mb-8 font-medium">Gere um link rastreável para suas campanhas.</p>
            
            <form onSubmit={createLink} className="space-y-6">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nome Amigável</label>
                <input required placeholder="Ex: Bio do Instagram" className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 ring-blue-500 outline-none" value={newLink.name} onChange={e => setNewLink({...newLink, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Source (Origem)</label>
                  <input placeholder="instagram" className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 ring-blue-500 outline-none" value={newLink.utm_source} onChange={e => setNewLink({...newLink, utm_source: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Campaign</label>
                  <input placeholder="blackfriday" className="w-full bg-gray-50 border-none p-4 rounded-2xl focus:ring-2 ring-blue-500 outline-none" value={newLink.utm_campaign} onChange={e => setNewLink({...newLink, utm_campaign: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 font-bold text-gray-400">Cancelar</button>
                <button type="submit" className="flex-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-500/30">Gerar Link</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
