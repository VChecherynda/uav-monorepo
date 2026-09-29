import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw Error(`${name} is not set`);
  }

  return value;
}

async function main() {
  const email = requireEnv('TRAINING_PLATOON_COMMANDER_EMAIL');
  const password = requireEnv('TRAINING_PLATOON_COMMANDER_PASSWORD');
  const platoonName = 'Training UAV Platoon';

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  const unit = await prisma.unit.upsert({
    where: { name: platoonName },
    update: {},
    create: {
      name: platoonName,
    },
  });

  await prisma.unitMember.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      unitId: unit.id,
      unitRole: 'COMMANDER',
      canAcceptDrones: true,
    },
  });

  const { count } = await prisma.mission.updateMany({
    where: { unitId: null },
    data: {
      unitId: unit.id,
      authorId: user.id,
    },
  });

  console.log(`Updated missions ${count}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
