"use client";

import { useState } from "react";

export default function TeamManagementPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Viewer");
  const [members, setMembers] = useState([
    { id: "1", name: "Vinícius Reinehr", email: "vinicius@basileia.events", role: "Owner", status: "active" },
    { id: "2", name: "Lucas Marketing", email: "lucas@marketing.com", role: "Marketing", status: "active" },
    { id: "3", name: "Ana Finance", email: "ana@finance.com", role: "Finance", status: "pending" },
  ]);

  const roles = ["Owner", "Finance", "Portaria", "Marketing", "Viewer"];

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const newMember = {
      id: Math.random().toString(),
      name: "Convite Pendente",
      email,
      role,
      status: "pending"
    };
    setMembers([...members, newMember]);
    setEmail("");
    alert(`Convite enviado para ${email} como ${role}`);
  };

  const handleRevoke = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestão da Equipe</h1>
          <p className="text-gray-400 mt-1">Gerencie colaboradores e permissões de acesso.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Invite Form */}
        <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 h-fit">
          <h2 className="text-xl font-bold text-white mb-6">Convidar Membro</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">E-mail</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ex: colaborador@email.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Papel</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:ring-2 focus:ring-purple-500 outline-none"
              >
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors">
              Enviar Convite
            </button>
          </form>
          
          <div className="mt-8 p-4 bg-purple-500/10 rounded-xl border border-purple-500/20">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">Permissões do Papel</h3>
            <p className="text-xs text-gray-400">
              {role === 'Finance' && "Pode ver vendas e exportar relatórios financeiros, mas não edita eventos."}
              {role === 'Marketing' && "Cria links rastreáveis e vê conversão. Sem acesso ao financeiro."}
              {role === 'Portaria' && "Somente acesso ao app de check-in e lista de presença."}
              {role === 'Viewer' && "Acesso de leitura total, sem permissão para realizar alterações."}
              {role === 'Owner' && "Acesso total ao sistema, gerência de membros e faturamento."}
            </p>
          </div>
        </div>

        {/* Member List */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-800/50">
                  <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase">Membro</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase">Papel</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {members.map(member => (
                  <tr key={member.id} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-white">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        member.role === 'Owner' ? 'bg-amber-500/10 text-amber-500' :
                        member.role === 'Finance' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-purple-500/10 text-purple-500'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-2 text-sm ${
                        member.status === 'active' ? 'text-green-500' : 'text-amber-500'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          member.status === 'active' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'
                        }`}></span>
                        {member.status === 'active' ? 'Ativo' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {member.role !== 'Owner' && (
                        <button 
                          onClick={() => handleRevoke(member.id)}
                          className="text-red-400 hover:text-red-300 text-sm font-bold transition-colors"
                        >
                          Revogar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
