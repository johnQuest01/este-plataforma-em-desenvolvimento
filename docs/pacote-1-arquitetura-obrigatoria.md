# PACOTE 1 — Arquitetura Obrigatória
> Envie este arquivo sempre que pedir ao Google AI Studio para criar novas telas com banco de dados.
> Contém: Prisma Schema · Tipos Builder · LocalDB · Prisma Client · Schemas Zod · Server Actions de Auth

---

## 📄 prisma/schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

/// Utilizador da plataforma: comprador (`role = customer`) ou vendedor (`role = seller`).
/// PF/PJ distinguem-se por `documentType` (CPF/CNPJ) e `document` (único).
model User {
  id                 String   @id @default(cuid())
  email              String?  @unique
  document           String   @unique
  documentType       String   @default("CPF")
  passwordHash       String   @default("")
  name               String?
  whatsapp           String?
  address            String?
  street             String?
  addressNumber      String?
  addressComplement  String?
  district           String?
  city               String?
  state              String?
  postalCode         String?
  profilePictureUrl  String?
  backgroundImageUrl String?
  /// `customer` = comprador; `seller` = vendedor autorizado.
  role               String   @default("customer")
  stores             Store[]
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
}

model Store {
  id               String            @id @default(cuid())
  name             String
  slug             String            @unique
  nicheType        String            @default("clothing")
  features         Json              @default("{}")
  layoutConfig     Json?             @default("[]")
  themeConfig      Json?             @default("{}")
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  ownerId          String
  owner            User              @relation(fields: [ownerId], references: [id])
  products         Product[]
  orders           Order[]
  productionItems  ProductionItem[]
  productionOrders ProductionOrder[]
}

model Product {
  id              String           @id @default(cuid())
  name            String
  description     String?
  price           Decimal          @db.Decimal(10, 2)
  reference       String?
  category        String?
  imageColor      String?
  imageUrl        String?
  tags            String[]
  isVisible       Boolean          @default(true)
  stock           Int              @default(0)
  variants        ProductVariant[]
  storeId         String
  store           Store            @relation(fields: [storeId], references: [id])
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
  orderItems      OrderItem[]
  productionItems ProductionItem[]
  @@index([reference])
  @@index([category])
}

model ProductVariant {
  id        String   @id @default(cuid())
  name      String
  sku       String?  @unique
  price     Decimal? @db.Decimal(10, 2)
  stock     Int      @default(0)
  images    String[]
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
}

