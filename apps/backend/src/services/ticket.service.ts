import { Client } from "pg";
import { v4 as uuidv4 } from "uuid";

export class TicketService {
  constructor(private db: Client) {}

  async listTypes(eventId: string) {
    const res = await this.db.query("SELECT * FROM ticket_types WHERE event_id = $1", [eventId]);
    return res.rows;
  }

  async createType(data: { event_id: string; name: string; price: number; quantity: number }) {
    const id = uuidv4();
    const res = await this.db.query(
      "INSERT INTO ticket_types (id, event_id, name, price, quantity) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [id, data.event_id, data.name, data.price, data.quantity]
    );
    return res.rows[0];
  }

  async listLots(typeId: string) {
    const res = await this.db.query("SELECT * FROM ticket_lots WHERE ticket_type_id = $1", [typeId]);
    return res.rows;
  }

  async createLot(data: { ticket_type_id: string; name: string; price: number; quantity: number; payment_link?: string; auto_open_at_percent?: number }) {
    const id = uuidv4();
    const res = await this.db.query(
      "INSERT INTO ticket_lots (id, ticket_type_id, name, price, quantity, payment_link, auto_open_at_percent) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [id, data.ticket_type_id, data.name, data.price, data.quantity, data.payment_link, data.auto_open_at_percent || 90]
    );
    return res.rows[0];
  }
}
