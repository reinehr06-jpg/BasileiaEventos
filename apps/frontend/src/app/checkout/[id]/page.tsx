"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ticketApi } from "@/lib/api";

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: typeId } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const utmId = searchParams.get("utm_id") || searchParams.get("basileia_tid");
  const tenantId = searchParams.get("tenant") || "basileia_tenant_admin";
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  useEffect(() => {
    // Track checkout start
    if (utmId && (window as any).BasileiaPixel) {
      (window as any).BasileiaPixel.track('checkout_start', { typeId });
    }
    setLoading(false);
  }, [utmId, typeId]);

  const handlePurchase = async () => {
    setProcessing(true);
    // Simulating API call to create order
    setTimeout(() => {
      const orderId = `ord_${Math.random().toString(36).substr(2, 9)}`;
      
      // Track purchase if UTM exists
      if (utmId && (window as any).BasileiaPixel) {
        (window as any).BasileiaPixel.track('purchase', { orderId });
      }
      
      alert("Compra realizada com sucesso! Redirecionando para o ingresso...");
      router.push(`/dashboard/tickets`);
    }, 2000);
  };

  if (loading) return <div className="p-10 text-center">Carregando Checkout...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] shadow-2xl overflow-hidden">
        <div className="bg-blue-600 p-8 text-white">
          <h1 className="text-2xl font-black">Finalizar Compra</h1>
          <p className="opacity-80">Você está a um passo do seu evento.</p>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 font-medium">Ingresso Selecionado</span>
              <span className="text-blue-600 font-bold">Alterar</span>
            </div>
            <p className="text-xl font-black text-gray-900">Ingresso Geral</p>
            <p className="text-2xl font-black text-gray-900 mt-2">R$ 150,00</p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-gray-900">Método de Pagamento</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-blue-600 p-4 rounded-2xl flex flex-col items-center gap-2 bg-blue-50">
                <span className="text-2xl">🏦</span>
                <span className="font-bold text-blue-600">PIX</span>
              </div>
              <div className="border-2 border-gray-100 p-4 rounded-2xl flex flex-col items-center gap-2 opacity-50 grayscale">
                <span className="text-2xl">💳</span>
                <span className="font-bold text-gray-400">Cartão</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handlePurchase}
            disabled={processing}
            className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl shadow-green-500/20 active:scale-95 transition-transform disabled:opacity-50"
          >
            {processing ? "Processando..." : "PAGAR AGORA"}
          </button>
          
          <p className="text-center text-xs text-gray-400 font-medium px-4">
            Ao clicar em pagar, você concorda com nossos termos de uso e política de cancelamento.
          </p>
        </div>
      </div>

      {/* Script do Pixel para teste local */}
      <script src={`http://localhost:3001/pixel.js?t=${Date.now()}`} data-tenant={tenantId} />
    </div>
  );
}
