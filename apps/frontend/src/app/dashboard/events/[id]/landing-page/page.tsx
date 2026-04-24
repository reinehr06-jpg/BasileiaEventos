"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function AILandingPageBuilder() {
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [briefing, setBriefing] = useState({
    event_name: "",
    target_audience: "",
    description: "",
    tone: "professional",
    primary_color: "#6366f1"
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<any>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Mock API call
    setTimeout(() => {
      setContent({
        headline: briefing.event_name || "O Futuro dos Eventos",
        subheadline: "Uma experiência única gerada por IA para você.",
        about: briefing.description || "Descrição do evento gerada automaticamente...",
        sections: [
          { title: "Inovação", text: "O que há de mais moderno em " + briefing.target_audience },
          { title: "Networking", text: "Conecte-se com os melhores do mercado." }
        ]
      });
      setIsGenerating(false);
      setStep(2);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">AI Page Builder 🪄</h1>
            <p className="text-gray-400 mt-1">Crie sua landing page profissional em segundos.</p>
          </div>
          {step === 2 && (
            <div className="flex gap-4">
              <button onClick={() => setStep(1)} className="px-6 py-2 bg-gray-800 rounded-xl border border-gray-700 font-bold">Voltar</button>
              <button className="px-6 py-2 bg-purple-600 rounded-xl font-bold shadow-lg shadow-purple-500/20">Publicar Página</button>
            </div>
          )}
        </div>

        {step === 1 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 space-y-6">
              <h2 className="text-xl font-bold">Briefing do Evento</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Nome do Evento</label>
                  <input 
                    type="text" 
                    value={briefing.event_name}
                    onChange={e => setBriefing({...briefing, event_name: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Ex: Summit Tech 2026"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Público-Alvo</label>
                  <input 
                    type="text" 
                    value={briefing.target_audience}
                    onChange={e => setBriefing({...briefing, target_audience: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Ex: Desenvolvedores e CTOs"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Descrição</label>
                  <textarea 
                    rows={4}
                    value={briefing.description}
                    onChange={e => setBriefing({...briefing, description: e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Conte mais sobre o evento..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Tom de Voz</label>
                    <select 
                      value={briefing.tone}
                      onChange={e => setBriefing({...briefing, tone: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2"
                    >
                      <option value="professional">Profissional</option>
                      <option value="casual">Descontraído</option>
                      <option value="luxury">Luxo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Cor Primária</label>
                    <input 
                      type="color" 
                      value={briefing.primary_color}
                      onChange={e => setBriefing({...briefing, primary_color: e.target.value})}
                      className="w-full h-10 bg-gray-800 border border-gray-700 rounded-xl cursor-pointer"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-purple-500/10 flex items-center justify-center gap-2"
                >
                  {isGenerating ? "Gerando Magia..." : "Gerar Landing Page ✨"}
                </button>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-3xl border border-gray-800 border-dashed flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🪄</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Sua Página aparecerá aqui</h3>
              <p className="text-gray-500 text-sm">
                Preencha o briefing e deixe nossa IA criar uma estrutura de alta conversão para o seu evento.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Editor */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                <h3 className="font-bold mb-4">Editor de Texto</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Headline</label>
                    <input 
                      type="text" 
                      value={content.headline}
                      onChange={e => setContent({...content, headline: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase">Subheadline</label>
                    <textarea 
                      value={content.subheadline}
                      onChange={e => setContent({...content, subheadline: e.target.value})}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Live Preview Iframe Mock */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl h-[700px] border-[8px] border-gray-800 flex flex-col">
                <div className="bg-gray-100 p-3 border-b flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="bg-white px-4 py-1 rounded-md text-xs text-gray-400 border flex-1 text-center">
                    basileia.events/preview/{id}
                  </div>
                </div>
                
                {/* Preview Content */}
                <div className="flex-1 overflow-y-auto bg-white text-black font-sans">
                  <header className="p-12 text-center" style={{ backgroundColor: briefing.primary_color }}>
                    <h1 className="text-5xl font-black text-white mb-6 leading-tight">{content.headline}</h1>
                    <p className="text-white/80 text-xl max-w-2xl mx-auto">{content.subheadline}</p>
                    <button className="mt-8 bg-black text-white px-8 py-4 rounded-xl font-bold text-lg">Garantir Ingresso</button>
                  </header>
                  
                  <section className="py-20 px-12 max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8">Sobre o Evento</h2>
                    <p className="text-gray-600 leading-relaxed text-lg">{content.about}</p>
                    
                    <div className="grid grid-cols-2 gap-8 mt-12">
                      {content.sections.map((s: any, i: number) => (
                        <div key={i} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                          <h3 className="font-bold text-xl mb-2">{s.title}</h3>
                          <p className="text-gray-500">{s.text}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
