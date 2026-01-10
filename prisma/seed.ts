import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed iniciado: Nenhuma operação pendente.');
  // Você pode adicionar criação de usuários ou lojas padrão aqui no futuro.
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });