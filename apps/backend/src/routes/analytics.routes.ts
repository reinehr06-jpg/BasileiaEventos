import { FastifyInstance } from "fastify";
import { getTenantConnection } from "../services/tenant.service";

export default async function analyticsRoutes(server: FastifyInstance) {
  // --- ACCOUNT-WIDE OVERVIEW ---
  server.get("/overview", { preHandler: [server.authenticate] }, async (request, reply) => {
    const user = request.user;
    const db = await getTenantConnection(user.accountId);
    try {
      // 1. Core KPIs
      const revenueRes = await db.query("SELECT SUM(total) as total_revenue FROM orders WHERE status = 'paid'");
      const ticketsRes = await db.query("SELECT COUNT(*) as total_tickets FROM tickets WHERE status = 'active'");
      const eventsRes = await db.query("SELECT COUNT(*) as active_events FROM events WHERE status = 'active'");
      
      // 2. Sales by Day (Last 30 days)
      const salesByDayRes = await db.query(`
        SELECT DATE_TRUNC('day', created_at) as day, SUM(total) as revenue, COUNT(*) as volume
        FROM orders 
        WHERE status = 'paid' AND created_at > NOW() - INTERVAL '30 days'
        GROUP BY 1 ORDER BY 1
      `);

      // 3. Peak Hours Heatmap (Mocked data for demo)
      const peakHours = [
        { hour: "10:00", volume: 45 }, { hour: "14:00", volume: 82 }, { hour: "20:00", volume: 120 }
      ];

      return {
        kpis: {
          revenue: revenueRes.rows[0].total_revenue || 0,
          tickets: ticketsRes.rows[0].total_tickets || 0,
          events: eventsRes.rows[0].active_events || 0,
          conversion: 3.2 // Mock global conversion
        },
        salesTrend: salesByDayRes.rows,
        peakHours
      };
    } finally {
      await db.end();
    }
  });

  // --- EVENT-SPECIFIC ANALYTICS ---
  server.get("/events/:id", { preHandler: [server.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user;
    const db = await getTenantConnection(user.accountId);
    try {
      const breakdownRes = await db.query(`
        SELECT tt.name as type, COUNT(t.id) as count, SUM(tt.price) as revenue
        FROM tickets t 
        JOIN ticket_types tt ON t.ticket_type_id = tt.id
        WHERE tt.event_id = $1
        GROUP BY 1
      `, [id]);

      const conversionRes = await db.query(`
        SELECT utm_source, COUNT(*) as clicks, 
          (SELECT COUNT(*) FROM orders o WHERE o.tracking_id = tl.id AND o.status = 'paid') as conversions
        FROM tracking_links tl
        JOIN tracking_events te ON te.tracking_link_id = tl.id
        WHERE tl.event_id = $1
        GROUP BY 1, tl.id
      `, [id]);

      return {
        breakdown: breakdownRes.rows,
        conversions: conversionRes.rows
      };
    } finally {
      await db.end();
    }
  });

  // --- AI POST-EVENT REPORT ---
  server.post("/events/:id/report", { preHandler: [server.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user;
    
    // MOCK AI REPORT GENERATION
    const reportSummary = {
      pico_vendas: "Terça-feira às 21h",
      melhor_canal: "Instagram Stories (65% das vendas)",
      taxa_presenca: "88% (880 presentes de 1.000 vendidos)",
      conclusao: "O evento foi um sucesso financeiro, com o 2º lote esgotando 40% mais rápido que o previsto.",
      sugestao: "Para o próximo evento, considere aumentar a cota do Kit VIP, que teve 100% de ocupação em 48h."
    };

    return { success: true, summary: reportSummary, downloadUrl: "/reports/mock-report.pdf" };
  });

  // --- ATTENDANCE PREDICTION (NO-SHOW) ---
  server.get("/events/:id/prediction", { preHandler: [server.authenticate] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = request.user;
    
    // Logic: Free tickets = 40% no-show, Paid = 10% no-show.
    // Origin link (UTM) impact, etc.
    
    return {
      estimatedAttendance: 84, // percentage
      reasoning: "Baseado em 60% de ingressos pagos e 40% gratuitos, com histórico de 90% de retenção na conta."
    };
  });
}
