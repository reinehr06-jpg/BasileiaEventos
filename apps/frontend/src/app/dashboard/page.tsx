"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
    else {
      // Mock stats fetch
      setStats({
        kpis: { revenue: 154780.50, tickets: 1240, events: 5, conversion: 4.2 },
        alerts: [
          { type: 'fraud', message: 'Detetada possível fraude no evento Summit 2026', time: '10m atrás' },
          { type: 'lot', message: 'Lote VIP - Festival de Inverno atingiu 90%', time: '1h atrás' }
        ]
      });

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/accounts/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then(setUser)
        .catch(() => router.push("/login"));
    }
  }, [router]);

  if (!user || !stats) return <div className="p-8 text-white">Carregando painel...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Painel Geral</h1>
          <p className="text-gray-500 mt-1">Bem-vindo de volta, <span className="text-purple-400 font-bold">{user.users?.[0]?.name}</span></p>
        </div>
        <div className="flex gap-4">
          <button onClick={() => router.push("/dashboard/events/new")} className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-lg shadow-purple-500/20">
            + Novo Evento
          </button>
          <button onClick={() => { localStorage.removeItem("token"); router.push("/login"); }} className="bg-gray-900 border border-gray-800 text-gray-400 p-3 rounded-2xl hover:text-white transition-colors">
            Sair
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Receita Total</p>
          <h2 className="text-3xl font-black mt-2">R$ {stats.kpis.revenue.toLocaleString()}</h2>
          <p className="text-green-500 text-xs mt-2">▲ 12% vs mês anterior</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Ingressos Vendidos</p>
          <h2 className="text-3xl font-black mt-2">{stats.kpis.tickets}</h2>
          <p className="text-green-500 text-xs mt-2">▲ 8% vs mês anterior</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Eventos Ativos</p>
          <h2 className="text-3xl font-black mt-2">{stats.kpis.events}</h2>
          <p className="text-gray-500 text-xs mt-2">-- estável</p>
        </div>
        <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Conversão Média</p>
          <h2 className="text-3xl font-black mt-2">{stats.kpis.conversion}%</h2>
          <p className="text-red-500 text-xs mt-2">▼ 0.5% vs mês anterior</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart Mock */}
        <div className="lg:col-span-2 bg-gray-900 p-8 rounded-3xl border border-gray-800 h-[400px] flex flex-col">
          <h3 className="font-bold mb-6">Tendência de Vendas (Últimos 30 dias)</h3>
          <div className="flex-1 flex items-end gap-2 px-2">
            {[40, 60, 30, 80, 45, 90, 70, 100, 85, 120, 60, 40].map((h, i) => (
              <div key={i} className="flex-1 bg-purple-500/20 hover:bg-purple-500 transition-all rounded-t-lg group relative" style={{ height: `${h}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  R$ {(h * 100).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-gray-600 font-bold uppercase">
            <span>01 Abr</span>
            <span>15 Abr</span>
            <span>30 Abr</span>
          </div>
        </div>

        {/* Alerts & News */}
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span> Alertas Ativos
            </h3>
            <div className="space-y-4">
              {stats.alerts.map((alert: any, i: number) => (
                <div key={i} className="bg-black/20 p-4 rounded-2xl border border-gray-800 group hover:border-gray-700 transition-colors cursor-pointer">
                  <p className="text-sm font-medium text-gray-200">{alert.message}</p>
                  <p className="text-[10px] text-gray-600 mt-1 font-bold uppercase">{alert.time}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-6 rounded-3xl border border-purple-500/20">
            <h3 className="font-bold text-white mb-2">IA Analítica 🪄</h3>
            <p className="text-xs text-purple-200/60 leading-relaxed">
              O evento **Summit 2026** tem 92% de chance de esgotar em 48h. Recomendamos antecipar a virada do 3º lote para hoje às 18h.
            </p>
            <button className="mt-4 text-xs font-bold text-white bg-purple-500/20 hover:bg-purple-500/40 px-4 py-2 rounded-lg transition-colors">
              Ver Insights Detalhados
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
