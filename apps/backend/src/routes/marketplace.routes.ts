import { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";

export default async function marketplaceRoutes(server: FastifyInstance) {
  // --- SUPPLIER LISTING (Public) ---
  server.get("/suppliers", async (request) => {
    const { category, city } = request.query as { category?: string, city?: string };
    
    // Logic: Ouro > Prata > Bronze
    // Mock data
    return [
      { id: "s1", name: "Buffet Gourmet ✦", category: "Alimentação", plan: "gold", city: "São Paulo", rating: 4.9 },
      { id: "s2", name: "LED & Luz", category: "Audiovisual", plan: "silver", city: "São Paulo", rating: 4.7 },
      { id: "s3", name: "Cadeiras & Cia", category: "Mobiliário", plan: "bronze", city: "São Paulo", rating: 4.5 }
    ];
  });

  // --- SUPPLIER REGISTRATION ---
  server.post("/suppliers", async (request, reply) => {
    const data = request.body as any;
    const id = randomUUID();
    // await masterDb.query("INSERT INTO suppliers ...", [id, ...]);
    return { success: true, id };
  });

  // --- SUPPLIER ANALYTICS (Private) ---
  server.get("/suppliers/:id/stats", async (request) => {
    return {
      impressions: 1240,
      clicks: 85,
      leads: 12
    };
  });
}
