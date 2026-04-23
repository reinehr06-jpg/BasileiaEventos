import { FastifyRequest, FastifyReply } from "fastify";
import { getTenantConnection } from "../services/tenant.service";
import { prisma } from "../server";

declare module "fastify" {
  interface FastifyRequest {
    tenantDb?: any; // pg Client
  }
}

export async function tenantMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const accountId = (request.user as any)?.accountId;
  if (!accountId) return reply.status(401).send({ error: "Unauthorized" });

  const account = await prisma.account.findUnique({ where: { id: accountId } });
  if (!account) return reply.status(404).send({ error: "Account not found" });

  const tenantDb = await getTenantConnection(account.dbName);
  await tenantDb.connect();
  request.tenantDb = tenantDb;
  request.tenantDb.on("end", () => tenantDb.end());
}
