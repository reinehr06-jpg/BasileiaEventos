"use client";

import { checkinApi, eventApi } from "@/lib/api";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function DashboardContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [data, setData] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    if (eventId) {
      eventApi.get(eventId).then(setEvent).catch(console.error);
      loadStats();
      const interval = setInterval(loadStats, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [eventId]);

  const loadStats = () => {
    if (eventId) checkinApi.getStats(eventId).then(setData).catch(console.error);
  };

  if (!data) return <div className="p-10 text-center">Carregando...</div>;

  const entryPercent = (data.stats.entries / data.stats.total_capacity) * 100 || 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* ... existing UI ... */}
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{event?.title}</h1>
            <p className="text-blue-400">Dashboard de Portaria em Tempo Real</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-blue-500">{data.stats.entries}</p>
            <p className="text-xs text-gray-400 uppercase tracking-widest">Entradas Confirmadas</p>
          </div>
        </header>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-gray-400 text-sm mb-2">Ocupação</h3>
            <div className="text-2xl font-bold">{entryPercent.toFixed(1)}%</div>
            <div className="w-full bg-gray-700 h-2 mt-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: `${entryPercent}%` }}></div>
            </div>
          </div>
          <div className="bg-gray-800 p-6 rounded-2xl shadow-xl">
            <h3 className="text-gray-400 text-sm mb-2">Capacidade Restante</h3>
            <div className="text-2xl font-bold">{data.stats.total_capacity - data.stats.entries}</div>
            <p className="text-xs text-gray-500 mt-1">de {data.stats.total_capacity}</p>
          </div>
          <div className={`bg-gray-800 p-6 rounded-2xl shadow-xl border ${data.stats.fraud_alerts > 0 ? 'border-red-500 animate-pulse' : 'border-red-900/30'}`}>
            <h3 className="text-red-400 text-sm mb-2">Alertas de Fraude</h3>
            <div className="text-2xl font-bold">{data.stats.fraud_alerts || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {data.stats.fraud_alerts > 0 ? 'Atenção: Verifique os logs' : 'Nenhuma suspeita detectada'}
            </p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-xl font-bold">Últimas Entradas</h2>
            <button onClick={loadStats} className="text-xs text-blue-400 hover:underline">Atualizar agora</button>
          </div>
          <div className="divide-y divide-gray-700">
            {data.recentEntries.map((entry: any, i: number) => (
              <div key={i} className={`p-4 flex justify-between items-center hover:bg-gray-700/50 transition-colors ${entry.status === 'fraud' ? 'bg-red-900/20' : ''}`}>
                <div>
                  <p className="font-bold">{entry.code}</p>
                  <p className="text-xs text-gray-400">{entry.type_name}</p>
                  {entry.message && <p className="text-[10px] text-red-400 mt-1 font-bold">{entry.message}</p>}
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${
                    entry.status === 'valid' ? 'text-green-400' : 
                    entry.status === 'fraud' ? 'text-red-500' : 'text-yellow-400'
                  }`}>
                    {entry.status === 'valid' ? 'SUCESSO' : 
                     entry.status === 'fraud' ? 'FRAUDE' : 'REPETIDO'}
                  </p>
                  <p className="text-xs text-gray-500">{new Date(entry.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
            {data.recentEntries.length === 0 && (
              <div className="p-10 text-center text-gray-500 italic">Aguardando as primeiras entradas...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PortariaDashboard() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-white">Carregando Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
