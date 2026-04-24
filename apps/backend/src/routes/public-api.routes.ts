import { FastifyInstance } from "fastify";
import { getTenantConnection } from "../services/tenant.service";

export default async function publicApiRoutes(server: FastifyInstance) {
  // Middleware to validate API Key (Mocked)
  server.addHook("preHandler", async (request, reply) => {
    const apiKey = request.headers["x-api-key"];
    if (!apiKey) {
      return reply.code(401).send({ error: "API Key missing" });
    }
    // In a real app, query Master DB to find Account by API Key
    (request as any).accountId = "test-account-id"; // Mock
  });

  // --- EVENTS ---
  server.get("/events", async (request) => {
    const accountId = (request as any).accountId;
    const db = await getTenantConnection(accountId);
    try {
      const res = await db.query("SELECT id, title, start_date, location FROM events WHERE status = 'active'");
      return res.rows;
    } finally {
      await db.end();
    }
  });

  server.get("/events/:id", async (request) => {
    const { id } = request.params as { id: string };
    const accountId = (request as any).accountId;
    const db = await getTenantConnection(accountId);
    try {
      const res = await db.query("SELECT * FROM events WHERE id = $1", [id]);
      return res.rows[0];
    } finally {
      await db.end();
    }
  });

  // --- TICKETS & CHECK-IN ---
  server.get("/events/:id/tickets", async (request) => {
    const { id } = request.params as { id: string };
    const accountId = (request as any).accountId;
    const db = await getTenantConnection(accountId);
    try {
      const res = await db.query(`
        SELECT t.id, t.status, tt.name as type, t.buyer_name 
        FROM tickets t 
        JOIN ticket_types tt ON t.ticket_type_id = tt.id 
        WHERE tt.event_id = $1
      `, [id]);
      return res.rows;
    } finally {
      await db.end();
    }
  });

  server.post("/checkin/validate", async (request) => {
    const { qrCode } = request.body as { qrCode: string };
    // Logic from checkin.routes
    return { success: true, message: "Acesso autorizado" };
  });

  // --- WAITLIST ---
  server.get("/events/:id/waitlist", async (request) => {
    const { id } = request.params as { id: string };
    const accountId = (request as any).accountId;
    const db = await getTenantConnection(accountId);
    try {
      const res = await db.query("SELECT id, name, email FROM waitlist WHERE event_id = $1", [id]);
      return res.rows;
    } finally {
      await db.end();
    }
  });
}
