"use client";

import { useEffect, useState, useRef, use } from "react";
import { facialApi, eventApi } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function TotemContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [event, setEvent] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [identifying, setIdentifying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (eventId) {
      eventApi.get(eventId).then(setEvent).catch(console.error);
      startCamera();
    }
    return () => stopCamera();
  }, [eventId]);

  useEffect(() => {
    let interval: any;
    if (identifying && eventId) {
      interval = setInterval(captureAndIdentify, 3000); // Try to identify every 3s
    }
    return () => clearInterval(interval);
  }, [identifying, eventId]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error", err);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(t => t.stop());
  };

  const captureAndIdentify = async () => {
    if (!videoRef.current || !canvasRef.current || !eventId) return;

    const ctx = canvasRef.current.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 320, 240);
      const imageBase64 = canvasRef.current.toDataURL("image/jpeg", 0.5);
      
      try {
        const res = await facialApi.identify({ eventId, imageBase64 });
        if (res.status === "identified") {
          setIdentifying(false);
          setResult(res);
          playSuccess();
          setTimeout(reset, 5000); // Auto reset after 5s
        }
      } catch (err) {
        console.error("Identify error", err);
      }
    }
  };

  const playSuccess = () => {
    if (typeof window !== "undefined" && window.navigator.vibrate) window.navigator.vibrate(200);
    // Add audio feedback if needed
  };

  const reset = () => {
    setResult(null);
    setIdentifying(true);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8 overflow-hidden">
      <div className="grid lg:grid-cols-2 gap-12 w-full max-w-7xl items-center">
        
        {/* Camera Section */}
        <div className="relative aspect-video lg:aspect-square bg-gray-900 rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(59,130,246,0.2)] border-8 border-gray-800">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-500 ${identifying ? 'opacity-100' : 'opacity-30'}`}
          />
          <canvas ref={canvasRef} width="320" height="240" className="hidden" />
          
          {identifying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border-4 border-blue-500/50 rounded-full animate-[ping_3s_linear_infinite]"></div>
              <div className="absolute w-80 h-80 border-2 border-blue-400/20 rounded-full"></div>
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scan_4s_ease-in-out_infinite]"></div>
            </div>
          )}

          {!identifying && result && (
             <div className="absolute inset-0 flex items-center justify-center bg-green-600/20 backdrop-blur-sm">
                <div className="text-9xl">✅</div>
             </div>
          )}
        </div>

        {/* Info Section */}
        <div className="text-center lg:text-left space-y-8">
          <div>
            <h1 className="text-4xl lg:text-6xl font-black text-white mb-4 uppercase tracking-tighter">Basilea<span className="text-blue-500">Secure</span></h1>
            <p className="text-xl text-gray-400 font-medium">Reconhecimento Facial em Tempo Real</p>
            <div className="mt-4 inline-block bg-blue-600/10 border border-blue-500/30 px-4 py-2 rounded-full">
              <span className="text-blue-400 font-bold text-sm tracking-widest uppercase">{event?.title || 'Carregando Evento...'}</span>
            </div>
          </div>

          <div className="min-h-[300px]">
            {identifying ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-gray-500">
                  <div className="w-12 h-12 rounded-full border-4 border-gray-800 border-t-blue-500 animate-spin"></div>
                  <p className="text-2xl font-bold italic">Aguardando identificação...</p>
                </div>
                <div className="bg-gray-800/50 p-6 rounded-3xl border border-gray-700">
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Instruções</h4>
                  <ul className="text-gray-300 space-y-3 font-medium">
                    <li className="flex gap-3"><span>1.</span> Olhe fixamente para a tela</li>
                    <li className="flex gap-3"><span>2.</span> Retire óculos escuros ou máscara</li>
                    <li className="flex gap-3"><span>3.</span> Aguarde o sinal verde</li>
                  </ul>
                </div>
              </div>
            ) : result && (
              <div className="animate-[slideUp_0.5s_ease-out] space-y-6">
                <div className="bg-green-600 p-8 rounded-[40px] shadow-[0_0_50px_rgba(22,163,74,0.4)]">
                  <h2 className="text-6xl font-black text-white mb-2 italic uppercase">LIBERADO</h2>
                  <p className="text-2xl font-bold text-green-100">{result.ticket.buyer_name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 p-6 rounded-3xl">
                    <p className="text-xs font-black text-gray-500 uppercase mb-1">Setor</p>
                    <p className="text-xl font-bold text-white">{result.ticket.type_name}</p>
                  </div>
                  <div className="bg-gray-800 p-6 rounded-3xl">
                    <p className="text-xs font-black text-gray-500 uppercase mb-1">Código</p>
                    <p className="text-xl font-bold text-white">#{result.ticket.code}</p>
                  </div>
                </div>
                <button onClick={reset} className="text-blue-400 font-bold hover:underline">Reiniciar manualmente</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-150px); }
          50% { transform: translateY(150px); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default function TotemPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando Totem...</div>}>
      <TotemContent />
    </Suspense>
  );
}