model ProductionOrder {
  id          String      @id @default(cuid())
  productName String
  image       String      @db.Text
  status      String      @default("PENDING")
  storeId     String?
  store       Store?      @relation(fields: [storeId], references: [id])
  variations  Variation[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model Variation {
  id                String          @id @default(cuid())
  name              String
  category          String?
  color             String
  size              String
  quantity          Int             @map("qty")
  stockLocations    String[]
  images            String[]
  productionOrderId String
  productionOrder   ProductionOrder @relation(fields: [productionOrderId], references: [id], onDelete: Cascade)
  createdAt         DateTime        @default(now())
}

model ProductionItem {
  id          String     @id @default(cuid())
  status      String     @default("PENDING")
  priority    Int        @default(0)
  notes       String?
  storeId     String
  store       Store      @relation(fields: [storeId], references: [id])
  productId   String
  product     Product    @relation(fields: [productId], references: [id])
  orderItemId String?    @unique
  orderItem   OrderItem? @relation(fields: [orderItemId], references: [id])
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Order {
  id            String      @id @default(cuid())
  status        String      @default("PENDING")
  total         Decimal     @db.Decimal(10, 2)
  customerName  String?
  customerPhone String?
  storeId       String
  store         Store       @relation(fields: [storeId], references: [id])
  items         OrderItem[]
  createdAt     DateTime    @default(now())
}

model OrderItem {
  id         String          @id @default(cuid())
  quantity   Int
  price      Decimal         @db.Decimal(10, 2)
  orderId    String
  order      Order           @relation(fields: [orderId], references: [id])
  productId  String
  product    Product         @relation(fields: [productId], references: [id])
  production ProductionItem?
}

model GuardianConfig {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())
}

model UIConfig {
  id              String   @id @default(cuid())
  pageSlug        String   @unique
  layout          Json     @default("[]")
  dashboardLayout Json?
  updatedAt       DateTime @updatedAt
  createdAt       DateTime @default(now())
}

model Banner {
  id          String   @id @default(cuid())
  title       String
  mediaType   String
  mediaUrl    String   @db.Text
  aspectRatio String
  orderIndex  Int      @default(0)
  isVisible   Boolean  @default(true)
  linkUrl     String?
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([orderIndex])
  @@index([isVisible])
}

model DevelopmentCardPercentage {
  id               String    @id @default("development-card-single-record")
  percentage       Int       @default(69)
  isManual         Boolean   @default(false)
  lastManualUpdate DateTime?
  lastAutoUpdate   DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  createdAt        DateTime  @default(now())
}

model AdminAccess {
  id             String    @id @default("admin-access-single-record")
  passwordHash   String
  isUnlocked     Boolean   @default(false)
  lastAccess     DateTime?
  accessCount    Int       @default(0)
  buttonPosition Json?     @default("{\"x\": 0, \"y\": 0}")
  updatedAt      DateTime  @updatedAt
  createdAt      DateTime  @default(now())
}

model FormVideoConfig {
  id                 String   @id @default("global-video-config")
  videoUrl           String   @default("") @db.Text
  cloudinaryPublicId String   @default("")
  metadata           Json?
  isActive           Boolean  @default(true)
  updatedAt          DateTime @updatedAt
  createdAt          DateTime @default(now())
}
```

---

## 📄 types/builder.ts

```typescript
/**
 * LEGO ARCHITECTURE - GLOBAL TYPES
 * Stack 2026: Next 16.1.1 | React 19.2.1 | Strict TS
 */

export type ProductionStep = 'sewing' | 'sorting' | 'tagging' | 'packaging' | 'ready';

export interface ProductionVariationDetail {
  id?: string;
  type: string;
  size: string;
  color: string;
  qty: number;
}

export interface ProductionItemData {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  currentStep: ProductionStep;
  stepsHistory: { sewing: boolean; sorting: boolean; tagging: boolean; packaging: boolean; };
  startedAt: string;
  variationsDetail?: ProductionVariationDetail[];
  returnReason?: string;
}

export interface SaleRecord {
  id: string;
  productName: string;
  totalValue: number;
  quantity: number;
  date: string;
  sellerName?: string;
}

export interface SaleswomanData {
  id: string;
  name: string;
  avatarUrl?: string;
}

export interface CartVariation {
  qty: number;
  size?: string;
  color?: string;
  [key: string]: unknown;
}

export interface CartProduct {
  id: string;
  name: string;
  price: number;
  mainImage: string;
  variations: CartVariation[];
  [key: string]: unknown;
}

export interface CartItem {
  cartId: string;
  product: CartProduct;
  quantity: number;
  variationLabel: string;
}

export type PaymentMethod = 'credit' | 'debit' | 'pix' | 'cash';

export interface StockCategoryItem {
  label: string;
  status: 'low' | 'high' | 'medium' | 'default';
  link?: string;
}

export interface ProductVariationData {
  size: string;
  color: string;
  variation?: string;
  quantity: number;
}

export type BlockType =
  | 'header' | 'product-grid' | 'banner' | 'categories' | 'category-section'
  | 'footer' | 'user-info' | 'grid-buttons' | 'inventory-feature' | 'action-buttons'
  | 'stock-header' | 'stock-search' | 'stock-category-grid' | 'stock-filter-buttons'
  | 'stock-catalog' | 'category-product-list' | 'order-header' | 'order-product-info'
  | 'order-variant-selector' | 'order-summary-footer' | 'admin-user-card'
  | 'history-search' | 'client-history-card' | 'transaction-card' | 'history-links'
  | 'stock-search-result-card' | 'stock-detailed-product-card' | 'stock-popup-card'
  | 'stock-simple-card' | 'production-list' | 'ready-stock-list' | 'stock-distribution-popup'
  | 'total-sales' | 'standard-button' | 'jeans-registration' | 'health-monitor'
  | 'master-guardian-dashboard' | 'account-screen' | 'walking-model' | 'activity-history'
  | 'personal-info' | 'registration-form' | 'video-background-manager' | 'form-video-background';

export interface MenuItem { id: string; label: string; icon: string; action?: string; link?: string; }
export interface FooterItem { id: string; icon: string; label?: string; isVisible: boolean; isHighlight?: boolean; action?: string; route?: string; }
export interface CategoryItem { label: string; icon: string; link?: string; videoUrl?: string; videoColor?: string; }
export interface ProductItem { name: string; tag?: string; imageColor?: string; price?: string; imageUrl?: string; }
export interface SimpleButton { id: string; label: string; action?: string; bgColor?: string; textColor?: string; badge?: string; icon?: string; indicatorColor?: string; }
export interface CatalogTag { label: string; color: 'orange' | 'blue' | 'gray'; }
export interface CatalogItem { id: string; title: string; image: string; tags: CatalogTag[]; status: 'low' | 'available' | 'regular' | 'unavailable'; statusLabel?: string; }
export interface ActivityButton { id: string; label: string; actionRoute: string; }

export interface BlockStyle {
  bgColor?: string; textColor?: string; accentColor?: string;
  borderRadius?: string; padding?: string; borderColor?: string;
  buttonColor?: string; buttonTextColor?: string;
  [key: string]: string | number | undefined;
}

export interface BlockData {
  [key: string]: string | number | boolean | null | undefined | object | unknown;
}

export interface BlockConfig {
  id: string;
  type: BlockType;
  isVisible: boolean;
  data: BlockData;
  style: BlockStyle;
}

export interface BlockComponentProps {
  config: BlockConfig;
  onAction?: (action: string, payload?: unknown) => void;
}
```

---

## 📄 lib/local-db.ts

```typescript
'use client';

export interface UserData {
  id: string;
  type: 'fisica' | 'juridica';
  document: string;
  name: string;
  emailAddress?: string;
  storeName?: string;
  whatsapp: string;
  role?: string;
  isVendedor?: boolean;
  nameGender?: 'feminino' | 'masculino';
  profilePictureUrl?: string | null;
  createdAt: string;
}

/** Vendedor: `role === 'seller'` OU `isVendedor === true` (compatibilidade). */
export function isSellerUser(user: UserData | null | undefined): boolean {
  if (!user) return false;
  if (user.role === 'seller') return true;
  return typeof user.isVendedor === 'boolean' && user.isVendedor === true;
}

export const LOCAL_USER_DB_KEY = 'b2b_app_user_db';
const DB_KEY = LOCAL_USER_DB_KEY;

export function inferNameGenderFromFullName(fullName: string): 'feminino' | 'masculino' {
  const raw = fullName.trim().split(/\s+/)[0] ?? '';
  if (raw.length < 2) return 'masculino';
  const first = raw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const maleEndingA = new Set(['luca', 'joshua']);
  if (maleEndingA.has(first)) return 'masculino';
  if (first.endsWith('a')) return 'feminino';
  return 'masculino';
}

type SaveUserInput = Omit<UserData, 'id' | 'createdAt'> & { prismaUserId?: string };

export const LocalDB = {
  saveUser: (data: SaveUserInput) => {
    if (typeof window === 'undefined') return null;
    const { prismaUserId, ...rest } = data;
    const id = typeof prismaUserId === 'string' && prismaUserId.trim().length > 0
      ? prismaUserId.trim()
      : crypto.randomUUID?.() ?? `user_${Date.now()}`;
    const newUser: UserData = { ...rest, id, createdAt: new Date().toISOString() };
    localStorage.setItem(DB_KEY, JSON.stringify(newUser));
    return newUser;
  },
  getUser: (): UserData | null => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : null;
  },
  clearUser: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(DB_KEY);
  },
  updateUser: (partial: Partial<UserData>): UserData | null => {
    if (typeof window === 'undefined') return null;
    const current = LocalDB.getUser();
    if (!current) return null;
    const next: UserData = { ...current, ...partial };
    if (partial.role !== undefined) next.isVendedor = partial.role === 'seller';
    localStorage.setItem(DB_KEY, JSON.stringify(next));
    return next;
  },
};
```

---

## 📄 lib/prisma.ts

```typescript
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('❌ DATABASE_URL não encontrada no .env');

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const createPrismaClient = () => new PrismaClient({
  datasources: { db: { url: connectionString } },
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

export const prisma = globalThis.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
```

---

## 📄 schemas/auth-schema.ts

```typescript
import { z } from 'zod';

export const UserLoginSchema = z.object({
  documentOrEmail: z.string().min(1, 'O E-mail ou Documento é obrigatório.'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
});

export type UserLoginType = z.infer<typeof UserLoginSchema>;
```

---

## 📄 schemas/registration-schema.ts

```typescript
import { z } from 'zod';

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCpf(digits: string): string {
  const d = onlyDigits(digits);
  if (d.length !== 11) return d;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9,11)}`;
}

export function formatCnpj(digits: string): string {
  const d = onlyDigits(digits);
  if (d.length !== 14) return d;
  return `${d.slice(0,2)}.${d.slice(2,5)}.${d.slice(5,8)}/${d.slice(8,12)}-${d.slice(12,14)}`;
}

export function formatDocumentForStorage(digits: string, type: 'CPF' | 'CNPJ'): string {
  const d = onlyDigits(digits);
  return type === 'CPF' ? formatCpf(d) : formatCnpj(d);
}

function isValidCpf(cpf: string): boolean {
  const d = onlyDigits(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(d[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== Number(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(d[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  return rest === Number(d[10]);
}

function isValidCnpj(cnpj: string): boolean {
  const d = onlyDigits(cnpj);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const calc = (s: string, weights: number[]) => {
    const sum = weights.reduce((acc, w, i) => acc + Number(s[i]) * w, 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const w1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  const w2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];
  if (calc(d, w1) !== Number(d[12])) return false;
  if (calc(d, w2) !== Number(d[13])) return false;
  return true;
}

export const UserRegistrationSchema = z
  .object({
    fullName: z.string().min(3, 'O nome completo deve ter pelo menos 3 caracteres.'),
    emailAddress: z.string().email('Formato de e-mail inválido.'),
    phoneNumber: z.string().transform((s) => onlyDigits(s)).pipe(z.string().min(10, 'Informe o WhatsApp com DDD.')),
    street: z.string().min(2, 'Informe a rua ou avenida.'),
    addressNumber: z.string().optional().default(''),
    addressComplement: z.string().optional().default(''),
    district: z.string().min(2, 'Informe o bairro / vila.'),
    city: z.string().min(2, 'Informe a cidade.'),
    state: z.string().min(2).max(2).transform((s) => s.trim().toUpperCase()),
    postalCode: z.string().transform((s) => onlyDigits(s).slice(0, 8)).pipe(z.string().min(8, 'CEP inválido.')),
    documentType: z.enum(['CPF', 'CNPJ']),
    documentNumber: z.string().min(11, 'O documento é inválido.'),
    password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
    registerAsSeller: z.boolean().optional().default(false),
    storeName: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    const digits = onlyDigits(data.documentNumber);
    if (data.documentType === 'CPF') {
      if (digits.length !== 11) ctx.addIssue({ code: 'custom', path: ['documentNumber'], message: 'CPF deve ter 11 dígitos.' });
      else if (!isValidCpf(digits)) ctx.addIssue({ code: 'custom', path: ['documentNumber'], message: 'CPF inválido.' });
    } else {
      if (digits.length !== 14) ctx.addIssue({ code: 'custom', path: ['documentNumber'], message: 'CNPJ deve ter 14 dígitos.' });
      else if (!isValidCnpj(digits)) ctx.addIssue({ code: 'custom', path: ['documentNumber'], message: 'CNPJ inválido.' });
    }
  });

export type UserRegistrationType = z.infer<typeof UserRegistrationSchema>;
export type UserRegistrationPayloadInput = z.input<typeof UserRegistrationSchema>;

export function buildFullAddressLine(data: z.infer<typeof UserRegistrationSchema>): string {
  const line1 = [data.street.trim(), data.addressNumber?.trim()].filter(Boolean).join(', ');
  const line2 = data.district.trim();
  const line3 = `${data.city.trim()} - ${data.state}`;
  const line4 = data.postalCode ? `CEP ${data.postalCode}` : '';
  return [line1, line2, line3, line4].filter(Boolean).join(' · ');
}
```

---

## 📄 app/actions/registration-actions.ts

```typescript
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import {
  UserRegistrationSchema,
  buildFullAddressLine,
  formatDocumentForStorage,
  onlyDigits,
  type UserRegistrationPayloadInput,
} from '@/schemas/registration-schema';
import { hashPlainPassword } from '@/lib/password-hash';

export type RegisterNewUserActionResult = {
  success: boolean;
  data?: {
    userId: string; fullName: string; documentType: 'CPF' | 'CNPJ';
    documentNumber: string; role: string; emailAddress: string; phoneNumber: string;
  };
  error?: string;
};

function buildStoreSlug(fullName: string, userId: string): string {
  const base = fullName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return `${base.length > 0 ? base : 'loja'}-${userId.slice(-6)}`;
}

export async function registerNewUserAction(payload: UserRegistrationPayloadInput): Promise<RegisterNewUserActionResult> {
  try {
    const result = UserRegistrationSchema.safeParse(payload);
    if (!result.success) return { success: false, error: result.error.issues[0]?.message };

    const data = result.data;
    const hashedPassword = hashPlainPassword(data.password);
    const rawDigits = onlyDigits(data.documentNumber);
    const formattedDocument = formatDocumentForStorage(rawDigits, data.documentType);
    const email = data.emailAddress.trim().toLowerCase();
    const rawPhone = onlyDigits(data.phoneNumber);
    const formattedPhone = rawPhone.length === 11
      ? `(${rawPhone.slice(0,2)}) ${rawPhone.slice(2,7)}-${rawPhone.slice(7,11)}`
      : rawPhone.length === 10
      ? `(${rawPhone.slice(0,2)}) ${rawPhone.slice(2,6)}-${rawPhone.slice(6,10)}`
      : data.phoneNumber;

    const createdUser = await prisma.$transaction(async (tx) => {
      const existing = await tx.user.findFirst({
        where: { OR: [{ email }, { document: formattedDocument }, { document: rawDigits }] },
      });
      if (existing) throw new Error('Já existe uma conta com este E-mail ou Documento.');

      const newUser = await tx.user.create({
        data: {
          name: data.fullName,
          email,
          whatsapp: formattedPhone,
          address: buildFullAddressLine(data),
          street: data.street.trim(),
          addressNumber: data.addressNumber?.trim() ?? null,
          addressComplement: data.addressComplement?.trim() ?? null,
          district: data.district.trim(),
          city: data.city.trim(),
          state: data.state,
          postalCode: data.postalCode,
          documentType: data.documentType,
          document: formattedDocument,
          passwordHash: hashedPassword,
          role: data.registerAsSeller ? 'seller' : 'customer',
        },
      });

      const storeName = data.storeName?.trim() || `${data.fullName.split(' ')[0] ?? 'Minha'} Store`;
      await tx.store.create({
        data: { name: storeName, slug: buildStoreSlug(data.fullName, newUser.id), nicheType: 'clothing', ownerId: newUser.id },
      });

      return newUser;
    });

    revalidatePath('/admin/manage');
    return {
      success: true,
      data: {
        userId: createdUser.id,
        fullName: createdUser.name ?? data.fullName,
        documentType: createdUser.documentType === 'CNPJ' ? 'CNPJ' : 'CPF',
        documentNumber: createdUser.document,
        role: createdUser.role,
        emailAddress: createdUser.email ?? email,
        phoneNumber: createdUser.whatsapp ?? data.phoneNumber,
      },
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro interno.' };
  }
}
```

---

## 📄 app/actions/auth-actions.ts

```typescript
'use server';

import { prisma } from '@/lib/prisma';
import { UserLoginSchema, UserLoginType } from '@/schemas/auth-schema';
import { verifyPlainPasswordAgainstHash } from '@/lib/password-hash';
import { onlyDigits, formatCpf, formatCnpj } from '@/schemas/registration-schema';

function normalizeEmail(e: string): string { return e.trim().toLowerCase(); }

function buildDocumentSearchVariants(raw: string): string[] {
  const digits = onlyDigits(raw);
  const variants = new Set<string>();
  variants.add(raw.trim());
  variants.add(digits);
  if (digits.length === 11) variants.add(formatCpf(digits));
  if (digits.length === 14) variants.add(formatCnpj(digits));
  return Array.from(variants).filter((v) => v.length > 0);
}

export async function authenticateUserAction(payload: UserLoginType): Promise<{
  success: boolean;
  data?: { userId: string; userName: string; role: string; documentType: 'CPF' | 'CNPJ'; documentNumber: string; emailAddress: string; phoneNumber: string; profilePictureUrl: string | null; };
  error?: string;
}> {
  try {
    const result = UserLoginSchema.safeParse(payload);
    if (!result.success) return { success: false, error: result.error.issues[0]?.message };

    const { documentOrEmail, password } = result.data;
    const emailVariant = normalizeEmail(documentOrEmail);
    const docVariants = buildDocumentSearchVariants(documentOrEmail);

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: emailVariant }, ...docVariants.map((v) => ({ document: v }))] },
    });

    if (!user) return { success: false, error: 'Usuário não encontrado.' };
    if (!verifyPlainPasswordAgainstHash(password, user.passwordHash)) return { success: false, error: 'Senha incorreta.' };

    return {
      success: true,
      data: {
        userId: user.id,
        userName: user.name ?? 'Usuário',
        role: user.role,
        documentType: user.documentType === 'CNPJ' ? 'CNPJ' : 'CPF',
        documentNumber: user.document,
        emailAddress: user.email ?? '',
        phoneNumber: user.whatsapp ?? '',
        profilePictureUrl: user.profilePictureUrl ?? null,
      },
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erro desconhecido.' };
  }
}
```
