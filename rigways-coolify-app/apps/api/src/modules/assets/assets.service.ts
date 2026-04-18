import { assetStatuses, assetTypes } from '@rigways/shared';

import {
  countAssets,
  createAsset,
  deleteAsset,
  findAssetById,
  findClientById,
  findFunctionalLocationForAsset,
  generateNextAssetNumber,
  listAssets,
  updateAsset,
} from './assets.repository.js';

export async function getAssetStats(customerId: string | null, isRestricted: boolean) {
  const baseWhere = isRestricted && customerId ? { clientId: customerId } : {};
  const [total, operation, stacked] = await Promise.all([
    countAssets(baseWhere),
    countAssets({ ...baseWhere, status: 'operation' }),
    countAssets({ ...baseWhere, status: 'stacked' }),
  ]);

  return {
    total,
    operation,
    stacked,
    active: operation,
    maintenance: stacked,
    inactive: 0,
  };
}

export async function getAssets(query: URLSearchParams, customerId: string | null, isRestricted: boolean, canOverrideClient: boolean) {
  const limit = Math.min(Number(query.get('limit') || 50), 200);
  const offset = Number(query.get('offset') || 0);
  const clientId = isRestricted ? (customerId || undefined) : (canOverrideClient ? (query.get('client_id') || undefined) : undefined);
  const type = query.get('type');

  return {
    assets: await listAssets({
      status: query.get('status') || undefined,
      assetType: type ? toAssetEnum(type) : undefined,
      clientId,
      limit,
      offset,
    }),
    limit,
    offset,
  };
}

export async function getAsset(id: string) {
  return findAssetById(id);
}

export async function createAssetRecord(body: Record<string, unknown>) {
  const name = String(body.name || '').trim();
  const assetType = String(body.asset_type || '').trim();
  const status = String(body.status || 'operation');
  const clientId = body.client_id ? String(body.client_id) : null;
  const functionalLocation = body.functional_location ? String(body.functional_location) : null;

  if (!name || !assetType) throw new Error('name and asset_type are required');
  if (!assetTypes.includes(assetType as never)) throw new Error('asset_type is invalid');
  if (!assetStatuses.includes(status as never)) throw new Error('status is invalid');

  let functionalLocationId: string | null = null;
  if (functionalLocation) {
    if (!clientId) throw new Error('client_id is required when functional_location is set');
    const match = await findFunctionalLocationForAsset(functionalLocation, clientId);
    if (!match) throw new Error('Functional location not found for selected client');
    functionalLocationId = match.id;
  }

  if (clientId) {
    const client = await findClientById(clientId);
    if (!client) throw new Error('client_id is invalid');
  }

  const assetNumber = String(body.asset_number || '').trim().toUpperCase() || await generateNextAssetNumber();

  return createAsset({
    assetNumber,
    name,
    assetType: toAssetEnum(assetType),
    status,
    clientId,
    functionalLocationId,
    serialNumber: body.serial_number ? String(body.serial_number) : null,
    manufacturer: body.manufacturer ? String(body.manufacturer) : null,
    model: body.model ? String(body.model) : null,
    description: body.description ? String(body.description) : null,
    notes: body.notes ? String(body.notes) : null,
  });
}

export async function patchAssetRecord(id: string, body: Record<string, unknown>, role: string, customerId: string | null) {
  const existing = await findAssetById(id);
  if (!existing) return null;
  if (role === 'technician' && customerId && existing.clientId !== customerId) return 'FORBIDDEN';

  const patch: Record<string, unknown> = {};
  const allowedKeys = role === 'technician'
    ? ['status', 'notes']
    : ['name', 'asset_type', 'status', 'client_id', 'functional_location', 'serial_number', 'manufacturer', 'model', 'description', 'notes'];

  if (allowedKeys.includes('name') && body.name !== undefined) patch.name = String(body.name);
  if (allowedKeys.includes('asset_type') && body.asset_type !== undefined) {
    const assetType = String(body.asset_type);
    if (!assetTypes.includes(assetType as never)) throw new Error('asset_type is invalid');
    patch.assetType = toAssetEnum(assetType);
  }
  if (allowedKeys.includes('status') && body.status !== undefined) {
    const status = String(body.status);
    if (!assetStatuses.includes(status as never)) throw new Error('status is invalid');
    patch.status = status;
  }
  if (allowedKeys.includes('client_id') && body.client_id !== undefined) patch.clientId = body.client_id ? String(body.client_id) : null;
  if (allowedKeys.includes('serial_number') && body.serial_number !== undefined) patch.serialNumber = body.serial_number ? String(body.serial_number) : null;
  if (allowedKeys.includes('manufacturer') && body.manufacturer !== undefined) patch.manufacturer = body.manufacturer ? String(body.manufacturer) : null;
  if (allowedKeys.includes('model') && body.model !== undefined) patch.model = body.model ? String(body.model) : null;
  if (allowedKeys.includes('description') && body.description !== undefined) patch.description = body.description ? String(body.description) : null;
  if (allowedKeys.includes('notes') && body.notes !== undefined) patch.notes = body.notes ? String(body.notes) : null;

  const effectiveClientId = (patch.clientId as string | null | undefined) ?? existing.clientId ?? null;
  const functionalLocation = allowedKeys.includes('functional_location') && body.functional_location !== undefined
    ? (body.functional_location ? String(body.functional_location) : null)
    : undefined;

  if (functionalLocation !== undefined) {
    if (!functionalLocation) {
      patch.functionalLocationId = null;
    } else {
      if (!effectiveClientId) throw new Error('client_id is required when functional_location is set');
      const match = await findFunctionalLocationForAsset(functionalLocation, effectiveClientId);
      if (!match) throw new Error('Functional location not found for selected client');
      patch.functionalLocationId = match.id;
    }
  }

  return updateAsset(existing.id, patch);
}

export async function removeAsset(id: string) {
  const existing = await findAssetById(id);
  if (!existing) return null;
  await deleteAsset(existing.id);
  return existing;
}

function toAssetEnum(value: string) {
  switch (value) {
    case 'Hoisting Equipment': return 'Hoisting_Equipment';
    case 'Drilling Equipment': return 'Drilling_Equipment';
    case 'Mud System Low Pressure': return 'Mud_System_Low_Pressure';
    case 'Mud System High Pressure': return 'Mud_System_High_Pressure';
    case 'Well Control': return 'Well_Control';
    case 'Hoisting_Equipment':
    case 'Drilling_Equipment':
    case 'Mud_System_Low_Pressure':
    case 'Mud_System_High_Pressure':
    case 'Wirelines':
    case 'Structure':
    case 'Well_Control':
    case 'Tubular':
      return value;
    default: return value;
  }
}
