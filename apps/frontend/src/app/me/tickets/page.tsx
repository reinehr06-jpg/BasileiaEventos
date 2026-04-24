"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Ticket {
  id: string;
  code: string;
  qrToken: string;
  eventName: string;
  startDate: string;
  typeName: string;
  status: string;
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch for demonstration
    setTickets([
      {
        id: "tick-123",
        code: "VIP-8A9B",
        qrToken: "tok_abc123",
        eventName: "Festival Basileia 2026",
        startDate: "2026-12-10T18:00:00Z",
        typeName: "VIP Experience",
        status: "active",
      }
    ]);
    setLoading(false);
  }, []);

  const handleAppleWallet = async (ticketId: string) => {
    try {
      // In real life, trigger a download
      alert("Baixando arquivo .pkpass...");
      const res = await api.get(\`/wallet/\${ticketId}/apple\`, { responseType: 'blob' });
      // const url = window.URL.createObjectURL(new Blob([res.data]));
      // const link = document.createElement('a');
      // link.href = url;
      // link.setAttribute('download', \`ticket-\${ticketId}.pkpass\`);
      // document.body.appendChild(link);
      // link.click();
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar Apple Wallet pass.");
    }
  };

  const handleGoogleWallet = async (ticketId: string) => {
    try {
      const res = await api.post(\`/wallet/\${ticketId}/google\`);
      window.open(res.data.url, "_blank");
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar link do Google Wallet.");
    }
  };

  if (loading) return <div className="p-8 text-white">Carregando seus ingressos...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 tracking-tight">Meus Ingressos</h1>
        
        {tickets.length === 0 ? (
          <div className="bg-gray-800 p-8 rounded-2xl text-center border border-gray-700">
            <p className="text-gray-400">Você ainda não tem ingressos.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tickets.map(ticket => (
              <div key={ticket.id} className="bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700">
                <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-purple-900/40 to-indigo-900/40">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-semibold uppercase tracking-wider">
                        {ticket.typeName}
                      </span>
                      <h2 className="text-2xl font-bold mt-3">{ticket.eventName}</h2>
                      <p className="text-gray-400 mt-1">
                        {new Date(ticket.startDate).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col md:flex-row items-center gap-8">
                  <div className="bg-white p-4 rounded-xl">
                    {/* Mock QR Code representation */}
                    <div className="w-32 h-32 bg-black flex items-center justify-center">
                      <span className="text-white text-xs">QR CODE</span>
                    </div>
                    <p className="text-center text-black text-xs font-mono mt-2">{ticket.code}</p>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <p className="text-sm text-gray-400">
                      Apresente este QR Code na entrada. O ingresso está salvo offline neste dispositivo.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={() => handleAppleWallet(ticket.id)}
                        className="flex-1 bg-black hover:bg-gray-900 text-white border border-gray-700 rounded-xl py-3 px-4 font-semibold flex items-center justify-center transition-colors"
                      >
                        <span className="mr-2"></span> Add to Apple Wallet
                      </button>
                      
                      <button 
                        onClick={() => handleGoogleWallet(ticket.id)}
                        className="flex-1 bg-gray-100 hover:bg-white text-gray-900 rounded-xl py-3 px-4 font-semibold flex items-center justify-center transition-colors"
                      >
                        <span className="text-blue-500 mr-2">G</span> Save to Google Wallet
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
