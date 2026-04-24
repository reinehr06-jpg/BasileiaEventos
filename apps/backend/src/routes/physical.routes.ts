import { FastifyInstance } from "fastify";
import { tenantMiddleware } from "../middleware/tenant.middleware";
import { v4 as uuidv4 } from "uuid";

export default async function physicalRoutes(server: FastifyInstance) {
  server.addHook("preHandler", server.authenticate);
  server.addHook("preHandler", tenantMiddleware);

  // List physical products for an event
  server.get("/products/:eventId", async (request: any) => {
    const res = await request.tenantDb.query(
      "SELECT * FROM physical_products WHERE event_id = $1",
      [request.params.eventId]
    );
    return res.rows;
  });

  // Create physical product
  server.post("/products", async (request: any) => {
    const { eventId, name, sku, weight_kg, fulfillment_provider, fulfillment_config } = request.body;
    const id = uuidv4();
    
    await request.tenantDb.query(
      "INSERT INTO physical_products (id, event_id, name, sku, weight_kg, fulfillment_provider, fulfillment_config) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [id, eventId, name, sku, weight_kg, fulfillment_provider, JSON.stringify(fulfillment_config)]
    );

    return { id, success: true };
  });

  // Link product to ticket type
  server.post("/types/:typeId/link/:productId", async (request: any) => {
    const { typeId, productId } = request.params;
    await request.tenantDb.query(
      "UPDATE ticket_types SET physical_product_id = $1 WHERE id = $2",
      [productId, typeId]
    );
    return { success: true };
  });

  // List shipping orders
  server.get("/shipping/:eventId", async (request: any) => {
    const res = await request.tenantDb.query(
      `SELECT os.*, pp.name as product_name, o.buyer_name, o.buyer_email
       FROM order_shipping os
       JOIN physical_products pp ON os.physical_product_id = pp.id
       JOIN orders o ON os.order_id = o.id
       WHERE pp.event_id = $1
       ORDER BY os.updated_at DESC`,
      [request.params.eventId]
    );
    return res.rows;
  });

  // Manual fulfillment trigger
  server.post("/shipping/:shippingId/retry", async (request: any) => {
    const { shippingId } = request.params;
    // Lógica para re-disparar fulfillment (simulado)
    await request.tenantDb.query(
      "UPDATE order_shipping SET status = 'pending', error_message = NULL WHERE id = $1",
      [shippingId]
    );
    return { success: true };
  });
}
