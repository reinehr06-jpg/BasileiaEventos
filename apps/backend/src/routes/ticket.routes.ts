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
  server.get("/by-token/:token", async (request: any) => {
    const service = new TicketService(request.tenantDb);
    const res = await request.tenantDb.query(
      "SELECT t.*, e.title as event_title, e.facial_enabled FROM tickets t JOIN ticket_types tt ON t.ticket_type_id = tt.id JOIN events e ON tt.event_id = e.id WHERE t.qr_token = $1",
      [request.params.token]
    );
    return res.rows[0];
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

    // 2. Check if already used + Fraud detection (<60s double scan)
    const lastCheckinRes = await request.tenantDb.query(
      "SELECT * FROM checkin_logs WHERE ticket_id = $1 ORDER BY created_at DESC LIMIT 1",
      [ticketId]
    );
    
    const lastCheckin = lastCheckinRes.rows[0];
    if (lastCheckin) {
      const timeDiff = (Date.now() - new Date(lastCheckin.created_at).getTime()) / 1000;
      
      // If scanned in last 60s from different device/IP -> FRAUD ALERT
      if (timeDiff < 60 && (lastCheckin.device_fingerprint !== deviceFingerprint || lastCheckin.ip !== ip)) {
        const message = "ALERTA DE FRAUDE: Reuso imediato em dispositivo diferente!";
        await request.tenantDb.query(
          "INSERT INTO checkin_logs (ticket_id, status, device_fingerprint, ip, geolocation, user_id, message) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [ticketId, "fraud", deviceFingerprint, ip, JSON.stringify(geolocation), request.user.id, message]
        );
        return reply.status(403).send({ 
          status: "fraud", 
          message,
          ticket 
        });
      }

      if (lastCheckin.status === 'valid') {
        await request.tenantDb.query(
          "INSERT INTO checkin_logs (ticket_id, status, device_fingerprint, ip, geolocation, user_id) VALUES ($1, $2, $3, $4, $5, $6)",
          [ticketId, "already_used", deviceFingerprint, ip, JSON.stringify(geolocation), request.user.id]
        );
        return { 
          status: "already_used", 
          usedAt: lastCheckin.created_at,
          ticket 
        };
      }
    }

    // 3. Get Allowed Zones
    const zonesRes = await request.tenantDb.query(
      `SELECT az.id, az.name FROM access_zones az 
       JOIN ticket_type_zones ttz ON az.id = ttz.access_zone_id 
       WHERE ttz.ticket_type_id = $1`,
      [ticket.ticket_type_id]
    );
    const zones = zonesRes.rows.map((z: any) => z.name);
    const zoneIds = zonesRes.rows.map((z: any) => z.id);

    // 4. Porteiro Zone Restriction Check
    // If the scanning user is a porteiro restricted to a zone, they can only validate tickets allowed in that zone
    const currentUserRes = await request.tenantDb.query("SELECT role, restricted_zone_id FROM users WHERE id = $1", [request.user.id]);
    const currentUser = currentUserRes.rows[0];
    
    if (currentUser?.role === 'porteiro' && currentUser.restricted_zone_id) {
      if (!zoneIds.includes(currentUser.restricted_zone_id)) {
        return reply.status(403).send({
          status: "denied",
          message: "ACESSO NEGADO: Este ingresso não dá acesso a esta zona.",
          ticket
        });
      }
    }

    // 5. Log Valid Check-in
    await request.tenantDb.query(
      "INSERT INTO checkin_logs (ticket_id, status, device_fingerprint, ip, geolocation, user_id) VALUES ($1, $2, $3, $4, $5, $6)",
      [ticketId, "valid", deviceFingerprint, ip, JSON.stringify(geolocation), request.user.id]
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
  server.post("/:ticketId/transfer", async (request: any) => {
    const { ticketId } = request.params;
    const { newUserId } = request.body;
    
    // 1. Update ticket ownership and reset facial data
    await request.tenantDb.query(
      "UPDATE tickets SET user_id = $1, face_id = NULL, facial_status = 'pending' WHERE id = $2",
      [newUserId, ticketId]
    );

    return { success: true, message: "Ingresso transferido. Novo titular deve realizar cadastro facial." };
  });
}
