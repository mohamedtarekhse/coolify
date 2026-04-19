import { prisma } from '@rigways/db';

type ListFilters = {
  approvalStatus?: string;
  certType?: string;
  assetId?: string;
  clientId?: string;
  limit: number;
  offset: number;
};

export function listCertificates(filters: ListFilters) {
  return prisma.certificate.findMany({
    where: {
      ...(filters.approvalStatus ? { approvalStatus: filters.approvalStatus as never } : {}),
      ...(filters.certType ? { certType: filters.certType as never } : {}),
      ...(filters.assetId ? { assetId: filters.assetId } : {}),
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
    },
    orderBy: { expiryDate: 'asc' },
    skip: filters.offset,
    take: filters.limit,
    include: {
      asset: { select: { id: true, assetNumber: true, name: true, clientId: true } },
      inspector: { select: { id: true, name: true, inspectorNumber: true } },
      uploadedBy: { select: { id: true, username: true, name: true } },
      reviewedBy: { select: { id: true, username: true, name: true } },
    },
  });
}

export function findCertificateById(id: string) {
  return prisma.certificate.findUnique({
    where: { id },
    include: {
      asset: { select: { id: true, assetNumber: true, name: true, clientId: true } },
      inspector: { select: { id: true, name: true, inspectorNumber: true } },
      uploadedBy: { select: { id: true, username: true, name: true } },
      reviewedBy: { select: { id: true, username: true, name: true } },
    },
  });
}

export function findCertificateFileForView(id: string) {
  return prisma.certificate.findUnique({
    where: { id },
    select: {
      id: true,
      fileName: true,
      fileUrl: true,
      clientId: true,
    },
  });
}

export function findAssetForCertificate(assetId: string) {
  return prisma.asset.findUnique({
    where: { id: assetId },
    select: { id: true, clientId: true },
  });
}

export function createCertificate(data: Record<string, unknown>) {
  return prisma.certificate.create({
    data: data as never,
  });
}

export function updateCertificate(id: string, data: Record<string, unknown>) {
  return prisma.certificate.update({
    where: { id },
    data: data as never,
  });
}

export function deleteCertificate(id: string) {
  return prisma.certificate.delete({
    where: { id },
  });
}

export async function generateNextCertificateNumber() {
  const latest = await prisma.certificate.findMany({
    select: { certNumber: true },
    orderBy: { createdAt: 'desc' },
    take: 5000,
  });

  let max = 0;
  for (const row of latest) {
    const match = String(row.certNumber || '').toUpperCase().match(/^CERT-(\d+)$/);
    if (!match) continue;
    const value = Number(match[1]);
    if (!Number.isNaN(value) && value > max) max = value;
  }
  return `CERT-${String(max + 1).padStart(4, '0')}`;
}

export function createCertificateHistory(data: Record<string, unknown>) {
  return prisma.certificateHistory.create({
    data: data as never,
  });
}

export function countCertificates(where: Record<string, unknown>) {
  return prisma.certificate.count({ where });
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
