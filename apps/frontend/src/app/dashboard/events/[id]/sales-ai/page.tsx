"use client";

import { useEffect, useState, use } from "react";
import { aiApi, eventApi } from "@/lib/api";

export default function SalesAIPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const [event, setEvent] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [abTests, setAbTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  // A/B Test Form
  const [showABForm, setShowABForm] = useState(false);
  const [abForm, setAbForm] = useState({ ticketTypeId: "", priceA: "", priceB: "" });

  useEffect(() => {
    eventApi.get(eventId).then(setEvent).catch(console.error);
    loadData();
  }, [eventId]);

  const loadData = async () => {
    try {
      const sugs = await aiApi.getPricingSuggestions(eventId);
      setSuggestions(sugs);
      // Mocking A/B tests fetch since we didn't add a list route yet
      setAbTests([{ id: 'mock', status: 'active', ticket_type_id: '1', variants: [{name: 'A', price: 80, views: 150, conversions: 12}, {name: 'B', price: 95, views: 148, conversions: 18}] }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    await aiApi.analyzePricing(eventId);
    await loadData();
    setAnalyzing(false);
  };

  const startABTest = async (e: React.FormEvent) => {
    e.preventDefault();
    await aiApi.startABTest({ ...abForm, ticketTypeId: 'mock_id' }); // Mock ID for now
    setShowABForm(false);
    alert("Teste A/B iniciado com sucesso!");
    loadData();
  };

  const handleExportRetargeting = () => {
    // Mock CSV export
    const csvContent = "data:text/csv;charset=utf-8,email,comportamento,tempo\njoao@exemplo.com,abandonou_carrinho,10m\nmaria@exemplo.com,visitou_nao_comprou,2m";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `retargeting_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) return <div className="p-10 text-center">Carregando IA de Vendas...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sales AI & Otimização</h1>
          <p className="text-gray-500 font-medium">Precificação dinâmica e testes para <span className="text-blue-600">"{event?.title}"</span></p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleExportRetargeting} className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform">
            Exportar Retargeting (CSV)
          </button>
          <button onClick={handleAnalyze} disabled={analyzing} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-500/30 active:scale-95 transition-transform disabled:opacity-50 flex items-center gap-2">
            {analyzing ? "Analisando..." : "Gerar Sugestões de Preço"} <span>✨</span>
          </button>
        </div>
      </header>

      {/* Pricing Suggestions */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
          <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2"><span>📈</span> Sugestões de Precificação Dinâmica</h3>
        </div>
        <div className="p-6">
          {suggestions.length === 0 ? (
            <div className="text-center text-gray-400 italic py-10">Nenhuma sugestão no momento. A IA analisa as vendas a cada 2 horas.</div>
          ) : (
            <div className="space-y-4">
              {suggestions.map((s: any) => (
                <div key={s.id} className="bg-gray-50 p-5 rounded-3xl border border-gray-100 flex items-center justify-between">
                  <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase">Lote atual quase esgotado</span>
                      <span className="text-xs text-gray-400 font-bold">{new Date(s.created_at).toLocaleString()}</span>
                    </div>
                    <p className="font-medium text-gray-800">{s.reason}</p>
                    <p className="text-2xl font-black text-blue-600 mt-2">Sugerido: R$ {s.suggested_price}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold">Ignorar</button>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20">Aplicar Preço</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* A/B Tests */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><span>🧪</span> Testes A/B de Preço</h3>
          <button onClick={() => setShowABForm(!showABForm)} className="text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl">Novo Teste</button>
        </div>
        
        {showABForm && (
          <form onSubmit={startABTest} className="p-6 border-b border-gray-100 bg-gray-50 flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-xs font-black text-gray-400 uppercase mb-2">Ingresso</label>
              <select className="w-full bg-white border border-gray-200 p-3 rounded-xl focus:ring-2 ring-blue-500 outline-none">
                <option>VIP - Lote 1</option>
              </select>
            </div>
            <div className="w-32">
              <label className="block text-xs font-black text-gray-400 uppercase mb-2">Preço A</label>
              <input required type="number" className="w-full bg-white border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 ring-blue-500" value={abForm.priceA} onChange={e => setAbForm({...abForm, priceA: e.target.value})} placeholder="R$ 80" />
            </div>
            <div className="w-32">
              <label className="block text-xs font-black text-gray-400 uppercase mb-2">Preço B</label>
              <input required type="number" className="w-full bg-white border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 ring-blue-500" value={abForm.priceB} onChange={e => setAbForm({...abForm, priceB: e.target.value})} placeholder="R$ 95" />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-blue-500/20">Iniciar Teste</button>
          </form>
        )}

        <div className="p-6">
          {abTests.map((t, i) => (
            <div key={i} className="border border-gray-100 rounded-3xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h4 className="font-bold text-lg">Teste: Ingresso VIP</h4>
                  <p className="text-sm text-gray-500">Status: <span className="text-green-500 font-bold uppercase text-xs">Ativo</span></p>
                </div>
                <button className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold">Encerrar Teste</button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {t.variants.map((v: any, idx: number) => {
                  const conversionRate = ((v.conversions / v.views) * 100).toFixed(1);
                  const isWinner = t.variants.reduce((prev:any, current:any) => (prev.conversions/prev.views > current.conversions/current.views) ? prev : current) === v;
                  
                  return (
                    <div key={idx} className={`p-5 rounded-2xl border-2 ${isWinner ? 'border-green-400 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-black text-xl">Variante {v.name}</span>
                        <span className="font-bold text-gray-500">R$ {v.price}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">Visualizações</span>
                        <span className="font-bold">{v.views}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-4">
                        <span className="text-gray-500">Conversões</span>
                        <span className="font-bold">{v.conversions}</span>
                      </div>
                      <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Taxa de Conversão</span>
                        <span className={`text-2xl font-black ${isWinner ? 'text-green-600' : 'text-gray-900'}`}>{conversionRate}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 bg-blue-50 text-blue-800 p-4 rounded-2xl text-sm font-medium flex items-center gap-3">
                <span className="text-2xl">💡</span>
                A Variante B está performando 50% melhor em conversão, gerando um aumento de receita estimado em 18%. Recomendamos aplicar este preço.
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
