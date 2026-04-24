import { Client } from "pg";
import { v4 as uuidv4 } from "uuid";

/**
 * BasileaSecure Mock Service
 * Simulates a high-performance facial recognition engine.
 */
export class BasileaSecureService {
  constructor(private db: Client) {}

  /**
   * Registers a face for a specific event and ticket.
   * In a real system, this would extract features and store them in a vector DB.
   */
  async registerFace(eventId: string, ticketId: string, imageBase64: string) {
    // Mock face feature extraction
    const faceId = `face_${uuidv4().substring(0, 8)}`;
    
    // In our mock, we store the face_id directly on the ticket
    await this.db.query(
      "UPDATE tickets SET face_id = $1, facial_status = 'approved' WHERE id = $2",
      [faceId, ticketId]
    );

    return { faceId, status: "approved" };
  }

  /**
   * Identifies a person from a face image within an event's namespace.
   */
  async identify(eventId: string, imageBase64: string) {
    // In a real system, we would search the vector DB for the best match.
    // For this mock, we'll simulate a match if the "image" contains a certain string or just return the first valid ticket.
    
    const res = await this.db.query(
      `SELECT t.*, tt.name as type_name, o.buyer_name
       FROM tickets t 
       JOIN ticket_types tt ON t.ticket_type_id = tt.id 
       JOIN orders o ON t.order_id = o.id
       WHERE tt.event_id = $1 AND t.facial_status = 'approved' AND t.face_id IS NOT NULL
       LIMIT 1`,
      [eventId]
    );

    if (res.rows.length === 0) {
      return { status: "not_found" };
    }

    return {
      status: "identified",
      ticket: res.rows[0]
    };
  }

  /**
   * Deletes facial data (LGPD compliance / Transfer).
   */
  async deleteFace(ticketId: string) {
    await this.db.query(
      "UPDATE tickets SET face_id = NULL, facial_status = 'pending' WHERE id = $1",
      [ticketId]
    );
    return { success: true };
  }
}
