import { prisma } from '@rigways/db';

type ListFilters = {
  status?: string;
  assetType?: string;
  clientId?: string;
  limit: number;
  offset: number;
};

export function listAssets(filters: ListFilters) {
  return prisma.asset.findMany({
    where: {
      ...(filters.status ? { status: filters.status as never } : {}),
      ...(filters.assetType ? { assetType: filters.assetType as never } : {}),
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    skip: filters.offset,
    take: filters.limit,
    include: {
      client: { select: { id: true, clientCode: true, name: true } },
      functionalLocation: { select: { id: true, flCode: true, name: true } },
    },
  });
}

export function countAssets(where: Record<string, unknown> = {}) {
  return prisma.asset.count({ where });
}

export function findAssetById(id: string) {
  return prisma.asset.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, clientCode: true, name: true } },
      functionalLocation: { select: { id: true, flCode: true, name: true, clientId: true } },
    },
  });
}

export function findFunctionalLocationForAsset(identifier: string, clientId: string) {
  return prisma.functionalLocation.findFirst({
    where: {
      clientId,
      OR: [
        { id: identifier },
        { flCode: identifier },
        { name: identifier },
      ],
    },
  });
}

export function findClientById(id: string) {
  return prisma.client.findUnique({ where: { id } });
}

export async function generateNextAssetNumber() {
  const latest = await prisma.asset.findMany({
    select: { assetNumber: true },
    orderBy: { createdAt: 'desc' },
    take: 5000,
  });

  let max = 0;
  for (const row of latest) {
    const match = String(row.assetNumber || '').toUpperCase().match(/^AST-(\d+)$/);
    if (!match) continue;
    const value = Number(match[1]);
    if (!Number.isNaN(value) && value > max) max = value;
  }
  return `AST-${String(max + 1).padStart(4, '0')}`;
}

export function createAsset(data: Record<string, unknown>) {
  return prisma.asset.create({ data: data as never });
}

export function updateAsset(id: string, data: Record<string, unknown>) {
  return prisma.asset.update({
    where: { id },
    data: data as never,
  });
}

export function deleteAsset(id: string) {
  return prisma.asset.delete({ where: { id } });
}
