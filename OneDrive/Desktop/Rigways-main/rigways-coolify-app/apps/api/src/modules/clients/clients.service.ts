import { clientStatuses } from '@rigways/shared';

import { createClient, findClientByCode, findClientById, listClients, updateClient } from './clients.repository.js';

const industries = ['Oil & Gas', 'Construction', 'Manufacturing', 'Real Estate', 'Healthcare', 'Finance', 'Transport', 'Other'];

export async function getClients(query: URLSearchParams) {
  const limit = Math.min(Number(query.get('limit') || 50), 200);
  const offset = Number(query.get('offset') || 0);
  const status = query.get('status') || undefined;

  return {
    clients: await listClients({ status, limit, offset }),
    limit,
    offset,
  };
}

export function getClient(id: string) {
  return findClientById(id);
}

export async function createClientRecord(body: Record<string, unknown>) {
  const clientCode = String(body.client_id || '').trim().toUpperCase();
  const name = String(body.name || '').trim();
  const status = String(body.status || 'active');

  if (!clientCode || !name) {
    throw new Error('client_id and name are required');
  }
  if (!/^[A-Z0-9-]+$/.test(clientCode)) {
    throw new Error('client_id format is invalid');
  }
  if (!clientStatuses.includes(status as never)) {
    throw new Error('status is invalid');
  }
  if (body.industry && !industries.includes(String(body.industry))) {
    throw new Error('industry is invalid');
  }

  const duplicate = await findClientByCode(clientCode);
  if (duplicate) {
    const error = new Error('Client ID already exists');
    error.name = 'ConflictError';
    throw error;
  }

  return createClient({
    clientCode,
    name,
    nameAr: body.name_ar ? String(body.name_ar) : null,
    industry: body.industry ? String(body.industry) : null,
    contact: body.contact ? String(body.contact) : null,
    email: body.email ? String(body.email) : null,
    phone: body.phone ? String(body.phone) : null,
    country: body.country ? String(body.country) : null,
    city: body.city ? String(body.city) : null,
    status: status as 'active' | 'inactive' | 'suspended',
    notes: body.notes ? String(body.notes) : null,
    color: body.color ? String(body.color) : '#0070f2',
  });
}

export async function patchClientRecord(id: string, body: Record<string, unknown>) {
  const existing = await findClientById(id);
  if (!existing) return null;

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = String(body.name);
  if (body.name_ar !== undefined) patch.nameAr = body.name_ar ? String(body.name_ar) : null;
  if (body.industry !== undefined) patch.industry = body.industry ? String(body.industry) : null;
  if (body.contact !== undefined) patch.contact = body.contact ? String(body.contact) : null;
  if (body.email !== undefined) patch.email = body.email ? String(body.email) : null;
  if (body.phone !== undefined) patch.phone = body.phone ? String(body.phone) : null;
  if (body.country !== undefined) patch.country = body.country ? String(body.country) : null;
  if (body.city !== undefined) patch.city = body.city ? String(body.city) : null;
  if (body.notes !== undefined) patch.notes = body.notes ? String(body.notes) : null;
  if (body.color !== undefined) patch.color = body.color ? String(body.color) : '#0070f2';
  if (body.status !== undefined) {
    const status = String(body.status);
    if (!clientStatuses.includes(status as never)) throw new Error('status is invalid');
    patch.status = status;
  }

  return updateClient(id, patch);
}

export async function softDeleteClient(id: string) {
  const existing = await findClientById(id);
  if (!existing) return null;
  return updateClient(id, { status: 'inactive' });
}
