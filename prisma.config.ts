// prisma.config.ts
import 'dotenv/config'; // <--- ADICIONE ESTA LINHA NO TOPO
import { defineConfig } from '@prisma/config';

export default defineConfig({
  // Define onde o Prisma deve procurar o arquivo de schema
  schema: 'prisma/schema.prisma',
  
  // Define a conexão para comandos como 'prisma migrate'
  datasource: {
    url: process.env.DATABASE_URL, 
  },
});