import { FastifyInstance } from "fastify";
import { BasileaSecureService } from "../services/secure.service";
import { tenantMiddleware } from "../middleware/tenant.middleware";

export default async function facialRoutes(server: FastifyInstance) {
  server.addHook("preHandler", server.authenticate);
  server.addHook("preHandler", tenantMiddleware);

  // Capture face for a ticket (User/Buyer flow)
  server.post("/capture", async (request: any) => {
    const { ticketId, imageBase64, eventId } = request.body;
    const service = new BasileaSecureService(request.tenantDb);
    return service.registerFace(eventId, ticketId, imageBase64);
  });

  // Identify face at Totem (Portaria flow)
  server.post("/identify", async (request: any) => {
    const { eventId, imageBase64 } = request.body;
    const service = new BasileaSecureService(request.tenantDb);
    return service.identify(eventId, imageBase64);
  });

  // Get ticket facial status
  server.get("/status/:ticketId", async (request: any) => {
    const res = await request.tenantDb.query(
      "SELECT facial_status, face_id FROM tickets WHERE id = $1",
      [request.params.ticketId]
    );
    return res.rows[0];
  });
}
