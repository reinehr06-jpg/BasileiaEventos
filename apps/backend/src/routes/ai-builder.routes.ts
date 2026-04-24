import { FastifyInstance } from "fastify";
import { getTenantConnection } from "../services/tenant.service";
import { randomUUID } from "crypto";

export default async function aiBuilderRoutes(server: FastifyInstance) {
  // Generate Landing Page Content with AI
  server.post("/generate", { preHandler: [server.authenticate] }, async (request, reply) => {
    const { briefing, eventId } = request.body as { briefing: any, eventId: string };
    const user = request.user;

    // In a real app, we'd call OpenAI here
    // const completion = await openai.chat.completions.create({ model: "gpt-4", messages: [...] });
    // const content = JSON.parse(completion.choices[0].message.content);

    // MOCK AI GENERATION
    const mockContent = {
      headline: `O Evento mais esperado de ${briefing.target_audience || '2026'}`,
      subheadline: `Participe do ${briefing.event_name || 'Grande Evento'} e transforme sua experiência.`,
      about: briefing.description || "Uma experiência única unindo tecnologia e networking.",
      sections: [
        { title: "O que esperar", text: "Palestrantes renomados, workshops práticos e muito mais." },
        { title: "Programação", text: "Das 08h às 20h com pausas para networking premium." }
      ],
      faq: [
        { q: "Onde será?", a: "No local mais prestigiado da cidade." },
        { q: "Tem certificado?", a: "Sim, emitido digitalmente após o evento." }
      ],
      seo: {
        title: `${briefing.event_name} | Ingressos e Programação`,
        description: `Garanta sua vaga no ${briefing.event_name}. O evento focado em ${briefing.target_audience}.`
      }
    };

    return { content: mockContent };
  });

  // Save Landing Page Configuration
  server.post("/:eventId/config", { preHandler: [server.authenticate] }, async (request, reply) => {
    const { eventId } = request.params as { eventId: string };
    const { config, content, published } = request.body as any;
    const user = request.user;

    const db = await getTenantConnection(user.accountId);
    try {
      // Check if event is paid for AI page
      const eventRes = await db.query("SELECT is_ai_page_paid FROM events WHERE id = $1", [eventId]);
      if (eventRes.rowCount === 0) return reply.status(404).send({ error: "Event not found" });
      
      // For demo purposes, we allow saving even if not paid, but could block publishing
      
      const checkPage = await db.query("SELECT id FROM event_landing_pages WHERE event_id = $1", [eventId]);
      
      if (checkPage.rowCount === 0) {
        await db.query(
          "INSERT INTO event_landing_pages (id, event_id, config, content, published) VALUES ($1, $2, $3, $4, $5)",
          [randomUUID(), eventId, JSON.stringify(config), JSON.stringify(content), published || false]
        );
      } else {
        await db.query(
          "UPDATE event_landing_pages SET config = $1, content = $2, published = $3 WHERE event_id = $4",
          [JSON.stringify(config), JSON.stringify(content), published || false, eventId]
        );
      }

      return { success: true };
    } finally {
      await db.end();
    }
  });

  // Public Get Landing Page Content
  server.get("/public/:slug", async (request, reply) => {
    const { slug } = request.params as { slug: string };
    
    // Again, in multi-tenant we need a way to find the tenant. 
    // Mocking for tenant_admin:
    const db = await getTenantConnection("tenant_admin");
    try {
      const pageRes = await db.query(
        `SELECT lp.*, e.title, e.start_date 
         FROM event_landing_pages lp 
         JOIN events e ON lp.event_id = e.id 
         WHERE e.slug = $1 AND lp.published = true`,
        [slug]
      );
      
      if (pageRes.rowCount === 0) return reply.status(404).send({ error: "Page not found or not published" });
      
      return pageRes.rows[0];
    } finally {
      await db.end();
    }
  });
}
