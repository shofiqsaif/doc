import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  adapter: PrismaBetterSqlite3 | undefined;
};

const dbUrl = process.env.DATABASE_URL?.replace('file:', '') || './dev.db';
const adapter = globalForPrisma.adapter ?? new PrismaBetterSqlite3({ url: dbUrl });
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
  globalForPrisma.adapter = adapter;
}
