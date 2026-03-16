import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const SALT_ROUNDS = 10;

  // ─── Seed Users ─────────────────────────────────────────────────────────────
  const usersToSeed = [
    {
      nickname: 'admin',
      name: 'Administrator',
      email: 'admin@bookstore.com',
      password: 'admin123',
      role: 'ADMIN' as const,
      balance: 0,
    },
    {
      nickname: 'demo_user',
      name: 'Demo User',
      email: 'demo@bookstore.com',
      password: 'password123',
      role: 'USER' as const,
      balance: 500,
    },
    {
      nickname: 'john_doe',
      name: 'John Doe',
      email: 'john@bookstore.com',
      password: 'password123',
      role: 'USER' as const,
      balance: 200,
    },
  ];

  console.log('🌱 Seeding users...');

  for (const u of usersToSeed) {
    const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);

    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        name: u.name,
        passwordHash,
        role: u.role,
        balance: u.balance,
      },
      create: {
        nickname: u.nickname,
        name: u.name,
        email: u.email,
        passwordHash,
        role: u.role,
        balance: u.balance,
      },
    });

    console.log(`  ✅ Upserted ${u.role}: ${u.email}`);
  }

  console.log('\n✨ Seeding complete!');
  console.log('\n📋 Login credentials:');
  console.log('  Admin   → admin@bookstore.com  / admin123');
  console.log('  User    → demo@bookstore.com   / password123');
  console.log('  User    → john@bookstore.com   / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
