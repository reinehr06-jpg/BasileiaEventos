import { FastifyInstance } from "fastify";
import { getTenantConnection } from "../services/tenant.service";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { prisma } from "../server";
import { TicketGenService } from "../services/ticket-gen.service";
import redis from "../utils/redis";

export default async function webhookRoutes(server: FastifyInstance) {
  server.post("/payment/:accountId", async (request: any, reply) => {
    const { accountId } = request.params;
    const payload = request.body;

    // 1. Identify Tenant
    const account = await prisma.account.findUnique({ where: { id: accountId } });
    if (!account) return reply.status(404).send({ error: "Account not found" });

    const tenantDb = await getTenantConnection(account.dbName);
    await tenantDb.connect();

    try {
      // 2. HMAC Validation (Placeholder)
      const signature = request.headers["x-webhook-signature"];
      if (!signature) return reply.status(401).send({ error: "Missing signature" });
      // In production: verify HMAC(payload, process.env.WEBHOOK_SECRET) == signature

      // 3. Idempotency Check
      const existingOrder = await tenantDb.query("SELECT id FROM orders WHERE external_id = $1", [payload.order_id]);
      if (existingOrder.rows.length > 0) return { success: true, message: "Already processed" };

      // 4. Create Order
      const orderId = uuidv4();
      await tenantDb.query(
        `INSERT INTO orders (id, external_id, event_id, status, total, buyer_name, buyer_email, buyer_phone, buyer_document, payment_method, paid_at) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          orderId, payload.order_id, payload.event_id || payload.items[0].event_id, 
          'paid', payload.total_amount, payload.buyer.name, payload.buyer.email, 
          payload.buyer.phone, payload.buyer.document, payload.payment_method, payload.paid_at
        ]
      );

      // 5. Create Tickets & Update Lots
      const ticketGen = new TicketGenService();
      for (const item of payload.items) {
        for (let i = 0; i < item.quantity; i++) {
          const ticketId = uuidv4();
          const code = crypto.randomBytes(4).toString("hex").toUpperCase();
          const qrToken = crypto.randomBytes(16).toString("hex");

          await redis.set(`qr:${qrToken}`, ticketId, "EX", 30);

          await tenantDb.query(
            "INSERT INTO tickets (id, order_id, ticket_type_id, lot_id, code, qr_token, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            [ticketId, orderId, item.ticket_type_id, item.lot_id, code, qrToken, 'paid']
          );
        }

        // 6. Automatic Lot Opening
        const lotRes = await tenantDb.query("UPDATE ticket_lots SET sold = sold + $1 WHERE id = $2 RETURNING *", [item.quantity, item.lot_id]);
        const lot = lotRes.rows[0];

        if (lot.sold >= (lot.quantity * lot.auto_open_at_percent) / 100) {
          // Find next lot for this type and activate it
          await tenantDb.query(
            "UPDATE ticket_lots SET active = true WHERE ticket_type_id = $1 AND active = false ORDER BY created_at ASC LIMIT 1",
            [lot.ticket_type_id]
          );
          console.log(`Auto-opened next lot for type ${lot.ticket_type_id}`);
        }
      }

      return { success: true };
    } catch (err: any) {
      server.log.error(err);
      return reply.status(500).send({ error: "Internal Server Error" });
    } finally {
      await tenantDb.end();
    }
  });
}
