import { FastifyInstance } from "fastify";
import { tenantMiddleware } from "../middleware/tenant.middleware";
import { v4 as uuidv4 } from "uuid";

export default async function planningRoutes(server: FastifyInstance) {
  server.addHook("preHandler", server.authenticate);
  server.addHook("preHandler", tenantMiddleware);

  // AI Suggestion Route (Mocking OpenAI + Google Places)
  server.post("/suggest", async (request: any) => {
    const { prompt, location } = request.body;
    
    // Simulate AI processing
    const needs = [
      { category: "Mobiliário", items: ["Cadeiras", "Mesas"] },
      { category: "Alimentação", items: ["Buffet", "Bebidas"] }
    ];

    // Simulate Google Places search
    const suggestions = [
      { name: "LocaEventos S.A.", category: "Mobiliário", contact: "+55 11 99999-9999", rating: 4.8, sponsored: true },
      { name: "Buffet Delícia", category: "Alimentação", contact: "+55 11 88888-8888", rating: 4.5, sponsored: false },
      { name: "Som & Luz Pro", category: "Audiovisual", contact: "+55 11 77777-7777", rating: 4.9, sponsored: true }
    ];

    return { needs, suggestions };
  });

  // Confirm supplier
  server.post("/suppliers", async (request: any) => {
    const { eventId, name, category, contactInfo, estimatedAmount } = request.body;
    const id = uuidv4();
    
    await request.tenantDb.query(
      "INSERT INTO event_suppliers (id, event_id, name, category, contact_info, estimated_amount) VALUES ($1, $2, $3, $4, $5, $6)",
      [id, eventId, name, category, contactInfo, estimatedAmount]
    );

    return { id, success: true };
  });

  // List suppliers for event
  server.get("/suppliers/:eventId", async (request: any) => {
    const res = await request.tenantDb.query(
      "SELECT * FROM event_suppliers WHERE event_id = $1",
      [request.params.eventId]
    );
    return res.rows;
  });

  // Financial Summary
  server.get("/finance/:eventId", async (request: any) => {
    const { eventId } = request.params;
    
    const revenueRes = await request.tenantDb.query(
      "SELECT SUM(total) as gross FROM orders WHERE event_id = $1 AND status = 'paid'",
      [eventId]
    );
    
    const costRes = await request.tenantDb.query(
      "SELECT SUM(actual_amount) as total_costs FROM event_suppliers WHERE event_id = $1",
      [eventId]
    );

    const gross = parseFloat(revenueRes.rows[0].gross || 0);
    const platformFees = gross * 0.05; // 5% fee
    const costs = parseFloat(costRes.rows[0].total_costs || 0);

    return {
      gross_revenue: gross,
      platform_fees: platformFees,
      net_revenue: gross - platformFees,
      total_costs: costs,
      estimated_profit: (gross - platformFees) - costs
    };
  });

  // Export to BasileaFinance
  server.post("/finance/:eventId/export", async (request: any) => {
    const { eventId } = request.params;
    // Simulate API call to BasileaFinance
    console.log(`[BasileaFinance] Exporting event ${eventId} data...`);
    
    return { success: true, transactionId: uuidv4(), exportedAt: new Date() };
  });
}
