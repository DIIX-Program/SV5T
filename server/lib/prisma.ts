// ============================================
// Prisma Client - Serverless Optimized
// Usage: import { prisma } from '@/lib/prisma'
// ============================================

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Singleton pattern để tránh tạo multiple instances
const globalForPrisma = global as unknown as { prisma: PrismaClient };

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ============================================
// Connection Management for Serverless
// ============================================

/**
 * Graceful disconnect for serverless functions
 * Call this in API route handlers before response
 */
export async function disconnectPrisma() {
  try {
    await prisma.$disconnect();
  } catch (e) {
    console.error('Failed to disconnect Prisma:', e);
  }
}

/**
 * Wrapper for serverless API routes
 * Automatically handles connection cleanup
 */
export function withPrismaDisconnect(
  handler: (req: any, res: any) => Promise<void>
) {
  return async (req: any, res: any) => {
    try {
      await handler(req, res);
    } finally {
      await disconnectPrisma();
    }
  };
}

export default prisma;
