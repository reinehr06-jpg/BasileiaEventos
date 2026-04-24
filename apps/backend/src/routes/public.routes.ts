import { FastifyInstance } from "fastify";
import { getTenantConnection } from "../services/tenant.service";

export default async function publicRoutes(server: FastifyInstance) {
  
  // Track pixel event
  server.post("/track", async (request: any) => {
    const { trackingId, eventType, orderId, metadata, tenantId } = request.body;
    
    if (!tenantId) return { error: "Missing tenantId" };

    const tenantDb = await getTenantConnection(tenantId);
    await tenantDb.connect();
    
    try {
      await tenantDb.query(
        "INSERT INTO tracking_events (tracking_link_id, event_type, order_id, metadata, ip, user_agent) VALUES ($1, $2, $3, $4, $5, $6)",
        [trackingId, eventType, orderId, JSON.stringify(metadata), request.ip, request.headers["user-agent"]]
      );
      
      // If purchase, update the order with trackingId
      if (eventType === 'purchase' && orderId) {
        await tenantDb.query(
          "UPDATE orders SET tracking_id = $1 WHERE id = $2",
          [trackingId, orderId]
        );
      }

      return { success: true };
    } finally {
      await tenantDb.end();
    }
  });

  // Get event data for widget
  server.get("/widget/:tenantId/events/:eventId", async (request: any) => {
    const { tenantId, eventId } = request.params;
    const tenantDb = await getTenantConnection(tenantId);
    await tenantDb.connect();

    try {
      const eventRes = await tenantDb.query("SELECT * FROM events WHERE id = $1", [eventId]);
      const typesRes = await tenantDb.query(
        "SELECT id, name, price, quantity FROM ticket_types WHERE event_id = $1",
        [eventId]
      );
      
      return {
        event: eventRes.rows[0],
        ticketTypes: typesRes.rows
      };
    } finally {
      await tenantDb.end();
    }
  });
}
