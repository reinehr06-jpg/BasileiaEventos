import { FastifyInstance } from "fastify";
import { tenantMiddleware } from "../middleware/tenant.middleware";
import { v4 as uuidv4 } from "uuid";

export default async function checkinRoutes(server: FastifyInstance) {
  server.addHook("preHandler", server.authenticate);
  server.addHook("preHandler", tenantMiddleware);

  // Sync valid tickets for offline use
  server.get("/sync/:eventId", async (request: any) => {
    const { eventId } = request.params;
    const res = await request.tenantDb.query(
      `SELECT t.id, t.code, tt.name as type_name, 
        (SELECT array_agg(az.name) FROM access_zones az 
         JOIN ticket_type_zones ttz ON az.id = ttz.access_zone_id 
         WHERE ttz.ticket_type_id = tt.id) as allowed_zones
       FROM tickets t 
       JOIN ticket_types tt ON t.ticket_type_id = tt.id 
       WHERE tt.event_id = $1 AND t.status = 'paid'`,
      [eventId]
    );
    return res.rows;
  });

  // Upload offline check-in logs
  server.post("/sync", async (request: any) => {
    const { logs } = request.body; // Array of { ticketId, status, deviceFingerprint, ip, geolocation, createdAt }
    
    for (const log of logs) {
      // Idempotency: skip if log already exists with same ticketId and timestamp
      await request.tenantDb.query(
        "INSERT INTO checkin_logs (ticket_id, status, device_fingerprint, ip, geolocation, created_at) VALUES ($1, $2, $3, $4, $5, $6)",
        [log.ticketId, log.status, log.deviceFingerprint, log.ip, JSON.stringify(log.geolocation), log.createdAt]
      );
    }
    
    return { success: true, count: logs.length };
  });

  // Portaria Dashboard Stats
  server.get("/stats/:eventId", async (request: any) => {
    const { eventId } = request.params;
    
    const stats = await request.tenantDb.query(
      `SELECT 
        (SELECT count(*) FROM checkin_logs cl 
         JOIN tickets t ON cl.ticket_id = t.id 
         JOIN ticket_types tt ON t.ticket_type_id = tt.id 
         WHERE tt.event_id = $1 AND cl.status = 'valid') as entries,
        (SELECT count(*) FROM tickets t 
         JOIN ticket_types tt ON t.ticket_type_id = tt.id 
         WHERE tt.event_id = $1) as total_capacity
      `,
      [eventId]
    );

    const recentEntries = await request.tenantDb.query(
      `SELECT cl.created_at, cl.status, t.code, tt.name as type_name
       FROM checkin_logs cl
       JOIN tickets t ON cl.ticket_id = t.id
       JOIN ticket_types tt ON t.ticket_type_id = tt.id
       WHERE tt.event_id = $1
       ORDER BY cl.created_at DESC LIMIT 10`,
      [eventId]
    );

    return {
      stats: stats.rows[0],
      recentEntries: recentEntries.rows
    };
  });
}
