import { prisma } from '@rigways/db';

type ListFilters = {
  status?: string;
  type?: string;
  clientId?: string;
  limit: number;
  offset: number;
};

export function listFunctionalLocations(filters: ListFilters) {
  return prisma.functionalLocation.findMany({
    where: {
      ...(filters.status ? { status: filters.status as never } : {}),
      ...(filters.type ? { type: filters.type as never } : {}),
      ...(filters.clientId ? { clientId: filters.clientId } : {}),
    },
    orderBy: { flCode: 'asc' },
    skip: filters.offset,
    take: filters.limit,
  });
}

export function findFunctionalLocationById(id: string) {
  return prisma.functionalLocation.findUnique({ where: { id } });
}

export function findFunctionalLocationByCode(flCode: string) {
  return prisma.functionalLocation.findUnique({ where: { flCode } });
}

export function createFunctionalLocation(data: {
  flCode: string;
  name: string;
  type: 'Rig' | 'Workshop' | 'Yard' | 'Warehouse' | 'Other';
  clientId?: string | null;
  status?: 'active' | 'inactive';
  notes?: string | null;
}) {
  return prisma.functionalLocation.create({ data });
}

export function updateFunctionalLocation(id: string, data: Record<string, unknown>) {
  return prisma.functionalLocation.update({
    where: { id },
    data,
  });
}

export function deleteFunctionalLocation(id: string) {
  return prisma.functionalLocation.delete({ where: { id } });
}
