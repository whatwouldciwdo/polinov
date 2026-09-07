const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial users to PostgreSQL...");

  const adminPassword = await bcrypt.hash("admin@polinov.com", 12);
  const userPassword = await bcrypt.hash("user@gmail.com", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@polinov.com" },
    update: {},
    create: {
      name: "Admin",
      nip: "123456789",
      email: "admin@polinov.com",
      password: adminPassword,
      role: "admin",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@gmail.com" },
    update: {},
    create: {
      name: "User Demo",
      nip: "987654321",
      email: "user@gmail.com",
      password: userPassword,
      role: "user",
    },
  });

  console.log("Seed success:", { admin: admin.email, user: user.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
