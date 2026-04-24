"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

export default function PublicLandingPage() {
  const { slug } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock public data fetch
    setTimeout(() => {
      setData({
        title: "Summit Basileia 2026",
        start_date: "2026-10-15T09:00:00Z",
        content: {
          headline: "Transforme seu futuro com Tecnologia Gerada por IA",
          subheadline: "O evento definitivo para líderes que buscam inovação e escala.",
          about: "Prepare-se para dois dias de imersão total com os maiores especialistas do mundo em IA e Gestão.",
          sections: [
            { title: "Network", text: "Conecte-se com CEOs e Founders do ecossistema." },
            { title: "Prática", text: "Workshops focados em resultados reais e escaláveis." }
          ]
        },
        config: {
          primary_color: "#7c3aed"
        }
      });
      setLoading(false);
    }, 1000);
  }, [slug]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-purple-100">
      {/* Dynamic SEO Tags would go here in SSR version */}
      
      {/* Hero Section */}
      <header className="relative min-h-[90vh] flex items-center justify-center text-center px-6 overflow-hidden" style={{ backgroundColor: data.config.primary_color }}>
        <div className="absolute inset-0 opacity-10">
          {/* Mock abstract background pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl">
          <span className="bg-white/20 text-white px-4 py-1 rounded-full text-sm font-bold uppercase tracking-widest backdrop-blur-sm">
            {new Date(data.start_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })} • São Paulo, SP
          </span>
          <h1 className="text-6xl md:text-8xl font-black text-white mt-8 mb-8 leading-[1.1] tracking-tight">
            {data.content.headline}
          </h1>
          <p className="text-white/80 text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed">
            {data.content.subheadline}
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <button className="w-full sm:w-auto bg-white text-purple-700 hover:bg-gray-100 text-xl font-black px-12 py-5 rounded-2xl shadow-2xl transition-all transform hover:scale-105">
              Garantir minha vaga
            </button>
            <div className="flex flex-col items-start">
              <p className="text-white/60 text-sm font-bold uppercase tracking-tighter">Faltam apenas</p>
              <div className="text-white text-2xl font-black tabular-nums">
                24d : 12h : 05m
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section className="py-32 px-6 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-4xl font-black mb-8 leading-tight">Sobre o Evento</h2>
          <p className="text-gray-600 text-xl leading-relaxed">
            {data.content.about}
          </p>
          <div className="mt-10 space-y-6">
            {data.content.sections.map((s: any, i: number) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: data.config.primary_color }}>
                  ✓
                </div>
                <div>
                  <h3 className="font-bold text-xl">{s.title}</h3>
                  <p className="text-gray-500">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-100 aspect-square rounded-3xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-gray-300 font-bold italic">Imagem do Local</span>
          </div>
        </div>
      </section>

      {/* Pricing / Tickets Section */}
      <section className="bg-gray-50 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-black mb-4">Escolha seu Acesso</h2>
          <p className="text-gray-500">Lote atual com 85% vendido. Não perca a virada!</p>
        </div>
        
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 flex flex-col">
            <h3 className="text-2xl font-bold mb-2">Ingresso Regular</h3>
            <p className="text-gray-500 mb-8">Acesso total aos dois dias de evento e palestras principais.</p>
            <div className="mt-auto">
              <p className="text-sm text-gray-400 line-through">R$ 499,00</p>
              <p className="text-4xl font-black mb-8">R$ 297,00</p>
              <button className="w-full py-4 rounded-xl font-bold text-white transition-all" style={{ backgroundColor: data.config.primary_color }}>
                Comprar Agora
              </button>
            </div>
          </div>
          
          <div className="bg-black p-10 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
            <div className="absolute top-6 right-6 bg-purple-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Mais Vendido
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Experience VIP</h3>
            <p className="text-gray-400 mb-8">Tudo do Regular + Lounge Exclusivo, Almoço com Speakers e Kit VIP.</p>
            <div className="mt-auto">
              <p className="text-sm text-gray-600 line-through">R$ 1.299,00</p>
              <p className="text-4xl font-black text-white mb-8">R$ 797,00</p>
              <button className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-100 transition-all">
                Garantir Experiência VIP
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating CTA for Mobile */}
      <div className="fixed bottom-6 left-6 right-6 z-50 md:hidden">
        <button className="w-full py-5 rounded-2xl font-black text-white shadow-2xl text-lg" style={{ backgroundColor: data.config.primary_color }}>
          Garantir Ingresso — R$ 297
        </button>
      </div>
    </div>
  );
}
