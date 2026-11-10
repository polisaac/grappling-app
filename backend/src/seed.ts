import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Prisma } from "./generated/prisma/client";
import { prisma } from "./lib/prisma";
import { SEED_PASSWORD, SEED_USERS } from "./seed.data";

// Seed de demostración para la presentación del MVP.
//
//   npx prisma db seed        (usa prisma.config.ts -> migrations.seed)
//   npm run seed
//
// ¡DESTRUCTIVO! Antes de sembrar borra, en este orden:
//   1. TODAS las bitácoras (TrainingLog) y sus Scrambles.
//   2. TODAS las relaciones Follows.
//   3. Los usuarios de prueba: correos de dominios reservados para pruebas (@example.com, @test.com).
//      Los usuarios con otros dominios (cuentas reales) NO se borran.
// Todo ocurre en una sola transacción: si algo falla, la base queda exactamente como estaba.

const TEST_EMAIL_SUFFIXES = ["@example.com", "@test.com"];
const BCRYPT_ROUNDS = 10;
const HOUR_MS = 60 * 60 * 1000;
// Las bitácoras se publican poco después de entrenar; el feed se ordena por fecha de publicación.
const PUBLISH_DELAY_MS = 40 * 60 * 1000;

async function main(): Promise<void> {
  const now = Date.now();

  // --- Qué se va a borrar (solo informativo) ---
  const existingUsers = await prisma.user.findMany({
    select: { email: true },
    orderBy: { createdAt: "asc" },
  });
  const isTestEmail = (email: string): boolean =>
    TEST_EMAIL_SUFFIXES.some((suffix) => email.endsWith(suffix));
  const usersToDelete = existingUsers.filter((user) => isTestEmail(user.email));
  const usersToKeep = existingUsers.filter((user) => !isTestEmail(user.email));
  const [logsBefore, scramblesBefore, followsBefore] = await Promise.all([
    prisma.trainingLog.count(),
    prisma.scramble.count(),
    prisma.follows.count(),
  ]);

  console.log("Se borrará:");
  console.log(`  - ${logsBefore} bitácoras, ${scramblesBefore} scrambles, ${followsBefore} follows`);
  console.log(`  - ${usersToDelete.length} usuarios de prueba:`);
  for (const user of usersToDelete) {
    console.log(`      ${user.email}`);
  }
  if (usersToKeep.length > 0) {
    console.log(`  Se conservan ${usersToKeep.length} usuarios con otros dominios:`);
    for (const user of usersToKeep) {
      console.log(`      ${user.email}`);
    }
  }

  // --- Datos a crear (ids generados aquí para insertar todo en bloque y con pocas consultas) ---
  const passwordHashes = await Promise.all(
    SEED_USERS.map(() => bcrypt.hash(SEED_PASSWORD, BCRYPT_ROUNDS)),
  );

  const userIdByEmail = new Map<string, string>();
  const users: Prisma.UserCreateManyInput[] = SEED_USERS.map((seed, index) => {
    const id = randomUUID();
    userIdByEmail.set(seed.email, id);
    return {
      id,
      name: seed.name,
      email: seed.email,
      passwordHash: passwordHashes[index] ?? "",
      createdAt: new Date(now - 30 * 24 * HOUR_MS),
    };
  });

  const logs: Prisma.TrainingLogCreateManyInput[] = [];
  const scrambles: Prisma.ScrambleCreateManyInput[] = [];
  for (const seed of SEED_USERS) {
    const userId = userIdByEmail.get(seed.email);
    if (!userId) {
      throw new Error(`Usuario sin id: ${seed.email}`);
    }
    for (const log of seed.logs) {
      const trainedAt = new Date(now - log.hoursAgo * HOUR_MS);
      const logId = randomUUID();
      logs.push({
        id: logId,
        userId,
        trainedAt,
        modality: log.modality,
        location: log.location,
        satisfaction: log.satisfaction,
        note: log.note,
        createdAt: new Date(Math.min(trainedAt.getTime() + PUBLISH_DELAY_MS, now)),
      });
      log.scrambles.forEach((scramble, order) => {
        scrambles.push({
          logId,
          position: scramble.position,
          technique: scramble.technique,
          result: scramble.result,
          order,
        });
      });
    }
  }

  const follows: Prisma.FollowsCreateManyInput[] = SEED_USERS.flatMap((seed) => {
    const followerId = userIdByEmail.get(seed.email);
    return seed.follows.map((followedEmail) => {
      const followingId = userIdByEmail.get(followedEmail);
      if (!followerId || !followingId) {
        throw new Error(`Follow inválido: ${seed.email} -> ${followedEmail}`);
      }
      return { followerId, followingId };
    });
  });

  // --- Todo o nada ---
  await prisma.$transaction([
    prisma.scramble.deleteMany(),
    prisma.trainingLog.deleteMany(),
    prisma.follows.deleteMany(),
    prisma.user.deleteMany({
      where: { OR: TEST_EMAIL_SUFFIXES.map((suffix) => ({ email: { endsWith: suffix } })) },
    }),
    prisma.user.createMany({ data: users }),
    prisma.trainingLog.createMany({ data: logs }),
    prisma.scramble.createMany({ data: scrambles }),
    prisma.follows.createMany({ data: follows }),
  ]);

  // --- Verificación contra la base de datos ---
  const [userCount, logCount, scrambleCount, followCount] = await Promise.all([
    prisma.user.count(),
    prisma.trainingLog.count(),
    prisma.scramble.count(),
    prisma.follows.count(),
  ]);
  console.log("\nBase de datos sembrada:");
  console.log(`  usuarios=${userCount} bitácoras=${logCount} scrambles=${scrambleCount} follows=${followCount}`);
  console.log(`\nCuentas de demostración (contraseña de todas: ${SEED_PASSWORD}):`);
  for (const seed of SEED_USERS) {
    console.log(
      `  ${seed.email.padEnd(32)} ${seed.name}  [${seed.logs.length} bitácoras, sigue a ${seed.follows.length}]`,
    );
  }
}

main()
  .catch((error: unknown) => {
    console.error("El seed falló; la base de datos no se modificó.", error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
