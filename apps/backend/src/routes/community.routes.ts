import { FastifyInstance } from "fastify";
import { getTenantConnection } from "../services/tenant.service";
import { randomUUID, randomBytes } from "crypto";

export default async function communityRoutes(server: FastifyInstance) {
  // --- CO-ORGANIZATION ---
  server.post("/invites", { preHandler: [server.authenticate] }, async (request, reply) => {
    const { email, role } = request.body as { email: string, role: string };
    const user = request.user;

    if (user.role !== 'admin' && user.role !== 'owner') {
      return reply.status(403).send({ error: "Only owners can invite members" });
    }

    const db = await getTenantConnection(user.accountId);
    try {
      const inviteId = randomUUID();
      const token = randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      await db.query(
        "INSERT INTO invites (id, email, role, token, expires_at) VALUES ($1, $2, $3, $4, $5)",
        [inviteId, email, role, token, expiresAt]
      );

      // Mock email sending
      console.log(`Invite sent to ${email} with token ${token}`);

      return { success: true, inviteId };
    } finally {
      await db.end();
    }
  });

  // --- PUBLIC PROFILES ---
  server.get("/profile/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    // This is tricky in multi-tenant if we don't know the accountId from the slug.
    // In a real app, we'd have a global lookup table: slug -> accountId.
    // For now, we'll assume the accountId is passed in a header or we search all (bad performance).
    // Mocking for a specific tenant for demo:
    const db = await getTenantConnection("tenant_admin"); 
    try {
      const profileRes = await db.query("SELECT * FROM organizer_profiles WHERE slug = $1", [slug]);
      if (profileRes.rowCount === 0) return reply.status(404).send({ error: "Profile not found" });

      const profile = profileRes.rows[0];
      const eventsRes = await db.query("SELECT * FROM events WHERE status = 'active' LIMIT 10");
      const reviewsRes = await db.query("SELECT * FROM event_reviews WHERE rating >= 4 LIMIT 5");

      return { profile, events: eventsRes.rows, recentReviews: reviewsRes.rows };
    } finally {
      await db.end();
    }
  });

  // --- REVIEWS ---
  server.post("/reviews", { preHandler: [server.authenticate] }, async (request, reply) => {
    const { eventId, rating, comment } = request.body as { eventId: string, rating: number, comment: string };
    const user = request.user;

    const db = await getTenantConnection(user.accountId);
    try {
      // Verify check-in
      const checkinRes = await db.query(
        "SELECT * FROM checkin_logs cl JOIN tickets t ON cl.ticket_id = t.id WHERE t.event_id = $1 AND t.user_id = $2 AND cl.status = 'valid'",
        [eventId, user.id]
      );

      if (checkinRes.rowCount === 0) {
        return reply.status(403).send({ error: "Only participants who checked in can leave a review" });
      }

      const reviewId = randomUUID();
      await db.query(
        "INSERT INTO event_reviews (id, event_id, user_id, rating, comment) VALUES ($1, $2, $3, $4, $5)",
        [reviewId, eventId, user.id, rating, comment]
      );

      return { success: true, reviewId };
    } finally {
      await db.end();
    }
  });

  // --- REFERRALS & CASHBACK ---
  server.get("/referral-code", { preHandler: [server.authenticate] }, async (request, reply) => {
    const user = request.user;
    const db = await getTenantConnection(user.accountId);
    try {
      let codeRes = await db.query("SELECT code FROM referral_codes WHERE user_id = $1", [user.id]);
      
      if (codeRes.rowCount === 0) {
        const newCode = `REF-${randomBytes(4).toString('hex').toUpperCase()}`;
        await db.query("INSERT INTO referral_codes (id, user_id, code) VALUES ($1, $2, $3)", [randomUUID(), user.id, newCode]);
        return { code: newCode };
      }

      return { code: codeRes.rows[0].code };
    } finally {
      await db.end();
    }
  });

  server.get("/wallet", { preHandler: [server.authenticate] }, async (request, reply) => {
    const user = request.user;
    const db = await getTenantConnection(user.accountId);
    try {
      const walletRes = await db.query("SELECT balance FROM buyer_wallets WHERE user_id = $1", [user.id]);
      const balance = (walletRes.rowCount || 0) > 0 ? walletRes.rows[0].balance : 0;
      
      const transactionsRes = await db.query(
        "SELECT * FROM wallet_transactions wt JOIN buyer_wallets bw ON wt.wallet_id = bw.id WHERE bw.user_id = $1 ORDER BY wt.created_at DESC",
        [user.id]
      );

      return { balance, transactions: transactionsRes.rows };
    } finally {
      await db.end();
    }
  });
}
