import { FastifyInstance } from "fastify";
import { tenantMiddleware } from "../middleware/tenant.middleware";
import { v4 as uuidv4 } from "uuid";

export default async function trackingRoutes(server: FastifyInstance) {
  server.addHook("preHandler", server.authenticate);
  server.addHook("preHandler", tenantMiddleware);

  // Create tracking link
  server.post("/links", async (request: any) => {
    const { eventId, name, utm_source, utm_medium, utm_campaign, utm_content } = request.body;
    const id = uuidv4();
    
    await request.tenantDb.query(
      "INSERT INTO tracking_links (id, event_id, name, utm_source, utm_medium, utm_campaign, utm_content) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [id, eventId, name, utm_source, utm_medium, utm_campaign, utm_content]
    );

    return { id, success: true };
  });

  // List tracking links for an event
  server.get("/links/:eventId", async (request: any) => {
    const res = await request.tenantDb.query(
      `SELECT tl.*, 
        (SELECT count(*) FROM tracking_events WHERE tracking_link_id = tl.id AND event_type = 'view') as views,
        (SELECT count(*) FROM tracking_events WHERE tracking_link_id = tl.id AND event_type = 'purchase') as sales,
        (SELECT COALESCE(sum(total), 0) FROM orders WHERE tracking_id = tl.id AND status = 'paid') as revenue
       FROM tracking_links tl WHERE event_id = $1`,
      [request.params.eventId]
    );
    return res.rows;
  });

  // Get funnel data for an event
  server.get("/funnel/:eventId", async (request: any) => {
    const res = await request.tenantDb.query(
      `SELECT 
        (SELECT count(*) FROM tracking_events te JOIN tracking_links tl ON te.tracking_link_id = tl.id WHERE tl.event_id = $1 AND te.event_type = 'view') as views,
        (SELECT count(*) FROM tracking_events te JOIN tracking_links tl ON te.tracking_link_id = tl.id WHERE tl.event_id = $1 AND te.event_type = 'checkout_start') as checkouts,
        (SELECT count(*) FROM tracking_events te JOIN tracking_links tl ON te.tracking_link_id = tl.id WHERE tl.event_id = $1 AND te.event_type = 'purchase') as purchases
      `,
      [request.params.eventId]
    );
    return res.rows[0];
  });
}
