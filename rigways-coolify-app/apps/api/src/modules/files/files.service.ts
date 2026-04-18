import { buildStorageObjectUrl, signStorageToken, verifyStorageToken } from '../../lib/storage.js';
import {
  findCertificateFileById,
  findCertificateFileByStorageKey,
  hardDeleteCertificateFile,
  listCertificateFiles,
  listLegacyCertificateFiles,
  setCertificateFileCurrent,
  softDeleteCertificateFile,
} from './files.repository.js';

export async function getFiles(query: URLSearchParams) {
  const limit = Math.min(Math.max(Number(query.get('limit') || 500), 1), 1000);
  const offset = Number(query.get('offset') || 0);

  const [files, legacy] = await Promise.all([
    listCertificateFiles({
      clientId: query.get('client_id') || undefined,
      certType: query.get('cert_type') || undefined,
      jobNumber: query.get('job_number') || undefined,
      filename: query.get('filename') || undefined,
      limit,
      offset,
    }),
    listLegacyCertificateFiles(limit),
  ]);

  const normalized = files.map((file) => ({
    id: file.id,
    r2_key: file.storageKey,
    file_name: file.fileName,
    file_size: file.fileSize ? Number(file.fileSize) : null,
    uploaded_at: file.uploadedAt,
    uploaded_by: file.uploadedById,
    uploaded_by_username: file.uploadedBy?.username || null,
    client_id: file.clientId,
    cert_type: file.certType,
    job_number: file.jobNumber,
    status: file.status,
    scan_status: file.scanStatus,
    is_current: file.isCurrent,
    deleted_at: file.deletedAt,
  }));

  const knownKeys = new Set(normalized.map((file) => file.r2_key).filter(Boolean));
  const mergedLegacy = legacy
    .filter((row) => row.fileUrl && !knownKeys.has(row.fileUrl))
    .map((row) => ({
      id: null,
      r2_key: row.fileUrl,
      file_name: row.fileName || row.fileUrl?.split('/').pop() || 'certificate-file',
      file_size: null,
      uploaded_at: row.createdAt,
      uploaded_by: row.uploadedById,
      uploaded_by_username: null,
      client_id: row.clientId,
      cert_type: row.certType,
      job_number: row.certNumber,
      status: 'active',
      scan_status: 'pending',
      is_current: false,
      deleted_at: null,
    }));

  return {
    files: [...normalized, ...mergedLegacy],
    limit,
    offset,
  };
}

export function getObjectSignedUrl(key: string, ttl: number, origin: string) {
  const exp = Math.floor(Date.now() / 1000) + ttl;
  const sig = signStorageToken(key, exp);
  return {
    url: `${origin}/api/files/object/download?key=${encodeURIComponent(key)}&exp=${exp}&sig=${encodeURIComponent(sig)}`,
    expires_at: exp,
  };
}

export function getObjectDownloadUrl(key: string, exp: number, sig: string) {
  if (!key || !exp || exp < Math.floor(Date.now() / 1000)) return null;
  if (!verifyStorageToken(key, exp, sig)) return null;
  return buildStorageObjectUrl(key);
}

export async function getFileSignedUrl(fileId: string, ttl: number, origin: string) {
  const file = await findCertificateFileById(fileId);
  if (!file || file.deletedAt || file.status === 'deleted' || !file.storageKey) return null;
  const exp = Math.floor(Date.now() / 1000) + ttl;
  const sig = signStorageToken(fileId, exp);
  return {
    url: `${origin}/api/files/download/${fileId}?exp=${exp}&sig=${encodeURIComponent(sig)}`,
    expires_at: exp,
  };
}

export async function getFileDownloadUrl(fileId: string, exp: number, sig: string) {
  if (!exp || exp < Math.floor(Date.now() / 1000)) return null;
  if (!verifyStorageToken(fileId, exp, sig)) return null;
  const file = await findCertificateFileById(fileId);
  if (!file || file.deletedAt || file.status === 'deleted') return null;
  return buildStorageObjectUrl(file.storageKey);
}

export async function makeCurrent(fileId: string) {
  const file = await findCertificateFileById(fileId);
  if (!file) return null;
  const [, updated] = await setCertificateFileCurrent(file.id, file.certificateId);
  return { file: updated };
}

export async function deleteByObjectKey(storageKey: string, mode: string) {
  const file = await findCertificateFileByStorageKey(storageKey);
  if (!file) return { key: storageKey, deleted: false, mode };
  if (mode === 'soft') {
    await softDeleteCertificateFile(file.id);
    return { key: storageKey, deleted: true, mode: 'soft' };
  }
  await hardDeleteCertificateFile(file.id);
  return { key: storageKey, deleted: true, mode: 'hard', storageDeleted: false };
}
