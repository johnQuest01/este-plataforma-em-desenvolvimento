-- Campos de endereço detalhado no registo (rua, número, bairro, cidade, UF, CEP)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "street" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "addressNumber" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "addressComplement" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "district" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "postalCode" TEXT;
