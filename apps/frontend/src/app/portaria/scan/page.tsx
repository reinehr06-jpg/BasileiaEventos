"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { ticketApi, checkinApi } from "@/lib/api";
import { Html5QrcodeScanner } from "html5-qrcode";
import { getTicket, saveOfflineLog, saveTickets } from "@/lib/offline-db";

import { Suspense } from "react";

function ScanContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [result, setResult] = useState<any>(null);
  const [scanning, setScanning] = useState(true);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    window.addEventListener("online", () => setIsOffline(false));
    window.addEventListener("offline", () => setIsOffline(true));
    
    if (scanning) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      scannerRef.current.render(onScanSuccess, onScanFailure);
    }

    return () => {
      scannerRef.current?.clear().catch(console.error);
    };
  }, [scanning]);

  const onScanSuccess = async (decodedText: string) => {
    setScanning(false);
    scannerRef.current?.clear().catch(console.error);
    
    try {
      if (isOffline) {
        const ticket = await getTicket(decodedText);
        if (ticket) {
          const res = { status: "valid", ticket, allowed_zones: ticket.allowed_zones, offline: true };
          setResult(res);
          await saveOfflineLog({ ticketId: ticket.id, status: "valid" });
          playFeedback("valid");
        } else {
          setResult({ status: "invalid", error: "Não encontrado em cache offline" });
          playFeedback("error");
        }
      } else {
        const res = await ticketApi.validate(decodedText);
        setResult(res);
        playFeedback(res.status);
      }
    } catch (err) {
      setResult({ status: "error", message: "Erro na validação" });
      playFeedback("error");
    }
  };

  const syncOffline = async () => {
    if (!eventId) return;
    const tickets = await checkinApi.getSync(eventId);
    await saveTickets(tickets);
    alert("Sincronizado! " + tickets.length + " ingressos baixados.");
  };

  const onScanFailure = (error: any) => {
    // Silently ignore failures
  };

  const playFeedback = (status: string) => {
    // Haptic feedback
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      if (status === "valid") window.navigator.vibrate(100);
      else window.navigator.vibrate([100, 50, 100]);
    }

    // Audio feedback using Web Audio API
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (status === "valid") {
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch A5
      oscillator.type = "sine";
    } else if (status === "already_used") {
      oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // Medium pitch A4
      oscillator.type = "square";
    } else {
      oscillator.frequency.setValueAtTime(220, audioCtx.currentTime); // Low pitch A3
      oscillator.type = "sawtooth";
    }

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
    oscillator.stop(audioCtx.currentTime + 0.5);
  };

  const reset = () => {
    setResult(null);
    setScanning(true);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      {scanning ? (
        <div className="w-full max-w-sm">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-white text-xl font-bold">Escanear</h1>
            <div className="flex gap-2">
              <button onClick={syncOffline} className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full font-bold">Sincronizar</button>
              {isOffline && <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full font-bold">OFFLINE</span>}
            </div>
          </div>
          <div id="reader" className="overflow-hidden rounded-2xl bg-white"></div>
        </div>
      ) : result && (
        <div className={`w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl ${
          result.status === 'valid' ? 'bg-green-500' : 
          result.status === 'already_used' ? 'bg-yellow-500' : 'bg-red-500'
        }`}>
          <div className="text-white">
            {result.status === 'valid' ? (
              <>
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-3xl font-black mb-2">VÁLIDO</h2>
                <p className="text-xl opacity-90">{result.ticket.buyer_name || 'Visitante'}</p>
                <div className="mt-6 bg-white/20 p-4 rounded-xl">
                  <p className="text-sm uppercase font-bold tracking-widest mb-1">Acesso Liberado:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {result.allowed_zones?.map((z: string) => (
                      <span key={z} className="bg-white text-black px-3 py-1 rounded-full text-xs font-black">{z}</span>
                    ))}
                    {(!result.allowed_zones || result.allowed_zones.length === 0) && <span className="text-white font-bold">ÁREA GERAL</span>}
                  </div>
                </div>
              </>
            ) : result.status === 'already_used' ? (
              <>
                <div className="text-6xl mb-4">⚠️</div>
                <h2 className="text-3xl font-black mb-2">JÁ USADO</h2>
                <p className="opacity-90">Validado em: {new Date(result.usedAt).toLocaleTimeString()}</p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">❌</div>
                <h2 className="text-3xl font-black mb-2">INVÁLIDO</h2>
                <p className="opacity-90">{result.error || "Código não encontrado"}</p>
              </>
            )}
            
            <button 
              onClick={reset}
              className="mt-10 w-full bg-white text-black py-4 rounded-2xl font-black text-xl active:scale-95 transition-transform"
            >
              PRÓXIMO SCAN
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Carregando Scanner...</div>}>
      <ScanContent />
    </Suspense>
  );
}
