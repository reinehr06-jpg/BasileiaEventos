import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import multipart from "@fastify/multipart";
import { PrismaClient } from "@prisma/client";
import authRoutes from "./routes/auth.routes";
import accountRoutes from "./routes/account.routes";
import eventRoutes from "./routes/event.routes";
import ticketRoutes from "./routes/ticket.routes";
import webhookRoutes from "./routes/webhook.routes";
import checkinRoutes from "./routes/checkin.routes";
import { authenticate } from "./utils/auth";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      id: string;
      accountId: string;
      email: string;
      role: string;
    };
  }
}

declare module "fastify" {
  interface FastifyInstance {
    authenticate: typeof authenticate;
  }
}

const server = Fastify({ logger: true });
export const prisma = new PrismaClient();

server.register(cors, { origin: true, credentials: true });
server.register(jwt, { secret: process.env.JWT_SECRET! });
server.register(multipart);

server.decorate("authenticate", authenticate);

import uploadRoutes from "./routes/upload.routes";

// ... existing code ...

import facialRoutes from "./routes/facial.routes";
import trackingRoutes from "./routes/tracking.routes";
import publicRoutes from "./routes/public.routes";
import staticRoutes from "./routes/static.routes";
import seatRoutes from "./routes/seat.routes";
import waitlistRoutes from "./routes/waitlist.routes";
import physicalRoutes from "./routes/physical.routes";
import planningRoutes from "./routes/planning.routes";

server.register(authRoutes, { prefix: "/api/auth" });
server.register(accountRoutes, { prefix: "/api/accounts" });
server.register(uploadRoutes, { prefix: "/api/uploads" });
server.register(eventRoutes, { prefix: "/api/events" });
server.register(ticketRoutes, { prefix: "/api/tickets" });
server.register(webhookRoutes, { prefix: "/api/webhooks" });
server.register(checkinRoutes, { prefix: "/api/checkin" });
server.register(facialRoutes, { prefix: "/api/facial" });
server.register(trackingRoutes, { prefix: "/api/tracking" });
server.register(publicRoutes, { prefix: "/api/public" });
server.register(seatRoutes, { prefix: "/api/seats" });
server.register(waitlistRoutes, { prefix: "/api/waitlist" });
server.register(physicalRoutes, { prefix: "/api/physical" });
server.register(planningRoutes, { prefix: "/api/planning" });
server.register(staticRoutes);

server.get("/health", async () => ({ status: "ok" }));

const start = async () => {
  try {
    await server.listen({ port: 3001, host: "0.0.0.0" });
    console.log("Server running on http://localhost:3001");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
