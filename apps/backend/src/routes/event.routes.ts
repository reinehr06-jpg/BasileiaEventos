import { FastifyInstance } from "fastify";
import { EventService } from "../services/event.service";
import { tenantMiddleware } from "../middleware/tenant.middleware";
import { v4 as uuidv4 } from "uuid";

export default async function eventRoutes(server: FastifyInstance) {
  server.addHook("preHandler", server.authenticate);
  server.addHook("preHandler", tenantMiddleware);

  server.get("/", async (request) => {
    const service = new EventService(request.tenantDb);
    return service.list();
  });

  server.get("/:id", async (request: any) => {
    const service = new EventService(request.tenantDb);
    return service.findById(request.params.id);
  });

  server.post("/", async (request: any) => {
    const service = new EventService(request.tenantDb);
    return service.create(request.body);
  });

  server.put("/:id", async (request: any) => {
    const service = new EventService(request.tenantDb);
    return service.update(request.params.id, request.body);
  });

  server.delete("/:id", async (request: any) => {
    const service = new EventService(request.tenantDb);
    await service.delete(request.params.id);
    return { success: true };
  });

  server.post("/:id/duplicate", async (request: any) => {
    const service = new EventService(request.tenantDb);
    return service.duplicate(request.params.id);
  });

  // Zones
  server.get("/:id/zones", async (request: any) => {
    const res = await request.tenantDb.query("SELECT * FROM access_zones WHERE event_id = $1", [request.params.id]);
    return res.rows;
  });

  server.post("/:id/zones", async (request: any) => {
    const { name, description } = request.body;
    const id = uuidv4();
    const res = await request.tenantDb.query(
      "INSERT INTO access_zones (id, event_id, name, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [id, request.params.id, name, description]
    );
    return res.rows[0];
  });
}
