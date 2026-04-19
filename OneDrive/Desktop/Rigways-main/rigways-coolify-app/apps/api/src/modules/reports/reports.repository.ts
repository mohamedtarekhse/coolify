import { prisma } from '@rigways/db';

export function countAssets(where: Record<string, unknown>) {
  return prisma.asset.count({ where: where as never });
}

export function countCertificates(where: Record<string, unknown>) {
  return prisma.certificate.count({ where: where as never });
}

export function countClients(where: Record<string, unknown>) {
  return prisma.client.count({ where: where as never });
}

export function countInspectors(where: Record<string, unknown>) {
  return prisma.inspector.count({ where: where as never });
}

export function listExpiringCertificates(where: Record<string, unknown>, take: number) {
  return prisma.certificate.findMany({
    where: where as never,
    orderBy: { expiryDate: 'asc' },
    take,
    include: {
      asset: { select: { id: true, assetNumber: true, name: true } },
    },
  });
}
