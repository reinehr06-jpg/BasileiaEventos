import { FastifyInstance } from "fastify";
import { tenantMiddleware } from "../middleware/tenant.middleware";
import redis from "../utils/redis";
import { v4 as uuidv4 } from "uuid";

export default async function seatRoutes(server: FastifyInstance) {
  server.addHook("preHandler", server.authenticate);
  server.addHook("preHandler", tenantMiddleware);

  // List all seats for an event
  server.get("/events/:eventId", async (request: any) => {
    const { eventId } = request.params;
    const res = await request.tenantDb.query(
      "SELECT * FROM seats WHERE event_id = $1 ORDER BY label",
      [eventId]
    );
    
    // Check Redis for temporary reservations
    const seats = await Promise.all(res.rows.map(async (seat: any) => {
      const isReserved = await redis.get(`seat_reserve:${seat.id}`);
      if (isReserved && seat.status === 'available') {
        return { ...seat, status: 'reserved' };
      }
      return seat;
    }));

    return seats;
  });

  // Reserve a seat temporarily (10m TTL)
  server.post("/reserve", async (request: any, reply) => {
    const { seatId, userId } = request.body;
    
    // 1. Atomic check and set in Redis
    const lockKey = `seat_reserve:${seatId}`;
    const success = await redis.set(lockKey, userId || "anonymous", "EX", 600, "NX");
    
    if (!success) {
      return reply.status(409).send({ error: "Assento já reservado por outro usuário." });
    }

    return { success: true, expiresAt: Date.now() + 600000 };
  });

  // Bulk create seats (for map editor)
  server.post("/bulk", async (request: any) => {
    const { eventId, seats } = request.body;
    
    for (const seat of seats) {
      const id = uuidv4();
      await request.tenantDb.query(
        "INSERT INTO seats (id, event_id, ticket_type_id, label, x, y, radius) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [id, eventId, seat.ticketTypeId, seat.label, seat.x, seat.y, seat.radius]
      );
    }

    return { success: true, count: seats.length };
  });
}
