import { prisma } from '@rigways/db';

export function listCertificateFiles(filters: {
  clientId?: string;
  certType?: string;
  jobNumber?: string;
  filename?: string;
  limit: number;
  offset: number;
}) {
  return prisma.certificateFile.findMany({
    where: {
      deletedAt: null,
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
      ...(filters.certType ? { certType: filters.certType as never } : {}),
      ...(filters.jobNumber ? { jobNumber: filters.jobNumber } : {}),
      ...(filters.filename ? { fileName: { contains: filters.filename } } : {}),
    },
    include: {
      uploadedBy: { select: { id: true, username: true, name: true } },
    },
    orderBy: { uploadedAt: 'desc' },
    skip: filters.offset,
    take: filters.limit,
  });
}

export function listLegacyCertificateFiles(limit: number) {
  return prisma.certificate.findMany({
    where: {
      fileUrl: { not: null },
    },
    select: {
      id: true,
      certType: true,
      clientId: true,
      fileName: true,
      fileUrl: true,
      uploadedById: true,
      createdAt: true,
      certNumber: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export function findCertificateFileById(id: string) {
  return prisma.certificateFile.findUnique({
    where: { id },
  });
}

export function findCertificateFileByStorageKey(storageKey: string) {
  return prisma.certificateFile.findFirst({
    where: { storageKey },
  });
}

export function setCertificateFileCurrent(id: string, certificateId: string) {
  return prisma.$transaction([
    prisma.certificateFile.updateMany({
      where: { certificateId },
      data: { isCurrent: false },
    }),
    prisma.certificateFile.update({
      where: { id },
      data: { isCurrent: true },
    }),
  ]);
}

export function softDeleteCertificateFile(id: string) {
  return prisma.certificateFile.update({
    where: { id },
    data: {
      status: 'deleted',
      deletedAt: new Date(),
      isCurrent: false,
    },
  });
}

export function hardDeleteCertificateFile(id: string) {
  return prisma.certificateFile.delete({
    where: { id },
  });
}
