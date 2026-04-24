import { FastifyInstance } from "fastify";

export default async function adminRoutes(server: FastifyInstance) {
  // Middleware to ensure user is Super Admin (Mocked)
  server.addHook("preHandler", async (request, reply) => {
    // In a real app, check user role in master DB
    // if (request.user.role !== 'super_admin') return reply.code(403).send({ error: 'Access denied' });
  });

  // --- WHITE-LABEL CLIENTS ---
  server.get("/white-label", async () => {
    // Mock list
    return [
      { id: "acc1", name: "Agência Premium", custom_domain: "eventos.premium.com", status: "active", billing: "R$ 5.000/mês" },
      { id: "acc2", name: "Festivais Brasil", custom_domain: "vendas.festivais.com.br", status: "active", billing: "R$ 8.000/mês" }
    ];
  });

  server.post("/white-label/:id/config", async (request) => {
    const { id } = request.params as { id: string };
    const { branding, domain } = request.body as any;
    
    // Update Master DB
    // await masterDb.query("UPDATE Account SET custom_domain = $1, branding_config = $2 WHERE id = $3", [domain, branding, id]);

    return { success: true };
  });

  // --- USAGE METRICS ---
  server.get("/white-label/stats", async () => {
    return {
      total_clients: 12,
      active_domains: 10,
      total_revenue_share: 45800.00
    };
  });
}
