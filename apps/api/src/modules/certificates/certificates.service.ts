import { approvalStatuses, certificateTypes } from '@rigways/shared';

import {
  countCertificates,
  createCertificate,
  createCertificateHistory,
  deleteCertificate,
  findAssetForCertificate,
  findCertificateById,
  findCertificateFileForView,
  generateNextCertificateNumber,
  listCertificates,
  listExpiringCertificates,
  updateCertificate,
} from './certificates.repository.js';

export async function getCertificateStats(customerId: string | null, restricted: boolean) {
  const today = new Date();
  const soon = new Date(Date.now() + 30 * 86400000);
  const baseWhere = restricted && customerId ? { clientId: customerId } : {};

  const [total, valid, expiring, expired, pending] = await Promise.all([
    countCertificates(baseWhere),
    countCertificates({ ...baseWhere, approvalStatus: 'approved', expiryDate: { gt: soon } }),
    countCertificates({ ...baseWhere, approvalStatus: 'approved', expiryDate: { gte: today, lte: soon } }),
    countCertificates({ ...baseWhere, approvalStatus: 'approved', expiryDate: { lt: today } }),
    countCertificates({ ...baseWhere, approvalStatus: 'pending' }),
  ]);

  return { total, valid, expiring, expired, pending };
}

export async function getExpiringCertificates(days: number, customerId: string | null, restricted: boolean) {
  const today = new Date();
  const cutoff = new Date(Date.now() + days * 86400000);
  const where = {
    approvalStatus: 'approved',
    expiryDate: { gte: today, lte: cutoff },
    ...(restricted && customerId ? { clientId: customerId } : {}),
  };

  return {
    certificates: await listExpiringCertificates(where, 200),
    days,
  };
}

export async function getCertificates(query: URLSearchParams, customerId: string | null, restricted: boolean, canOverrideClient: boolean) {
  const limit = Math.min(Number(query.get('limit') || 50), 200);
  const offset = Number(query.get('offset') || 0);
  const clientId = restricted ? (customerId || undefined) : (canOverrideClient ? (query.get('client_id') || undefined) : undefined);
  const certType = query.get('cert_type');

  return {
    certificates: await listCertificates({
      approvalStatus: query.get('approval_status') || undefined,
      certType: certType ? toCertificateEnum(certType) : undefined,
      assetId: query.get('asset_id') || undefined,
      clientId,
      limit,
      offset,
    }),
    limit,
    offset,
  };
}

export function getCertificate(id: string) {
  return findCertificateById(id);
}

export function getCertificateFileView(id: string) {
  return findCertificateFileForView(id);
}

export async function createCertificateRecord(body: Record<string, unknown>, sessionUserId: string, role: string, customerId: string | null) {
  const name = String(body.name || '').trim();
  const certType = String(body.cert_type || '').trim();
  const assetId = String(body.asset_id || '').trim();
  const issuedBy = String(body.issued_by || '').trim();
  const issueDate = String(body.issue_date || '').trim();
  const expiryDate = String(body.expiry_date || '').trim();

  if (!name || !certType || !assetId || !issuedBy || !issueDate || !expiryDate) {
    throw new Error('name, cert_type, asset_id, issued_by, issue_date, and expiry_date are required');
  }
  if (!certificateTypes.includes(certType as never)) throw new Error('cert_type is invalid');
  if (certType === 'TUBULAR' && !String(body.related_standard || '').trim()) {
    throw new Error('related_standard is required for TUBULAR certificates');
  }

  const asset = await findAssetForCertificate(assetId);
  if (!asset) throw new Error('asset_id is invalid');
  if (role === 'technician' && customerId && asset.clientId !== customerId) {
    const error = new Error('Forbidden');
    error.name = 'ForbiddenError';
    throw error;
  }

  const certNumber = await generateNextCertificateNumber();
  const approvalStatus = role === 'admin' ? 'approved' : 'pending';

  const certificate = await createCertificate({
    certNumber,
    name,
    certType: toCertificateEnum(certType),
    assetId,
    clientId: body.client_id ? String(body.client_id) : asset.clientId || null,
    inspectorId: body.inspector_id ? String(body.inspector_id) : null,
    issuedBy,
    relatedStandard: body.related_standard ? String(body.related_standard) : null,
    issueDate: new Date(issueDate),
    expiryDate: new Date(expiryDate),
    fileName: body.file_name ? String(body.file_name) : null,
    fileUrl: body.file_url ? String(body.file_url) : null,
    notes: body.notes ? String(body.notes) : null,
    approvalStatus,
    uploadedById: sessionUserId,
  });

  await writeHistory(certificate, sessionUserId, 'create');
  return certificate;
}

