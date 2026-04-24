import { openDB, IDBPDatabase } from "idb";

const DB_NAME = "BasileiaPortaria";
const STORE_TICKETS = "tickets";
const STORE_LOGS = "checkin_logs";

export async function initDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_TICKETS)) {
        db.createObjectStore(STORE_TICKETS, { keyPath: "code" });
      }
      if (!db.objectStoreNames.contains(STORE_LOGS)) {
        db.createObjectStore(STORE_LOGS, { keyPath: "id", autoIncrement: true });
      }
    },
  });
}

export async function saveTickets(tickets: any[]) {
  const db = await initDB();
  const tx = db.transaction(STORE_TICKETS, "readwrite");
  for (const ticket of tickets) {
    await tx.store.put(ticket);
  }
  await tx.done;
}

export async function getTicket(code: string) {
  const db = await initDB();
  return db.get(STORE_TICKETS, code);
}

export async function saveOfflineLog(log: any) {
  const db = await initDB();
  await db.add(STORE_LOGS, { ...log, createdAt: new Date().toISOString() });
}

export async function getOfflineLogs() {
  const db = await initDB();
  return db.getAll(STORE_LOGS);
}

export async function clearOfflineLogs() {
  const db = await initDB();
  await db.clear(STORE_LOGS);
}

export async function countOfflineLogs() {
  const db = await initDB();
  return db.count(STORE_LOGS);
}
