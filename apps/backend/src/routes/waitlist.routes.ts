import { FastifyInstance } from "fastify";
import { tenantMiddleware } from "../middleware/tenant.middleware";
import redis from "../utils/redis";

export default async function waitlistRoutes(server: FastifyInstance) {
  server.addHook("preHandler", server.authenticate);
  server.addHook("preHandler", tenantMiddleware);

  // Join waitlist
  server.post("/join", async (request: any) => {
    const { eventId, ticketTypeId, name, email } = request.body;
    
    await request.tenantDb.query(
      "INSERT INTO waitlist (event_id, ticket_type_id, name, email) VALUES ($1, $2, $3, $4)",
      [eventId, ticketTypeId, name, email]
    );

    return { success: true, message: "Você entrou na fila de espera!" };
  });

  // Get waitlist stats for organizer
  server.get("/stats/:eventId", async (request: any) => {
    const res = await request.tenantDb.query(
      `SELECT tt.name as type_name, count(*) as total,
        count(CASE WHEN w.status = 'notified' THEN 1 END) as notified,
        count(CASE WHEN w.status = 'converted' THEN 1 END) as converted
       FROM waitlist w
       JOIN ticket_types tt ON w.ticket_type_id = tt.id
       WHERE w.event_id = $1
       GROUP BY tt.id, tt.name`,
      [request.params.eventId]
    );
    return res.rows;
  });

  // Manual Trigger: Notify next in line (Simulating automatic cancellation trigger)
  server.post("/notify-next", async (request: any) => {
    const { eventId, ticketTypeId } = request.body;
    
    const nextRes = await request.tenantDb.query(
      "SELECT * FROM waitlist WHERE event_id = $1 AND ticket_type_id = $2 AND status = 'waiting' ORDER BY created_at ASC LIMIT 1",
      [eventId, ticketTypeId]
    );
    
    const person = nextRes.rows[0];
    if (!person) return { success: false, message: "Ninguém na fila para este tipo." };

    const token = Math.random().toString(36).substr(2, 9);
    await redis.set(`waitlist_token:${token}`, person.id, "EX", 1800); // 30m TTL

    await request.tenantDb.query(
      "UPDATE waitlist SET status = 'notified', notified_at = NOW() WHERE id = $1",
      [person.id]
    );

    // In a real system, we'd send an email here
    return { 
      success: true, 
      message: `Notificação enviada para ${person.email}`,
      debug_link: `http://localhost:3000/checkout/${ticketTypeId}?w_token=${token}`
    };
  });
}
