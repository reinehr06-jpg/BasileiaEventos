"use client";

import { useEffect, useState, use } from "react";
import { planningApi, eventApi } from "@/lib/api";

export default function PlanningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const [event, setEvent] = useState<any>(null);
  const [finance, setFinance] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [prompt, setPrompt] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    eventApi.get(eventId).then(setEvent).catch(console.error);
    loadData();
  }, [eventId]);

  const loadData = () => {
    planningApi.getFinanceSummary(eventId).then(setFinance).catch(console.error);
    planningApi.listSuppliers(eventId).then(setSuppliers).catch(console.error);
  };

  const handleAISuggest = async () => {
    setLoadingAI(true);
    try {
      const res = await planningApi.suggest({ prompt });
      setSuggestions(res.suggestions);
    } finally {
      setLoadingAI(false);
    }
  };

  const confirmSupplier = async (s: any) => {
    await planningApi.confirmSupplier({
      eventId,
      name: s.name,
      category: s.category,
      contactInfo: s.contact,
      estimatedAmount: 0 // Will be edited later
    });
    setSuggestions(suggestions.filter(item => item.name !== s.name));
    loadData();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await planningApi.exportToFinance(eventId);
      alert("Financeiro exportado com sucesso para BasileaFinance!");
    } finally {
      setExporting(false);
    }
  };

  if (!event || !finance) return <div className="p-10 text-center">Carregando Planejamento...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Planejamento & Financeiro</h1>
          <p className="text-gray-500 font-medium">Controle de custos e sugestões de IA para <span className="text-blue-600">"{event.title}"</span></p>
        </div>
        <button 
          onClick={handleExport}
          disabled={exporting}
          className="bg-green-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-green-500/20 active:scale-95 transition-transform disabled:opacity-50"
        >
          {exporting ? "Exportando..." : "Enviar para BasileaFinance"}
        </button>
      </header>

      {/* Finance Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Receita Líquida</p>
          <p className="text-3xl font-black text-gray-900">R$ {finance.net_revenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total de Custos</p>
          <p className="text-3xl font-black text-red-600">R$ {finance.total_costs.toLocaleString()}</p>
        </div>
        <div className="bg-blue-600 p-6 rounded-3xl shadow-lg shadow-blue-500/20 text-white md:col-span-2">
          <p className="text-xs font-black opacity-70 uppercase tracking-widest mb-1">Lucro Estimado</p>
          <p className="text-3xl font-black">R$ {finance.estimated_profit.toLocaleString()}</p>
        </div>
      </div>

      {/* AI Assistant Section */}
      <div className="bg-gray-900 p-8 rounded-[40px] text-white space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl">✨</div>
          <h2 className="text-2xl font-black italic">Assistente de Planejamento IA</h2>
        </div>
        <div className="relative">
          <textarea 
            placeholder="Ex: Preciso de buffet para 500 pessoas, som, luz e segurança..."
            className="w-full bg-white/5 border border-white/10 p-6 rounded-3xl focus:ring-2 ring-blue-500 outline-none h-32"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
          />
          <button 
            onClick={handleAISuggest}
            disabled={loadingAI || !prompt}
            className="absolute bottom-4 right-4 bg-blue-600 px-6 py-3 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform disabled:opacity-50"
          >
            {loadingAI ? "Analisando..." : "Sugerir Fornecedores"}
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="grid md:grid-cols-3 gap-4 pt-4 animate-[fadeIn_0.5s_ease-out]">
            {suggestions.map((s, i) => (
              <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-3xl space-y-4">
                <div className="flex justify-between items-start">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase ${s.sponsored ? 'bg-yellow-500 text-black' : 'bg-blue-600 text-white'}`}>
                    {s.sponsored ? '✦ Patrocinado' : s.category}
                  </span>
                  <span className="text-yellow-400 font-bold">★ {s.rating}</span>
                </div>
                <h4 className="font-bold text-lg">{s.name}</h4>
                <div className="flex gap-2">
                  <a href={`tel:${s.contact}`} className="flex-1 bg-white/10 py-2 rounded-xl text-center text-sm font-bold">Ligar</a>
                  <button onClick={() => confirmSupplier(s)} className="flex-1 bg-blue-600 py-2 rounded-xl text-center text-sm font-bold">Contratar</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmed Suppliers */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Fornecedores Contratados</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Fornecedor</th>
                <th className="px-6 py-4">Categoria</th>
                <th className="px-6 py-4">Valor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-gray-900">{s.name}</p>
                    <p className="text-xs text-gray-400 font-medium">{s.contact_info}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">{s.category}</span>
                  </td>
                  <td className="px-6 py-5 font-bold">R$ {s.actual_amount || s.estimated_amount}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                      s.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <button className="text-blue-600 font-bold text-sm hover:underline">Editar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {suppliers.length === 0 && (
            <div className="p-12 text-center text-gray-400 italic">Nenhum fornecedor confirmado ainda. Use a IA acima para buscar!</div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
