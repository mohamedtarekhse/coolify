import { prisma } from '@rigways/db';

export function listJobs(filters: { status?: string; clientId?: string; limit: number; offset: number }) {
  return prisma.job.findMany({
    where: {
      ...(filters.status ? { status: filters.status as never } : {}),
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    skip: filters.offset,
    take: filters.limit,
    include: {
      client: { select: { id: true, clientCode: true, name: true } },
      functionalLocation: { select: { id: true, flCode: true, name: true, clientId: true } },
    },
  });
}

export function findJobById(id: string) {
  return prisma.job.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, clientCode: true, name: true } },
      functionalLocation: { select: { id: true, flCode: true, name: true, clientId: true } },
    },
  });
}

export function findFunctionalLocationForJob(identifier: string, clientId: string) {
  return prisma.functionalLocation.findFirst({
    where: {
      clientId,
      OR: [{ id: identifier }, { flCode: identifier }, { name: identifier }],
    },
  });
}

export function createJob(data: Record<string, unknown>) {
  return prisma.job.create({ data: data as never });
}

export function updateJob(id: string, data: Record<string, unknown>) {
  return prisma.job.update({ where: { id }, data: data as never });
}

export function createJobInspector(data: Record<string, unknown>) {
  return prisma.jobInspector.create({ data: data as never });
}

export function listJobInspectors(jobId: string) {
  return prisma.jobInspector.findMany({
    where: { jobId },
    orderBy: { assignedAt: 'asc' },
    include: {
      inspector: { select: { id: true, inspectorNumber: true, name: true } },
    },
  });
}

export function createJobEvent(data: Record<string, unknown>) {
  return prisma.jobEvent.create({ data: data as never });
}

export function findInspectorById(id: string) {
  return prisma.inspector.findUnique({
    where: { id },
    select: { id: true },
  });
}
