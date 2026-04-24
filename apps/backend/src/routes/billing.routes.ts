import { FastifyInstance } from "fastify";
import { getTenantConnection } from "../services/tenant.service";

export default async function billingRoutes(server: FastifyInstance) {
  // --- PLANS & UPGRADES ---
  server.get("/plans", async () => {
    return [
      { id: "free", name: "Free", price: 0, ticket_limit: 100, features: ["basic_analytics", "public_profile"] },
      { id: "pro", name: "Pro", price: 149, ticket_limit: 1000, features: ["ai_builder", "facial_recognition", "advanced_analytics"] },
      { id: "enterprise", name: "Enterprise", price: 499, ticket_limit: 10000, features: ["all"] }
    ];
  });

  server.post("/upgrade", { preHandler: [server.authenticate] }, async (request, reply) => {
    const { planId } = request.body as { planId: string };
    const user = request.user;
    
    // In a real app, this would trigger a payment session (Asaas/Stripe)
    // For now, mock update in Master DB
    // await masterDb.query("UPDATE Account SET plan_id = $1 WHERE id = $2", [planId, user.accountId]);

    return { success: true, message: `Plano atualizado para ${planId}` };
  });

  // --- CONVENIENCE FEE CONFIG ---
  server.post("/events/:eventId/fees", { preHandler: [server.authenticate] }, async (request, reply) => {
    const { eventId } = request.params as { eventId: string };
    const { mode, percentage, fixed } = request.body as { mode: string, percentage: number, fixed: number };
    const user = request.user;

    const db = await getTenantConnection(user.accountId);
    try {
      await db.query(
        "UPDATE events SET fee_config = $1 WHERE id = $2",
        [JSON.stringify({ mode, percentage, fixed }), eventId]
      );
      return { success: true };
    } finally {
      await db.end();
    }
  });

  // Helper to calculate fees for checkout
  server.post("/calculate-checkout", async (request) => {
    const { eventId, subtotal } = request.body as { eventId: string, subtotal: number };
    // This would be called by the frontend during checkout
    // Mocking logic:
    const fee = subtotal * 0.1; // 10%
    return { subtotal, fee, total: subtotal + fee };
  });
}
