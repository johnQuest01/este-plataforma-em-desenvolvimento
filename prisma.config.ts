import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    // Aqui o Prisma buscará sua URL do arquivo .env
    url: process.env.DATABASE_URL,
  },
});