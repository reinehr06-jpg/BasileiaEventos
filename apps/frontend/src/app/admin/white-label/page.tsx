"use client";

import { useState } from "react";

export default function WhiteLabelAdminPage() {
  const [clients] = useState([
    { id: "acc1", name: "Agência Premium", domain: "eventos.premium.com", status: "active", revenue: "R$ 42.500", license: "R$ 5.000" },
    { id: "acc2", name: "Festivais Brasil", domain: "vendas.festivais.com.br", status: "active", revenue: "R$ 128.000", license: "R$ 8.000" }
  ]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black">White-Label Management</h1>
            <p className="text-gray-500 mt-1">Controle de licenciamento e branding Enterprise.</p>
          </div>
          <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-2xl transition-all shadow-xl shadow-purple-500/20">
            + Novo Licenciado
          </button>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Receita Recorrente (MRR)</p>
            <h2 className="text-3xl font-black mt-2">R$ 54.000</h2>
          </div>
          <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Volume Transacionado</p>
            <h2 className="text-3xl font-black mt-2">R$ 450.200</h2>
          </div>
          <div className="bg-gray-900 p-6 rounded-3xl border border-gray-800">
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Contratos Ativos</p>
            <h2 className="text-3xl font-black mt-2">12</h2>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-gray-900 rounded-[32px] border border-gray-800 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-800/50 text-[10px] font-bold uppercase text-gray-500">
              <tr>
                <th className="px-8 py-5">Cliente</th>
                <th className="px-8 py-5">Domínio</th>
                <th className="px-8 py-5 text-center">Faturamento</th>
                <th className="px-8 py-5 text-center">Licença</th>
                <th className="px-8 py-5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {clients.map(client => (
                <tr key={client.id} className="hover:bg-gray-800/20 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center font-bold">
                        {client.name[0]}
                      </div>
                      <span className="font-bold">{client.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 font-mono text-gray-400 text-xs">{client.domain}</td>
                  <td className="px-8 py-6 text-center font-bold text-green-400">{client.revenue}</td>
                  <td className="px-8 py-6 text-center">{client.license}</td>
                  <td className="px-8 py-6 text-right">
                    <button className="text-gray-400 hover:text-white font-bold text-xs uppercase tracking-widest">Configurar Branding</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Branding Config Quick Form (Mock) */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-900 p-8 rounded-[32px] border border-gray-800">
            <h3 className="text-xl font-bold mb-8">Configuração Rápida de Branding</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Cor Primária</label>
                  <div className="flex gap-2">
                    <input type="color" defaultValue="#9333ea" className="w-12 h-12 bg-transparent border-none p-0 cursor-pointer" />
                    <input type="text" defaultValue="#9333ea" className="flex-1 bg-black border border-gray-800 rounded-xl px-4 text-sm font-mono" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-gray-500">Cor Secundária</label>
                  <div className="flex gap-2">
                    <input type="color" defaultValue="#000000" className="w-12 h-12 bg-transparent border-none p-0 cursor-pointer" />
                    <input type="text" defaultValue="#000000" className="flex-1 bg-black border border-gray-800 rounded-xl px-4 text-sm font-mono" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-gray-500">Logo do Tenant (URL)</label>
                <input type="text" className="w-full bg-black border border-gray-800 rounded-xl px-6 py-4 text-sm" placeholder="https://..." />
              </div>
              <button className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-gray-200 transition-colors">
                Atualizar Branding
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 p-8 rounded-[32px] border border-purple-500/20 flex flex-col justify-center text-center">
            <h3 className="text-2xl font-bold mb-4">Modo Enterprise Ativo ✦</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Você está gerenciando a infraestrutura global. Alterações de branding aqui são refletidas instantaneamente nos domínios configurados.
            </p>
            <div className="flex justify-center gap-2 text-xs font-bold uppercase tracking-widest text-purple-400">
              <span>Isolamento de Dados</span> • <span>SSL Automático</span> • <span>Multi-Tenant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
