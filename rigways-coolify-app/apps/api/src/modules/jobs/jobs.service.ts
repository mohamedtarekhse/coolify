import { notifyRoles } from '../notifications/notifications.service.js';
import {
  createJob,
  createJobEvent,
  createJobInspector,
  findFunctionalLocationForJob,
  findInspectorById,
  findJobById,
  listJobInspectors,
  listJobs,
  updateJob,
} from './jobs.repository.js';

export async function getJobs(query: URLSearchParams, customerId: string | null, isAdminOrManager: boolean) {
  const limit = Math.min(Number(query.get('limit') || 50), 200);
  const offset = Number(query.get('offset') || 0);
  const clientId = !isAdminOrManager ? (customerId || undefined) : (query.get('client_id') || undefined);

  return {
    jobs: await listJobs({ status: query.get('status') || undefined, clientId, limit, offset }),
    limit,
    offset,
  };
}

export function getJob(id: string) {
  return findJobById(id);
}

export async function createJobRecord(body: Record<string, unknown>, sessionUser: { id: string; name: string }) {
  const clientId = String(body.client_id || '').trim();
  const functionalLocation = String(body.functional_location || '').trim();
  const inspectorIds = Array.isArray(body.inspector_ids) ? body.inspector_ids.filter(Boolean).map(String) : [];

  if (!clientId || !functionalLocation) throw new Error('client_id and functional_location are required');
  if (!inspectorIds.length) throw new Error('At least one inspector is required');

  const location = await findFunctionalLocationForJob(functionalLocation, clientId);
  if (!location) throw new Error('functional_location must belong to selected client');

  for (const inspectorId of inspectorIds) {
    const inspector = await findInspectorById(inspectorId);
    if (!inspector) throw new Error('One or more inspector_ids are invalid');
  }

  const job = await createJob({
    jobNumber: String(body.job_number || '').trim() || buildJobNumber(),
    clientId,
    functionalLocationId: location.id,
    title: body.title ? String(body.title) : null,
    notes: body.notes ? String(body.notes) : null,
    status: 'active',
    createdById: sessionUser.id,
  });

  for (const inspectorId of inspectorIds) {
    try {
      await createJobInspector({ jobId: job.id, inspectorId, assignedById: sessionUser.id });
    } catch {}
  }

  await addJobEvent(job.id, sessionUser.id, 'created', { inspector_ids: inspectorIds });
  return job;
}

export async function patchJobRecord(id: string, body: Record<string, unknown>, sessionUser: { id: string; role: string; name: string; customerId: string | null }) {
  const existing = await findJobById(id);
  if (!existing) return null;

  const isAdminOrManager = ['admin', 'manager'].includes(sessionUser.role);
  const isTechnician = sessionUser.role === 'technician';

  if (!isAdminOrManager && (!sessionUser.customerId || existing.clientId !== sessionUser.customerId)) return 'FORBIDDEN';

  const action = String(body.action || '').trim();
  let patch: Record<string, unknown> = {};

  if (action === 'mark_done') {
    if (!isTechnician && !isAdminOrManager) return 'FORBIDDEN';
    patch = { status: 'technician_done', finishedById: sessionUser.id, finishedAt: new Date() };
    await notifyRoles(['admin', 'manager'], 'job_finished', 'Job Finished by Technician', `Job ${existing.jobNumber} is marked as finished by ${sessionUser.name}.`, 'job', id, [sessionUser.id]);
    await addJobEvent(id, sessionUser.id, 'technician_done');
  } else if (action === 'close') {
    if (!isAdminOrManager) return 'FORBIDDEN';
    patch = { status: 'closed', closedById: sessionUser.id, closedAt: new Date() };
    await addJobEvent(id, sessionUser.id, 'closed', { reason: body.reason || null });
  } else if (action === 'reopen') {
    if (!isAdminOrManager) return 'FORBIDDEN';
    patch = { status: 'reopened', reopenedById: sessionUser.id, reopenedAt: new Date() };
    await addJobEvent(id, sessionUser.id, 'reopened', { reason: body.reason || null });
  } else {
    if (!isAdminOrManager) return 'FORBIDDEN';
    if (body.title !== undefined) patch.title = body.title ? String(body.title) : null;
    if (body.notes !== undefined) patch.notes = body.notes ? String(body.notes) : null;
    if (body.functional_location !== undefined) {
      const location = body.functional_location ? await findFunctionalLocationForJob(String(body.functional_location), existing.clientId) : null;
      if (body.functional_location && !location) throw new Error('functional_location must belong to selected client');
      patch.functionalLocationId = location?.id || null;
    }
  }

  return updateJob(existing.id, patch);
}

export function getJobInspectors(jobId: string) {
  return listJobInspectors(jobId);
}

export async function assignJobInspectors(jobId: string, inspectorIds: string[], userId: string) {
  if (!inspectorIds.length) throw new Error('inspector_ids is required');

  for (const inspectorId of inspectorIds) {
    const inspector = await findInspectorById(inspectorId);
    if (!inspector) throw new Error('One or more inspector_ids are invalid');
    try {
      await createJobInspector({ jobId, inspectorId, assignedById: userId });
    } catch {}
  }

  await addJobEvent(jobId, userId, 'inspectors_assigned', { inspector_ids: inspectorIds });
  return { assigned: inspectorIds.length };
}

async function addJobEvent(jobId: string, actorUserId: string, eventType: string, payload: Record<string, unknown> = {}) {
  try {
    await createJobEvent({ jobId, actorUserId, eventType, payloadJson: payload });
  } catch {}
}

function buildJobNumber() {
  const year = new Date().getUTCFullYear();
  const random = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
  return `JOB-${year}-${random}`;
}
