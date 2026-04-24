import { Client } from "pg";
import { v4 as uuidv4 } from "uuid";

export class EventService {
  constructor(private db: Client) {}

  async list() {
    const res = await this.db.query("SELECT * FROM events ORDER BY created_at DESC");
    return res.rows;
  }

  async findById(id: string) {
    const res = await this.db.query("SELECT * FROM events WHERE id = $1", [id]);
    return res.rows[0];
  }

  async create(data: { title: string; slug: string; description?: string; start_date: string; end_date?: string }) {
    const id = uuidv4();
    const res = await this.db.query(
      "INSERT INTO events (id, title, slug, description, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [id, data.title, data.slug, data.description, data.start_date, data.end_date]
    );
    return res.rows[0];
  }

  async update(id: string, data: Partial<{ title: string; description: string; start_date: string; end_date: string; status: string }>) {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
    const res = await this.db.query(
      `UPDATE events SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return res.rows[0];
  }

  async delete(id: string) {
    // Soft delete: check for sales
    const orders = await this.db.query("SELECT id FROM orders WHERE event_id = $1 LIMIT 1", [id]);
    if (orders.rows.length > 0) {
      await this.db.query("UPDATE events SET status = 'archived' WHERE id = $1", [id]);
    } else {
      await this.db.query("DELETE FROM events WHERE id = $1", [id]);
    }
  }

  async duplicate(id: string) {
    const event = await this.findById(id);
    if (!event) throw new Error("Event not found");

    const newEvent = await this.create({
      title: `${event.title} (Cópia)`,
      slug: `${event.slug}-copy-${Date.now()}`,
      description: event.description,
      start_date: event.start_date
    });

    // Duplicate ticket types
    const typesRes = await this.db.query("SELECT * FROM ticket_types WHERE event_id = $1", [id]);
    for (const type of typesRes.rows) {
      const newTypeId = uuidv4();
      await this.db.query(
        "INSERT INTO ticket_types (id, event_id, name, price, quantity) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [newTypeId, newEvent.id, type.name, type.price, type.quantity]
      );

      // Duplicate lots
      const lotsRes = await this.db.query("SELECT * FROM ticket_lots WHERE ticket_type_id = $1", [type.id]);
      for (const lot of lotsRes.rows) {
        await this.db.query(
          "INSERT INTO ticket_lots (id, ticket_type_id, name, price, quantity, payment_link, auto_open_at_percent) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [uuidv4(), newTypeId, lot.name, lot.price, lot.quantity, lot.payment_link, lot.auto_open_at_percent]
        );
      }
    }

    return newEvent;
  }
}
