"use client";

import { useState, useEffect } from "react";

export default function DeveloperPage() {
  const [apiKey, setApiKey] = useState("basileia_live_sk_8f7h...2n9x");
  const [webhookUrl, setWebhookUrl] = useState("https://api.meusistema.com/webhooks");
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-black">Desenvolvedor</h1>
          <p className="text-gray-500 mt-2">Integre o Basileia Eventos ao seu fluxo de trabalho.</p>
        </div>

        {/* API Key Section */}
        <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Chave de API (Secret Key)</h3>
            <button className="text-purple-500 text-sm font-bold hover:underline">Revogar e Gerar Nova</button>
          </div>
          <div className="flex gap-4">
            <div className="flex-1 bg-black border border-gray-800 rounded-2xl px-6 py-4 font-mono text-sm relative group overflow-hidden">
              <span className={showKey ? '' : 'blur-sm select-none'}>{apiKey}</span>
              <button 
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showKey ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <button className="bg-white text-black font-bold px-6 py-4 rounded-2xl hover:bg-gray-200 transition-colors">
              Copiar
            </button>
          </div>
          <p className="mt-4 text-xs text-gray-600">
            Nunca compartilhe sua chave de API. Use-a apenas em ambientes de servidor seguros.
          </p>
        </div>

        {/* Webhook Section */}
        <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 mb-8">
          <h3 className="text-xl font-bold mb-6">Webhooks de Saída</h3>
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase text-gray-500">URL de Destino</label>
            <div className="flex gap-4">
              <input 
                type="text" 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="flex-1 bg-black border border-gray-800 rounded-2xl px-6 py-4 text-sm focus:border-purple-500 outline-none transition-colors"
                placeholder="https://sua-api.com/webhook"
              />
              <button className="bg-purple-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-purple-500 transition-colors">
                Salvar
              </button>
            </div>
          </div>

          <div className="mt-10">
            <h4 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Eventos Disponíveis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['ticket.created', 'ticket.checked_in', 'ticket.transferred', 'order.refunded', 'event.ended'].map(ev => (
                <div key={ev} className="flex items-center gap-3 bg-black/20 p-3 rounded-xl border border-gray-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                  <span className="text-sm font-mono text-gray-300">{ev}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Documentation Link */}
        <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 p-8 rounded-3xl border border-purple-500/20 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold">Documentação da API</h3>
            <p className="text-gray-400 text-sm mt-1">Veja todos os endpoints e modelos de dados no nosso Swagger interativo.</p>
          </div>
          <a 
            href={`${process.env.NEXT_PUBLIC_API_URL}/docs`} 
            target="_blank"
            className="bg-purple-600 text-white font-bold px-8 py-4 rounded-2xl hover:bg-purple-500 transition-colors"
          >
            Abrir Docs
          </a>
        </div>
      </div>
    </div>
  );
}
