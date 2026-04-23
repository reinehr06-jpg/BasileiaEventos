import { FastifyInstance } from "fastify";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import z from "zod";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY!,
    secretAccessKey: process.env.R2_SECRET_KEY!,
  },
});

export default async function uploadRoutes(server: FastifyInstance) {
  server.post("/presigned-url", { preHandler: [server.authenticate] }, async (request, reply) => {
    const { filename, contentType } = z.object({
      filename: z.string(),
      contentType: z.string(),
    }).parse(request.body);

    const key = `events/${request.user.accountId}/${Date.now()}-${filename}`;
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return reply.send({ presignedUrl, key });
  });
}