export async function patchCertificateRecord(id: string, body: Record<string, unknown>, sessionUserId: string, role: string) {
  const existing = await findCertificateById(id);
  if (!existing) return null;

  const isApprover = ['admin', 'manager'].includes(role);
  const isUploader = existing.uploadedById === sessionUserId;
  if (!isApprover && !isUploader) {
    const error = new Error('Forbidden');
    error.name = 'ForbiddenError';
    throw error;
  }
  if (isUploader && !isApprover && existing.approvalStatus !== 'pending') {
    throw new Error('Cannot edit a reviewed certificate');
  }
  if (!isApprover && body.approval_status !== undefined) {
    const error = new Error('Forbidden');
    error.name = 'ForbiddenError';
    throw error;
  }

  const patch: Record<string, unknown> = {};
  if (body.name !== undefined) patch.name = String(body.name);
  if (body.cert_type !== undefined) {
    const certType = String(body.cert_type);
    if (!certificateTypes.includes(certType as never)) throw new Error('cert_type is invalid');
    patch.certType = toCertificateEnum(certType);
  }
  if (body.issued_by !== undefined) patch.issuedBy = String(body.issued_by);
  if (body.issue_date !== undefined) patch.issueDate = new Date(String(body.issue_date));
  if (body.expiry_date !== undefined) patch.expiryDate = new Date(String(body.expiry_date));
  if (body.file_name !== undefined) patch.fileName = body.file_name ? String(body.file_name) : null;
  if (body.file_url !== undefined) patch.fileUrl = body.file_url ? String(body.file_url) : null;
  if (body.notes !== undefined) patch.notes = body.notes ? String(body.notes) : null;
  if (body.related_standard !== undefined) patch.relatedStandard = body.related_standard ? String(body.related_standard) : null;
  if (body.inspector_id !== undefined) patch.inspectorId = body.inspector_id ? String(body.inspector_id) : null;
  if (isApprover && body.approval_status !== undefined) {
    const approvalStatus = String(body.approval_status);
    if (!approvalStatuses.includes(approvalStatus as never)) throw new Error('approval_status is invalid');
    patch.approvalStatus = approvalStatus;
    patch.reviewedById = sessionUserId;
    patch.reviewedAt = new Date();
    patch.rejectionReason = body.rejection_reason ? String(body.rejection_reason) : null;
  }

  const updated = await updateCertificate(existing.id, patch);
  await writeHistory(updated, sessionUserId, 'update');
  return updated;
}

export async function removeCertificate(id: string, sessionUserId: string) {
  const existing = await findCertificateById(id);
  if (!existing) return null;
  await writeHistory(existing, sessionUserId, 'record_deleted');
  await deleteCertificate(existing.id);
  return existing;
}

async function writeHistory(certificate: Record<string, unknown>, sessionUserId: string, actionType: string) {
  await createCertificateHistory({
    certificateId: String(certificate.id),
    certNumber: certificate.certNumber ? String(certificate.certNumber) : null,
    name: certificate.name ? String(certificate.name) : null,
    certType: certificate.certType || null,
    relatedStandard: certificate.relatedStandard ? String(certificate.relatedStandard) : null,
    assetId: certificate.assetId ? String(certificate.assetId) : null,
    clientId: certificate.clientId ? String(certificate.clientId) : null,
    issuedBy: certificate.issuedBy ? String(certificate.issuedBy) : null,
    issueDate: certificate.issueDate instanceof Date ? certificate.issueDate : new Date(String(certificate.issueDate)),
    expiryDate: certificate.expiryDate instanceof Date ? certificate.expiryDate : new Date(String(certificate.expiryDate)),
    approvalStatus: certificate.approvalStatus || null,
    fileName: certificate.fileName ? String(certificate.fileName) : null,
    fileUrl: certificate.fileUrl ? String(certificate.fileUrl) : null,
    actionType,
    changedById: sessionUserId,
    snapshotJson: certificate,
  });
}

function toCertificateEnum(value: string) {
  switch (value) {
    case 'CAT III': return 'CAT_III';
    case 'CAT IV': return 'CAT_IV';
    case 'ORIGINAL COC': return 'ORIGINAL_COC';
    case 'LOAD TEST': return 'LOAD_TEST';
    case 'CAT_III':
    case 'CAT_IV':
    case 'ORIGINAL_COC':
    case 'LOAD_TEST':
    case 'LIFTING':
    case 'NDT':
    case 'TUBULAR':
      return value;
    default: return value;
  }
}
