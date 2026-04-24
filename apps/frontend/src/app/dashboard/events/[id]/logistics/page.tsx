"use client";

import { useEffect, useState, use } from "react";
import { physicalApi, eventApi } from "@/lib/api";

export default function LogisticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params);
  const [event, setEvent] = useState<any>(null);
  const [shippingOrders, setShippingOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventApi.get(eventId).then(setEvent).catch(console.error);
    loadData();
  }, [eventId]);

  const loadData = () => {
    physicalApi.listShipping(eventId).then(data => {
      setShippingOrders(data);
      setLoading(false);
    }).catch(console.error);
  };

  const handleRetry = async (id: number) => {
    await physicalApi.retryFulfillment(id);
    loadData();
  };

  if (!event) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-10">
      <header>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Logística & Envios</h1>
        <p className="text-gray-500 font-medium">Gestão de produtos físicos para <span className="text-blue-600">"{event.title}"</span></p>
      </header>

      {/* Stats Summary */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Total Pedidos</p>
          <p className="text-3xl font-black text-gray-900">{shippingOrders.length}</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-3xl border border-yellow-100">
          <p className="text-xs font-black text-yellow-600 uppercase tracking-widest mb-1">Pendentes</p>
          <p className="text-3xl font-black text-yellow-700">{shippingOrders.filter(o => o.status === 'pending').length}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-3xl border border-green-100">
          <p className="text-xs font-black text-green-600 uppercase tracking-widest mb-1">Enviados</p>
          <p className="text-3xl font-black text-green-700">{shippingOrders.filter(o => o.status === 'shipped' || o.status === 'delivered').length}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-3xl border border-red-100">
          <p className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">Erros</p>
          <p className="text-3xl font-black text-red-700">{shippingOrders.filter(o => o.status === 'error').length}</p>
        </div>
      </div>

      {/* Shipping List */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Lista de Envios</h3>
          <button className="text-blue-600 font-bold text-sm">Exportar CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs font-black text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Comprador / Produto</th>
                <th className="px-6 py-4">Endereço</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Rastreio</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shippingOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-5">
                    <p className="font-bold text-gray-900">{order.buyer_name}</p>
                    <p className="text-xs text-gray-400 font-medium">{order.product_name}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm text-gray-600">{order.address_line1}</p>
                    <p className="text-xs text-gray-400">{order.city} - {order.state} / {order.zip_code}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      order.status === 'shipped' ? 'bg-green-100 text-green-700' :
                      order.status === 'error' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                    {order.error_message && <p className="text-[10px] text-red-500 mt-1 max-w-[150px] truncate" title={order.error_message}>{order.error_message}</p>}
                  </td>
                  <td className="px-6 py-5">
                    {order.tracking_code ? (
                      <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{order.tracking_code}</span>
                    ) : <span className="text-gray-300 italic">Aguardando</span>}
                  </td>
                  <td className="px-6 py-5">
                    {order.status === 'error' && (
                      <button onClick={() => handleRetry(order.id)} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform">
                        Repetir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shippingOrders.length === 0 && (
            <div className="p-12 text-center text-gray-400 italic">Nenhum pedido físico encontrado.</div>
          )}
        </div>
      </div>
    </div>
  );
}
