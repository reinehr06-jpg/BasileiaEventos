"use client";

import { useState } from "react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Basileia Free",
      price: 0,
      description: "Ideal para pequenos eventos e testes iniciais.",
      features: [
        "Até 100 ingressos/mês",
        "Check-in via App",
        "Dashboard básico",
        "Taxa de 10% por venda"
      ],
      cta: "Começar Grátis",
      popular: false
    },
    {
      name: "Basileia Pro",
      price: 149,
      description: "Para organizadores que buscam escala e tecnologia.",
      features: [
        "Até 1.000 ingressos/mês",
        "Reconhecimento Facial",
        "IA Landing Page Builder",
        "Dashboard Analítico Completo",
        "Taxa reduzida (7%)"
      ],
      cta: "Assinar Pro",
      popular: true
    },
    {
      name: "Basileia Enterprise",
      price: 499,
      description: "Solução completa para grandes produtoras.",
      features: [
        "Ingressos Ilimitados",
        "White Label (Domínio Próprio)",
        "Gerente de Conta Dedicado",
        "API Pública & Webhooks",
        "Taxa negociável"
      ],
      cta: "Falar com Consultor",
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white py-20 px-6">
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-black mb-6">Escolha o plano ideal para seu evento</h1>
        <p className="text-gray-400 text-xl max-w-2xl mx-auto">
          Tecnologia de ponta, do pequeno workshop ao grande festival.
        </p>
        
        <div className="mt-10 flex items-center justify-center gap-4">
          <span className={billingCycle === 'monthly' ? 'text-white font-bold' : 'text-gray-500'}>Mensal</span>
          <button 
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-8 bg-gray-800 rounded-full relative p-1 transition-colors hover:bg-gray-700"
          >
            <div className={`w-6 h-6 bg-purple-500 rounded-full transition-transform ${billingCycle === 'yearly' ? 'translate-x-6' : ''}`}></div>
          </button>
          <span className={billingCycle === 'yearly' ? 'text-white font-bold' : 'text-gray-500'}>Anual (Economize 20%)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {plans.map((plan, i) => (
          <div 
            key={i} 
            className={`relative p-10 rounded-[40px] border transition-all hover:scale-105 ${
              plan.popular 
                ? 'bg-gradient-to-b from-purple-900/20 to-black border-purple-500 shadow-2xl shadow-purple-500/20' 
                : 'bg-gray-900/50 border-gray-800'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">
                Mais Escolhido
              </div>
            )}
            
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-gray-500 text-sm mb-8">{plan.description}</p>
            
            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-4xl font-black">R$ {billingCycle === 'yearly' ? Math.round(plan.price * 0.8) : plan.price}</span>
              <span className="text-gray-500">/mês</span>
            </div>
            
            <ul className="space-y-4 mb-10">
              {plan.features.map((feat, j) => (
                <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="text-purple-500">✦</span> {feat}
                </li>
              ))}
            </ul>
            
            <button className={`w-full py-4 rounded-2xl font-bold transition-all ${
              plan.popular 
                ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-xl' 
                : 'bg-white text-black hover:bg-gray-200'
            }`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
      
      <div className="mt-20 text-center text-gray-500 text-sm">
        <p>Todos os planos incluem suporte 24/7 e segurança de nível bancário.</p>
      </div>
    </div>
  );
}
