"use client";

import { useState } from "react";

export default function BuyerWalletPage() {
  const [referralCode] = useState("REF-X9A2B");
  const [balance] = useState(45.50);
  const [referrals] = useState([
    { id: "1", friend: "marcus@email.com", status: "converted", credit: 15.00, date: "2026-04-20" },
    { id: "2", friend: "julia@email.com", status: "pending", credit: 0, date: "2026-04-22" },
    { id: "3", friend: "roberto@email.com", status: "converted", credit: 15.00, date: "2026-04-15" },
  ]);

  const copyLink = () => {
    navigator.clipboard.writeText(`https://basileia.events/ref/${referralCode}`);
    alert("Link de indicação copiado!");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Minha Carteira & Indicações</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="md:col-span-1 bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-3xl shadow-xl">
            <p className="text-purple-100 text-sm font-medium uppercase tracking-wider">Saldo Disponível</p>
            <h2 className="text-4xl font-black mt-2">R$ {balance.toFixed(2)}</h2>
            <p className="text-purple-200/60 text-xs mt-4">Válido por 6 meses após o recebimento.</p>
          </div>

          <div className="md:col-span-2 bg-gray-900 p-8 rounded-3xl border border-gray-800 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold">Convide amigos e ganhe créditos!</h3>
              <p className="text-gray-400 mt-2 text-sm">
                Seu amigo ganha **10% de desconto** e você ganha **R$ 15,00** em créditos para usar em qualquer evento da plataforma.
              </p>
            </div>
            
            <div className="mt-6 flex gap-3">
              <div className="flex-1 bg-black/40 border border-gray-700 rounded-xl px-4 py-3 font-mono text-purple-400 text-center">
                basileia.events/ref/{referralCode}
              </div>
              <button 
                onClick={copyLink}
                className="bg-white text-black font-bold px-6 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Copiar Link
              </button>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-bold mb-6">Histórico de Indicações</h2>
          <div className="bg-gray-900 rounded-3xl border border-gray-800 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase">Amigo Convidado</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase">Data</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase text-right">Crédito</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {referrals.map(ref => (
                  <tr key={ref.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{ref.friend}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(ref.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        ref.status === 'converted' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {ref.status === 'converted' ? 'Convertido' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={`font-bold ${ref.credit > 0 ? 'text-green-400' : 'text-gray-600'}`}>
                        {ref.credit > 0 ? `+ R$ ${ref.credit.toFixed(2)}` : '--'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
