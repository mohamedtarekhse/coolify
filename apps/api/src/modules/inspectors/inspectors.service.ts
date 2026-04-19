import {
  createInspector,
  deleteInspector,
  findInspectorByEmail,
  findInspectorById,
  generateNextInspectorNumber,
  listInspectors,
  updateInspector,
} from './inspectors.repository.js';

const allowedStatuses = ['active', 'inactive'] as const;

export async function getInspectors(query: URLSearchParams) {
  const limit = Math.min(Number(query.get('limit') || 50), 200);
  const offset = Number(query.get('offset') || 0);
  const status = query.get('status') || undefined;

  return {
    inspectors: await listInspectors({ status, limit, offset }),
    limit,
    offset,
  };
}

export function getInspector(id: string) {
  return findInspectorById(id);
}

export async function createInspectorRecord(body: Record<string, unknown>) {
  const name = String(body.name || '').trim();
  if (!name) throw new Error('name is required');

  if (body.email) {
    const email = String(body.email).trim().toLowerCase();
    const duplicate = await findInspectorByEmail(email);
    if (duplicate) {
      const error = new Error('Email already in use');
      error.name = 'ConflictError';
      throw error;
    }
  }

  const status = String(body.status || 'active');
  if (!allowedStatuses.includes(status as never)) throw new Error('status is invalid');

  return createInspector({
    inspectorNumber: await generateNextInspectorNumber(),
    name,
    title: body.title ? String(body.title) : null,
    email: body.email ? String(body.email).trim().toLowerCase() : null,
    phone: body.phone ? String(body.phone) : null,
    status,
    experienceYears: body.experience_years !== undefined && body.experience_years !== null && body.experience_years !== ''
      ? Number(body.experience_years)
      : null,
    experienceDesc: body.experience_desc ? String(body.experience_desc) : null,
    cvFile: body.cv_file ? String(body.cv_file) : null,
    cvUrl: body.cv_url ? String(body.cv_url) : null,
    color: body.color ? String(body.color) : '#0070f2',
    education: Array.isArray(body.education) ? body.education : [],
    trainings: Array.isArray(body.trainings) ? body.trainings : [],
    trainingCerts: Array.isArray(body.training_certs) ? body.training_certs : [],
  });
}

export async function patchInspectorRecord(id: string, body: Record<string, unknown>) {
  const existing = await findInspectorById(id);
  if (!existing) return null;

  if (body.email) {
    const email = String(body.email).trim().toLowerCase();
    const duplicate = await findInspectorByEmail(email);
    if (duplicate && duplicate.id !== id) {
      const error = new Error('Email already in use');
      error.name = 'ConflictError';
      throw error;
    }
  }

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = String(body.name);
  if (body.title !== undefined) patch.title = body.title ? String(body.title) : null;
  if (body.email !== undefined) patch.email = body.email ? String(body.email).trim().toLowerCase() : null;
  if (body.phone !== undefined) patch.phone = body.phone ? String(body.phone) : null;
  if (body.status !== undefined) {
    const status = String(body.status);
    if (!allowedStatuses.includes(status as never)) throw new Error('status is invalid');
    patch.status = status;
  }
  if (body.experience_years !== undefined) {
    patch.experienceYears = body.experience_years !== null && body.experience_years !== ''
      ? Number(body.experience_years)
      : null;
  }
  if (body.experience_desc !== undefined) patch.experienceDesc = body.experience_desc ? String(body.experience_desc) : null;
  if (body.cv_file !== undefined) patch.cvFile = body.cv_file ? String(body.cv_file) : null;
  if (body.cv_url !== undefined) patch.cvUrl = body.cv_url ? String(body.cv_url) : null;
  if (body.color !== undefined) patch.color = body.color ? String(body.color) : '#0070f2';
  if (Array.isArray(body.education)) patch.education = body.education;
  if (Array.isArray(body.trainings)) patch.trainings = body.trainings;
  if (Array.isArray(body.training_certs)) patch.trainingCerts = body.training_certs;

  return updateInspector(id, patch);
}

export async function removeInspector(id: string) {
  const existing = await findInspectorById(id);
  if (!existing) return null;
  await deleteInspector(id);
  return { id, deleted: true };
}

export async function getInspectorCv(id: string) {
  const existing = await findInspectorById(id);
  if (!existing) return null;
  return {
    cvFile: existing.cvFile,
    cvUrl: existing.cvUrl,
  };
}
