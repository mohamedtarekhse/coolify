import { functionalLocationTypes } from '@rigways/shared';

import {
  createFunctionalLocation,
  deleteFunctionalLocation,
  findFunctionalLocationByCode,
  findFunctionalLocationById,
  listFunctionalLocations,
  updateFunctionalLocation,
} from './functional-locations.repository.js';

const allowedStatuses = ['active', 'inactive'] as const;

export async function getFunctionalLocations(query: URLSearchParams, customerId: string | null, isAdminOrManager: boolean) {
  const limit = Math.min(Number(query.get('limit') || 100), 500);
  const offset = Number(query.get('offset') || 0);
  const filters = {
    status: query.get('status') || undefined,
    type: query.get('type') || undefined,
    clientId: isAdminOrManager ? (query.get('client_id') || undefined) : (customerId || undefined),
    limit,
    offset,
  };

  return {
    functional_locations: await listFunctionalLocations(filters),
    limit,
    offset,
  };
}

export async function getFunctionalLocation(identifier: string) {
  const byId = await findFunctionalLocationById(identifier);
  if (byId) return byId;
  return findFunctionalLocationByCode(identifier.toUpperCase());
}

export async function createFunctionalLocationRecord(body: Record<string, unknown>) {
  const flCode = String(body.fl_id || '').trim().toUpperCase();
  const name = String(body.name || '').trim();
  const type = String(body.type || '');
  const clientId = body.client_id ? String(body.client_id) : null;
  const status = String(body.status || 'active');

  if (!flCode || !name || !type || !clientId) {
    throw new Error('fl_id, name, type, and client_id are required');
  }
  if (!functionalLocationTypes.includes(type as never)) {
    throw new Error('type is invalid');
  }
  if (!allowedStatuses.includes(status as never)) {
    throw new Error('status is invalid');
  }
  if (await findFunctionalLocationByCode(flCode)) {
    const error = new Error('Functional Location ID already exists');
    error.name = 'ConflictError';
    throw error;
  }

  return createFunctionalLocation({
    flCode,
    name,
    type: type as 'Rig' | 'Workshop' | 'Yard' | 'Warehouse' | 'Other',
    clientId,
    status: status as 'active' | 'inactive',
    notes: body.notes ? String(body.notes) : null,
  });
}

export async function patchFunctionalLocationRecord(identifier: string, body: Record<string, unknown>) {
  const existing = (await findFunctionalLocationById(identifier)) || (await findFunctionalLocationByCode(identifier.toUpperCase()));
  if (!existing) return null;

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = String(body.name);
  if (body.type !== undefined) {
    const type = String(body.type);
    if (!functionalLocationTypes.includes(type as never)) throw new Error('type is invalid');
    patch.type = type;
  }
  if (body.status !== undefined) {
    const status = String(body.status);
    if (!allowedStatuses.includes(status as never)) throw new Error('status is invalid');
    patch.status = status;
  }
  if (body.client_id !== undefined) patch.clientId = body.client_id ? String(body.client_id) : null;
  if (body.notes !== undefined) patch.notes = body.notes ? String(body.notes) : null;

  return updateFunctionalLocation(existing.id, patch);
}

export async function removeFunctionalLocation(identifier: string) {
  const existing = (await findFunctionalLocationById(identifier)) || (await findFunctionalLocationByCode(identifier.toUpperCase()));
  if (!existing) return null;
  await deleteFunctionalLocation(existing.id);
  return existing;
}
