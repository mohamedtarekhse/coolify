import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var __rigwaysPrisma__: PrismaClient | undefined;
}

export const prisma =
  globalThis.__rigwaysPrisma__ ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__rigwaysPrisma__ = prisma;
}

export const databasePackage = {
  name: '@rigways/db',
  purpose: 'Prisma schema and database access layer for the Rigways rebuild',
};
