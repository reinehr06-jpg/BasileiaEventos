import { FastifyInstance } from "fastify";
import { getTenantConnection } from "../services/tenant.service";
import { randomUUID } from "crypto";

export default async function walletRoutes(server: FastifyInstance) {
  // Apple Wallet - Generate Pass
  server.get("/:ticketId/apple", {
    preHandler: [server.authenticate]
  }, async (request, reply) => {
    const { ticketId } = request.params as { ticketId: string };
    const user = request.user;
    
    const db = await getTenantConnection(user.accountId);
    try {
      // 1. Verify ticket exists
      const ticketRes = await db.query(
        \`SELECT t.*, e.title as event_title, e.start_date, tt.name as type_name
         FROM tickets t 
         JOIN ticket_types tt ON t.ticket_type_id = tt.id
         JOIN events e ON tt.event_id = e.id
         WHERE t.id = $1 AND t.user_id = $2\`,
        [ticketId, user.id]
      );
      
      if (ticketRes.rowCount === 0) {
        return reply.status(404).send({ error: "Ticket not found" });
      }
      
      const ticket = ticketRes.rows[0];
      
      // 2. Track in wallet_passes
      const passId = randomUUID();
      await db.query(
        \`INSERT INTO wallet_passes (id, ticket_id, pass_type, status)
         VALUES ($1, $2, $3, $4)\`,
        [passId, ticketId, 'apple', 'active']
      );
      
      // 3. MOCK: Generate .pkpass file
      // In a real app, we'd use passkit-generator:
      // const pass = new PKPass({...})
      // pass.primaryFields.add({ key: 'event', label: 'Event', value: ticket.event_title })
      // pass.barcode = { format: 'PKBarcodeFormatQR', message: ticket.qr_token }
      // const buffer = await pass.getAsBuffer();
      
      const mockPkpassBuffer = Buffer.from("MOCK_PKPASS_FILE_CONTENT_FOR_" + ticketId);
      
      reply.header('Content-Type', 'application/vnd.apple.pkpass');
      reply.header('Content-Disposition', \`attachment; filename="ticket-\${ticketId}.pkpass"\`);
      return reply.send(mockPkpassBuffer);
      
    } finally {
      await db.end();
    }
  });

  // Google Wallet - Generate Link
  server.post("/:ticketId/google", {
    preHandler: [server.authenticate]
  }, async (request, reply) => {
    const { ticketId } = request.params as { ticketId: string };
    const user = request.user;
    
    const db = await getTenantConnection(user.accountId);
    try {
      const ticketRes = await db.query(
        "SELECT * FROM tickets WHERE id = $1 AND user_id = $2",
        [ticketId, user.id]
      );
      
      if (ticketRes.rowCount === 0) {
        return reply.status(404).send({ error: "Ticket not found" });
      }
      
      const passId = randomUUID();
      await db.query(
        \`INSERT INTO wallet_passes (id, ticket_id, pass_type, status)
         VALUES ($1, $2, $3, $4)\`,
        [passId, ticketId, 'google', 'active']
      );
      
      // MOCK: Generate Google Wallet link using Google Wallet API
      const saveUrl = \`https://pay.google.com/gp/v/save/MOCK_JWT_FOR_TICKET_\${ticketId}\`;
      
      return reply.send({ url: saveUrl });
    } finally {
      await db.end();
    }
  });

  // Apple Wallet - APNs Registration (Webhook from Apple)
  server.post("/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber", async (request, reply) => {
    // Implement standard Apple Wallet registration endpoints
    const { deviceLibraryIdentifier, serialNumber } = request.params as any;
    const { pushToken } = request.body as any;
    
    // In a real app, we'd find the tenant based on the passTypeIdentifier
    // and update the wallet_passes table with the pushToken.
    
    return reply.status(200).send();
  });
}
