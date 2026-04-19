import { prisma } from '@rigways/db';

type ListClientsFilters = {
  status?: string;
  limit: number;
  offset: number;
};

export function listClients(filters: ListClientsFilters) {
  return prisma.client.findMany({
    where: {
      ...(filters.status ? { status: filters.status as never } : {}),
    },
    orderBy: { name: 'asc' },
    skip: filters.offset,
    take: filters.limit,
  });
}

export function findClientById(id: string) {
  return prisma.client.findUnique({ where: { id } });
}

export function findClientByCode(clientCode: string) {
  return prisma.client.findUnique({ where: { clientCode } });
}

export function createClient(data: {
  clientCode: string;
  name: string;
  nameAr?: string | null;
  industry?: string | null;
  contact?: string | null;
  email?: string | null;
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  status?: 'active' | 'inactive' | 'suspended';
  notes?: string | null;
  color?: string | null;
}) {
  return prisma.client.create({
    data: {
      clientCode: data.clientCode,
      name: data.name,
      nameAr: data.nameAr,
      industry: data.industry,
      contact: data.contact,
      email: data.email,
      phone: data.phone,
      country: data.country,
      city: data.city,
      status: data.status,
      notes: data.notes,
      color: data.color || '#0070f2',
    },
  });
}

export function updateClient(id: string, data: Record<string, unknown>) {
  return prisma.client.update({
    where: { id },
    data,
  });
}
