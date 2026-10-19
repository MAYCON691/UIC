import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const username = process.env.SUPERADMIN_USER ?? 'BRAULIO';
  const password = process.env.SUPERADMIN_PASSWORD ?? 'POLLOFRITO69';

  const existing = await prisma.user.findFirst({ where: { role: Role.SUPERADMIN } });
  if (existing) {
    console.log(`Ya existe un superadmin (${existing.username}). No se hizo nada.`);
    return;
  }

  await prisma.user.create({
    data: {
      username,
      password: await hash(password, 10),
      fullName: 'Braulio',
      role: Role.SUPERADMIN,
    },
  });
  console.log(`Superadmin "${username}" creado.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());