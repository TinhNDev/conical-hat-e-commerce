import { PrismaClient } from "../generated/prisma/index.js";
import { createHash, randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

const hashPassword = (password, salt) => scryptSync(password, salt, 64).toString("hex");

const generatePasswordHash = (password) => {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${hashPassword(password, salt)}`;
};

const hashOpaqueToken = (token) => createHash("sha256").update(token).digest("hex");

const ADMIN_EMAIL = (process.env.ADMIN_SEED_EMAIL ?? process.env.ADMIN_EMAILS?.split(",")[0] ?? "admin@atelier.store").trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD ?? "admin123456";
const ADMIN_NAME = process.env.ADMIN_SEED_NAME ?? "System Admin";
const ADMIN_STUDENT_ID = process.env.ADMIN_SEED_STUDENT_ID ?? "ADMIN-0001";
const MARK_EMAIL_VERIFIED = (process.env.ADMIN_SEED_EMAIL_VERIFIED ?? "true").toLowerCase() !== "false";

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required before running the admin seed.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  const payload = {
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    studentId: ADMIN_STUDENT_ID,
    role: "admin",
    passwordHash: generatePasswordHash(ADMIN_PASSWORD),
    emailVerifiedAt: MARK_EMAIL_VERIFIED ? new Date() : null,
  };

  const user = existingUser
    ? await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: payload,
      })
    : await prisma.user.create({
        data: payload,
      });

  await prisma.refreshToken.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  const verificationPreviewToken = randomBytes(24).toString("hex");
  await prisma.emailVerificationToken.deleteMany({
    where: { userId: user.id },
  });
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashOpaqueToken(verificationPreviewToken),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      consumedAt: MARK_EMAIL_VERIFIED ? new Date() : null,
    },
  });

  console.log("Admin user seeded.");
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);
  console.log(`Verified: ${MARK_EMAIL_VERIFIED ? "yes" : "no"}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
