"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

export default function OrganizerProfilePage() {
  const { slug } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demo
    const cleanSlug = String(slug).replace('%40', '').replace('@', '');
    
    setProfile({
      name: "Basileia Tech",
      slug: cleanSlug,
      bio: "Transformando eventos com tecnologia de ponta e experiências inesquecíveis.",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Basileia",
      verified: true,
      social_links: { instagram: "basileia.tech", twitter: "basileiatech" }
    });

    setEvents([
      { id: "1", title: "Hackathon Basileia 2026", start_date: "2026-11-15T09:00:00Z", price: 50 },
      { id: "2", title: "Summit de Inovação", start_date: "2026-12-01T14:00:00Z", price: 120 }
    ]);

    setReviews([
      { id: "r1", user_name: "João Silva", rating: 5, comment: "Melhor evento que já participei! Organização impecável." },
      { id: "r2", user_name: "Maria Oliveira", rating: 4, comment: "Experiência incrível, mal posso esperar pelo próximo." }
    ]);

    setLoading(false);
  }, [slug]);

  if (loading) return <div className="p-8 text-white">Carregando perfil...</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header / Cover */}
      <div className="h-64 bg-gradient-to-r from-purple-900 to-indigo-900"></div>
      
      <div className="max-w-5xl mx-auto px-6 -mt-20">
        <div className="bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <img 
              src={profile.avatar_url} 
              alt={profile.name} 
              className="w-32 h-32 rounded-3xl border-4 border-gray-900 bg-gray-800"
            />
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                {profile.verified && (
                  <span className="text-blue-400 bg-blue-400/10 p-1 rounded-full">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.64.304 1.25.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-gray-400 mt-2 max-w-2xl">{profile.bio}</p>
              
              <div className="flex gap-4 mt-4 justify-center md:justify-start">
                <button className="px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors">
                  Seguir
                </button>
                <button className="px-6 py-2 bg-gray-800 text-white font-bold rounded-xl border border-gray-700 hover:bg-gray-700 transition-colors">
                  Mensagem
                </button>
              </div>
            </div>
            
            <div className="flex gap-8 text-center border-l border-gray-800 pl-8 hidden md:flex">
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-gray-500 text-sm">Eventos</p>
              </div>
              <div>
                <p className="text-2xl font-bold">4.9</p>
                <p className="text-gray-500 text-sm">Nota</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Main Column */}
          <div className="md:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-6">Próximos Eventos</h2>
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="bg-gray-900 p-6 rounded-2xl border border-gray-800 hover:border-purple-500 transition-all group">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors">{event.title}</h3>
                        <p className="text-gray-500 text-sm mt-1">
                          {new Date(event.start_date).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                      <button className="px-6 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-500 transition-colors">
                        Comprar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">Avaliações da Comunidade</h2>
              <div className="space-y-6">
                {reviews.map(review => (
                  <div key={review.id} className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex text-yellow-500">
                        {[...Array(review.rating)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                      </div>
                      <span className="font-bold text-sm">{review.user_name}</span>
                    </div>
                    <p className="text-gray-400">{review.comment}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <h3 className="font-bold mb-4">Credibilidade</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/10 p-2 rounded-lg text-green-500">🏆</div>
                  <div>
                    <p className="text-sm font-bold">10+ Eventos Realizados</p>
                    <p className="text-xs text-gray-500">Organizador experiente</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/10 p-2 rounded-lg text-purple-500">🌟</div>
                  <div>
                    <p className="text-sm font-bold">Top Rated</p>
                    <p className="text-xs text-gray-500">Média acima de 4.8</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800">
              <h3 className="font-bold mb-4">Redes Sociais</h3>
              <div className="space-y-2">
                <p className="text-gray-400 text-sm">Instagram: <span className="text-white">@basileia.tech</span></p>
                <p className="text-gray-400 text-sm">Twitter: <span className="text-white">@basileiatech</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
