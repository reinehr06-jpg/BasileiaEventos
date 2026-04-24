import { FastifyInstance } from "fastify";
import { tenantMiddleware } from "../middleware/tenant.middleware";
import { v4 as uuidv4 } from "uuid";

export default async function aiRoutes(server: FastifyInstance) {
  // Public Chatbot Route (No auth needed, just tenant DB access)
  server.post("/chatbot/message", async (request: any) => {
    const { eventId, visitorId, message } = request.body;
    
    // Simulate fetching event context
    const eventRes = await request.tenantDb?.query("SELECT * FROM events WHERE id = $1", [eventId]);
    const event = eventRes?.rows[0];

    if (!event) return { reply: "Evento não encontrado." };

    // Here we would call OpenAI with a system prompt like:
    // "Você é o assistente virtual do evento ${event.title}. Responda dúvidas para incentivar a compra."
    // For now, mock the response:
    let reply = `Olá! Sou o assistente do evento ${event.title}. `;
    if (message.toLowerCase().includes("preço") || message.toLowerCase().includes("valor")) {
      reply += "Os ingressos estão a partir de R$ 80,00 no lote atual. Deseja garantir o seu?";
    } else {
      reply += "Como posso te ajudar a garantir seu ingresso hoje?";
    }

    // Save to conversation history
    const convId = uuidv4();
    await request.tenantDb?.query(
      `INSERT INTO chatbot_conversations (id, event_id, visitor_id, history) 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET history = chatbot_conversations.history || $4::jsonb`,
      [convId, eventId, visitorId, JSON.stringify([{ role: "user", content: message }, { role: "assistant", content: reply }])]
    );

    return { reply };
  });

  // Protected Routes below
  server.register(async function(protectedRoutes) {
    protectedRoutes.addHook("preHandler", server.authenticate);
    protectedRoutes.addHook("preHandler", tenantMiddleware);

    // Pricing AI: Trigger manual analysis
    protectedRoutes.post("/pricing/analyze/:eventId", async (request: any) => {
      const { eventId } = request.params;
      
      // Simulating AI analysis of sales velocity
      // E.g., checking if 1st batch is 80% sold out and suggesting 2nd batch pricing
      const id = Math.floor(Math.random() * 1000);
      
      await request.tenantDb.query(
        "INSERT INTO pricing_suggestions (id, event_id, ticket_lot_id, suggested_price, reason) VALUES ($1, $2, NULL, $3, $4)",
        [id, eventId, 120.00, "Velocidade de vendas alta nas últimas 2h. Sugestão: abrir 2º lote."]
      );

      return { success: true, message: "Análise concluída. Verifique as sugestões." };
    });

    // Get suggestions
    protectedRoutes.get("/pricing/suggestions/:eventId", async (request: any) => {
      const res = await request.tenantDb.query(
        "SELECT * FROM pricing_suggestions WHERE event_id = $1 ORDER BY created_at DESC",
        [request.params.eventId]
      );
      return res.rows;
    });

    // A/B Test Management
    protectedRoutes.post("/abtest/start", async (request: any) => {
      const { ticketTypeId, priceA, priceB } = request.body;
      const testId = uuidv4();
      
      await request.tenantDb.query(
        "INSERT INTO ab_tests (id, ticket_type_id) VALUES ($1, $2)",
        [testId, ticketTypeId]
      );

      await request.tenantDb.query(
        "INSERT INTO ab_test_variants (id, test_id, name, price) VALUES ($1, $2, 'A', $3), ($4, $2, 'B', $5)",
        [uuidv4(), testId, priceA, uuidv4(), priceB]
      );

      return { success: true, testId };
    });

    protectedRoutes.get("/abtest/:testId/results", async (request: any) => {
      const res = await request.tenantDb.query(
        "SELECT * FROM ab_test_variants WHERE test_id = $1",
        [request.params.testId]
      );
      return res.rows;
    });
  });
}
