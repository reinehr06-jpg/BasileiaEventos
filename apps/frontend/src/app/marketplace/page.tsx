"use client";

import { useState } from "react";

export default function MarketplacePage() {
  const [suppliers] = useState([
    { id: "s1", name: "Buffet Gourmet Premium", category: "Alimentação", city: "São Paulo", rating: 4.9, plan: "gold", logo: "🍱" },
    { id: "s2", name: "LED & Luz Audiovisual", category: "Audiovisual", city: "Rio de Janeiro", rating: 4.7, plan: "silver", logo: "💡" },
    { id: "s3", name: "Som & Palco Pro", category: "Audiovisual", city: "São Paulo", rating: 4.8, plan: "bronze", logo: "🔊" },
    { id: "s4", name: "Mobiliário Design", category: "Mobiliário", city: "Curitiba", rating: 4.6, plan: "bronze", logo: "🪑" },
  ]);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black">Marketplace de Fornecedores</h1>
            <p className="text-gray-400 mt-2">Encontre os melhores parceiros para o seu evento.</p>
          </div>
          <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-8 py-3 rounded-2xl transition-all shadow-xl shadow-purple-500/20">
            Sou um Fornecedor
          </button>
        </div>

        {/* Filters Mock */}
        <div className="flex gap-4 mb-10 overflow-x-auto pb-4">
          {["Todos", "Alimentação", "Audiovisual", "Mobiliário", "Segurança", "Limpeza"].map(cat => (
            <button key={cat} className="px-6 py-2 bg-gray-900 border border-gray-800 rounded-xl text-sm font-bold whitespace-nowrap hover:border-purple-500 transition-colors">
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {suppliers.sort((a, b) => {
            const priority: any = { gold: 3, silver: 2, bronze: 1 };
            return priority[b.plan] - priority[a.plan];
          }).map(sup => (
            <div 
              key={sup.id} 
              className={`p-8 rounded-[32px] border transition-all hover:scale-[1.02] cursor-pointer flex flex-col ${
                sup.plan === 'gold' ? 'bg-gradient-to-br from-purple-900/40 to-black border-purple-500 shadow-2xl shadow-purple-500/10' :
                sup.plan === 'silver' ? 'bg-gray-900 border-gray-400/30' :
                'bg-gray-900/50 border-gray-800'
              }`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center text-3xl">
                  {sup.logo}
                </div>
                {sup.plan === 'gold' && (
                  <span className="bg-purple-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    ✦ Verificado
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-bold mb-1">{sup.name}</h3>
              <p className="text-gray-500 text-sm mb-4">{sup.category} • {sup.city}</p>
              
              <div className="flex items-center gap-1 mb-8">
                <span className="text-yellow-500 text-sm">★</span>
                <span className="text-sm font-bold">{sup.rating}</span>
              </div>
              
              <div className="mt-auto flex gap-3">
                <button className="flex-1 bg-white text-black font-bold py-3 rounded-xl text-sm hover:bg-gray-200 transition-colors">
                  Ver Portfólio
                </button>
                <button className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center hover:bg-green-500/20 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.01 2.01c-5.52 0-10 4.48-10 10 0 1.74.45 3.37 1.23 4.79l-1.24 4.51 4.62-1.21c1.4.73 3 1.14 4.68 1.14 5.52 0 10-4.48 10-10s-4.48-10-10-10zM6.73 17.51l-.27-.16c-1.12-.67-2.15-1.7-2.82-2.82l-.16-.27.27-.1c.32-.12.67-.21 1.03-.27l.3-.05.07-.3c.09-.37.24-.72.44-1.04l.17-.28-.21-.25c-.24-.28-.46-.57-.65-.89l-.16-.28.27-.13c.4-.2.83-.35 1.28-.45l.33-.07.03-.34c.04-.42.13-.83.27-1.22l.1-.28-.26-.18c-.3-.21-.57-.45-.81-.72l-.2-.23.23-.17c.36-.26.75-.48 1.17-.65l.3-.13.01-.33c.01-.44.07-.87.18-1.29l.08-.3-.25-.19c-.27-.21-.52-.45-.73-.72l-.18-.24.24-.16c.38-.25.79-.46 1.22-.62l.31-.11.01-.33c.01-.44.07-.87.18-1.29l.08-.3z"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
