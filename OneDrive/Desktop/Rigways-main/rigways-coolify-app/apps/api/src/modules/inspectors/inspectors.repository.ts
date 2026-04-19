import { prisma } from '@rigways/db';

export function listInspectors(filters: { status?: string; limit: number; offset: number }) {
  return prisma.inspector.findMany({
    where: {
      ...(filters.status ? { status: filters.status as never } : {}),
    },
    orderBy: { inspectorNumber: 'asc' },
    skip: filters.offset,
    take: filters.limit,
  });
}

export function findInspectorById(id: string) {
  return prisma.inspector.findUnique({
    where: { id },
  });
}

export function findInspectorByEmail(email: string) {
  return prisma.inspector.findFirst({
    where: {
      email: {
        equals: email,
      },
    },
  });
}

export async function generateNextInspectorNumber() {
  const latest = await prisma.inspector.findMany({
    select: { inspectorNumber: true },
    orderBy: { createdAt: 'desc' },
    take: 5000,
  });

  let max = 0;
  for (const row of latest) {
    const match = String(row.inspectorNumber || '').toUpperCase().match(/^INS-(\d+)$/);
    if (!match) continue;
    const value = Number(match[1]);
    if (!Number.isNaN(value) && value > max) max = value;
  }
  return `INS-${String(max + 1).padStart(3, '0')}`;
}

export function createInspector(data: Record<string, unknown>) {
  return prisma.inspector.create({
    data: data as never,
  });
}

export function updateInspector(id: string, data: Record<string, unknown>) {
  return prisma.inspector.update({
    where: { id },
    data: data as never,
  });
}

export function deleteInspector(id: string) {
  return prisma.inspector.delete({
    where: { id },
  });
}
