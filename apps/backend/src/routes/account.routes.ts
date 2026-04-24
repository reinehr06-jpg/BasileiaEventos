import { FastifyInstance } from "fastify";
import z from "zod";
import { prisma } from "../server";

export default async function accountRoutes(server: FastifyInstance) {
  server.get("/me", { preHandler: [server.authenticate] }, async (request, reply) => {
    const user = request.user;
    const account = await prisma.account.findUnique({
      where: { id: user.accountId },
      include: { users: true },
    });
    return reply.send(account);
  });
}
