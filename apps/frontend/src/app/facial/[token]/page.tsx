"use client";

import { useEffect, useState, useRef, use } from "react";
import { ticketApi, facialApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function FacialCapturePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    ticketApi.getByToken(token).then(data => {
      setTicket(data);
      setLoading(false);
      if (data && !data.face_id) startCamera();
    }).catch(console.error);

    return () => stream?.getTracks().forEach(t => t.stop());
  }, [token]);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      alert("Erro ao acessar câmera. Verifique as permissões.");
    }
  };

  const capture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current?.videoWidth || 640;
    canvas.height = videoRef.current?.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx && videoRef.current) {
      ctx.drawImage(videoRef.current, 0, 0);
      setCaptured(canvas.toDataURL("image/jpeg"));
    }
  };

  const save = async () => {
    if (!captured || !ticket) return;
    setSaving(true);
    try {
      await facialApi.capture({
        ticketId: ticket.id,
        eventId: ticket.event_id,
        imageBase64: captured
      });
      alert("Cadastro facial realizado com sucesso!");
      router.push("/dashboard/tickets"); // Redirect to tickets list
    } catch (err) {
      alert("Erro ao salvar cadastro facial.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;
  if (!ticket) return <div className="p-10 text-center text-red-500">Ingresso não encontrado ou inválido.</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-xl font-bold">Cadastro Facial</h1>
          <p className="text-sm opacity-80">{ticket.event_title}</p>
        </div>

        <div className="p-6">
          {!captured ? (
            <div className="space-y-6">
              <div className="relative aspect-square bg-black rounded-2xl overflow-hidden">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                <div className="absolute inset-0 border-4 border-dashed border-white/30 rounded-full m-8"></div>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">Posicione seu rosto no centro do círculo e clique no botão abaixo.</p>
                <button 
                  onClick={capture}
                  className="w-16 h-16 bg-blue-600 rounded-full border-4 border-white shadow-lg active:scale-95 transition-transform"
                ></button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="relative aspect-square bg-black rounded-2xl overflow-hidden">
                <img src={captured} className="w-full h-full object-cover" />
              </div>
              <div className="flex gap-4">
                <button 
                  onClick={() => setCaptured(null)}
                  className="flex-1 border-2 border-gray-200 py-3 rounded-xl font-bold text-gray-600"
                  disabled={saving}
                >
                  Repetir
                </button>
                <button 
                  onClick={save}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center"
                  disabled={saving}
                >
                  {saving ? "Salvando..." : "Confirmar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-400 max-w-xs">
        Seus dados faciais são protegidos e usados exclusivamente para acesso ao evento conforme nossa política de privacidade (LGPD).
      </div>
    </div>
  );
}
