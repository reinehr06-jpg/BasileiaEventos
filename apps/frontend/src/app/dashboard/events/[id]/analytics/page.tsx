"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function EventAnalyticsPage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);

  useEffect(() => {
    // Mock event data
    setData({
      title: "Summit Basileia 2026",
      kpis: { total_sales: 45800, tickets_sold: 245, conversion: 5.8 },
      lots: [
        { name: "1º Lote Early Bird", sold: 100, total: 100, status: "sold_out" },
        { name: "2º Lote Regular", sold: 145, total: 200, status: "active" }
      ],
      channels: [
        { name: "Instagram Bio", clicks: 1200, sales: 85, cr: "7.0%" },
        { name: "WhatsApp Grupo", clicks: 450, sales: 42, cr: "9.3%" },
        { name: "E-mail Marketing", clicks: 2100, sales: 118, cr: "5.6%" }
      ]
    });

    setPrediction({
      rate: 84,
      details: "Estimamos 205 de 245 compradores presentes. Fator principal: 80% de ingressos pagos (baixo no-show)."
    });
  }, [id]);

  if (!data) return <div className="p-8 text-white">Carregando métricas...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold">{data.title}</h1>
            <p className="text-gray-500">Métricas e performance em tempo real</p>
          </div>
          <div className="flex gap-4">
            <button className="bg-gray-900 border border-gray-800 px-6 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
              Exportar CSV
            </button>
            <button className="bg-purple-600 px-6 py-2 rounded-xl text-sm font-bold hover:bg-purple-500 transition-colors">
              Gerar Relatório IA (PDF)
            </button>
          </div>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
            <p className="text-gray-500 text-xs font-bold uppercase">Receita Bruta</p>
            <h2 className="text-3xl font-black mt-1">R$ {data.kpis.total_sales.toLocaleString()}</h2>
          </div>
          <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
            <p className="text-gray-500 text-xs font-bold uppercase">Ingressos</p>
            <h2 className="text-3xl font-black mt-1">{data.kpis.tickets_sold} vendidos</h2>
          </div>
          <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
            <p className="text-gray-500 text-xs font-bold uppercase">Conversão</p>
            <h2 className="text-3xl font-black mt-1">{data.kpis.conversion}%</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales by Lot */}
          <div className="lg:col-span-2 bg-gray-900 p-8 rounded-3xl border border-gray-800">
            <h3 className="font-bold mb-6">Performance por Lote</h3>
            <div className="space-y-6">
              {data.lots.map((lot: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold">{lot.name}</span>
                    <span className="text-gray-500">{lot.sold} / {lot.total}</span>
                  </div>
                  <div className="h-3 bg-black rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${lot.status === 'sold_out' ? 'bg-gray-600' : 'bg-purple-500'}`}
                      style={{ width: `${(lot.sold / lot.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="font-bold mt-12 mb-6">Canais de Venda (Top Funnel)</h3>
            <div className="overflow-hidden rounded-2xl border border-gray-800">
              <table className="w-full text-left">
                <thead className="bg-gray-800/50 text-[10px] font-bold uppercase text-gray-500">
                  <tr>
                    <th className="px-6 py-3">Canal</th>
                    <th className="px-6 py-3 text-center">Cliques</th>
                    <th className="px-6 py-3 text-center">Vendas</th>
                    <th className="px-6 py-3 text-right">Taxa (CR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800 text-sm">
                  {data.channels.map((ch: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium">{ch.name}</td>
                      <td className="px-6 py-4 text-center">{ch.clicks.toLocaleString()}</td>
                      <td className="px-6 py-4 text-center font-bold">{ch.sales}</td>
                      <td className="px-6 py-4 text-right text-green-400 font-bold">{ch.cr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Prediction Sidebar */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-3xl shadow-xl">
              <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                <span>🔮</span> Previsão de Público
              </h3>
              <div className="text-center py-4">
                <span className="text-6xl font-black text-white">{prediction?.rate}%</span>
                <p className="text-purple-200 text-sm mt-2 font-medium">Presença Estimada</p>
              </div>
              <div className="mt-6 p-4 bg-white/10 rounded-2xl text-xs text-purple-100 leading-relaxed border border-white/10">
                {prediction?.details}
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
              <h3 className="font-bold mb-4 text-sm uppercase tracking-widest text-gray-500">Status da Operação</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Facial Pendente</span>
                  <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-[10px] font-bold">12 pessoas</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Produtos a Enviar</span>
                  <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-[10px] font-bold">45 itens</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Alertas de Fraude</span>
                  <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold">0 ativos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
