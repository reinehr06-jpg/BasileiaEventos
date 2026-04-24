import { FastifyInstance } from "fastify";
import { TicketService } from "../services/ticket.service";
import { tenantMiddleware } from "../middleware/tenant.middleware";
import { v4 as uuidv4 } from "uuid";
import redis from "../utils/redis";

export default async function ticketRoutes(server: FastifyInstance) {
  server.addHook("preHandler", server.authenticate);
  server.addHook("preHandler", tenantMiddleware);

  server.get("/events/:eventId/types", async (request: any) => {
    const service = new TicketService(request.tenantDb);
    return service.listTypes(request.params.eventId);
  });

  server.post("/types", async (request: any) => {
    const service = new TicketService(request.tenantDb);
    return service.createType(request.body);
  });

  server.get("/types/:typeId/lots", async (request: any) => {
    const service = new TicketService(request.tenantDb);
    return service.listLots(request.params.typeId);
  });

  server.post("/lots", async (request: any) => {
    const service = new TicketService(request.tenantDb);
    return service.createLot(request.body);
  });

  server.post("/validate", async (request: any, reply) => {
    const { token, deviceFingerprint, geolocation } = request.body;
    const ip = request.ip;
    
    const ticketId = await redis.get(`qr:${token}`);
    if (!ticketId) {
      return reply.status(404).send({ error: "Invalid or expired token", status: "invalid" });
    }

    // 1. Get Ticket Data
    const ticketRes = await request.tenantDb.query(
      `SELECT t.*, tt.name as type_name, e.title as event_title 
       FROM tickets t 
       JOIN ticket_types tt ON t.ticket_type_id = tt.id 
       JOIN events e ON tt.event_id = e.id 
       WHERE t.id = $1`, 
      [ticketId]
    );
    const ticket = ticketRes.rows[0];

    // 2. Check if already used
    const lastCheckinRes = await request.tenantDb.query(
      "SELECT * FROM checkin_logs WHERE ticket_id = $1 AND status = 'valid' ORDER BY created_at DESC LIMIT 1",
      [ticketId]
    );
    
    if (lastCheckinRes.rows.length > 0) {
      await request.tenantDb.query(
        "INSERT INTO checkin_logs (ticket_id, status, device_fingerprint, ip, geolocation) VALUES ($1, $2, $3, $4, $5)",
        [ticketId, "already_used", deviceFingerprint, ip, JSON.stringify(geolocation)]
      );
      return { 
        status: "already_used", 
        usedAt: lastCheckinRes.rows[0].created_at,
        ticket 
      };
    }

    // 3. Get Allowed Zones
    const zonesRes = await request.tenantDb.query(
      `SELECT az.name FROM access_zones az 
       JOIN ticket_type_zones ttz ON az.id = ttz.access_zone_id 
       WHERE ttz.ticket_type_id = $1`,
      [ticket.ticket_type_id]
    );
    const zones = zonesRes.rows.map((z: any) => z.name);

    // 4. Log Valid Check-in
    await request.tenantDb.query(
      "INSERT INTO checkin_logs (ticket_id, status, device_fingerprint, ip, geolocation) VALUES ($1, $2, $3, $4, $5)",
      [ticketId, "valid", deviceFingerprint, ip, JSON.stringify(geolocation)]
    );

    return { 
      status: "valid", 
      ticket, 
      allowed_zones: zones 
    };
  });

  server.post("/types/:typeId/zones/:zoneId", async (request: any) => {
    const { typeId, zoneId } = request.params;
    const exists = await request.tenantDb.query(
      "SELECT 1 FROM ticket_type_zones WHERE ticket_type_id = $1 AND access_zone_id = $2",
      [typeId, zoneId]
    );

    if (exists.rows.length > 0) {
      await request.tenantDb.query(
        "DELETE FROM ticket_type_zones WHERE ticket_type_id = $1 AND access_zone_id = $2",
        [typeId, zoneId]
      );
      return { linked: false };
    } else {
      await request.tenantDb.query(
        "INSERT INTO ticket_type_zones (ticket_type_id, access_zone_id) VALUES ($1, $2)",
        [typeId, zoneId]
      );
      return { linked: true };
    }
  });
}
