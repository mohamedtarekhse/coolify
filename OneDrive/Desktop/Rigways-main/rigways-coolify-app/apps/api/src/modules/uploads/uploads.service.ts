import { createPresignedPutUrl } from '../../lib/s3.js';
import { buildStorageObjectUrl } from '../../lib/storage.js';

const cvTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const trainingTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

const certificateTypes = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

export async function createCertificateUploadTicket(body: Record<string, unknown>) {
  const fileName = String(body.file_name || '').trim();
  const mimeType = String(body.mime_type || '').trim();
  const clientId = sanitizeUpper(String(body.client_id || ''));
  const jobNumber = sanitizeUpper(String(body.job_number || ''));
  const certNumber = sanitizeUpper(String(body.cert_number || ''));

  if (!fileName || !mimeType || !clientId || !jobNumber || !certNumber) {
    throw new Error('file_name, mime_type, client_id, job_number, and cert_number are required');
  }
  if (!certificateTypes.includes(mimeType)) throw new Error('Invalid file type. Allowed: PDF, JPG, PNG, WEBP');

  const ext = normalizeExtension(fileName);
  const safeOriginal = fileName
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'certificate';

  const key = `clients/${clientId}/jobs/${jobNumber}/${jobNumber}_${certNumber}_${safeOriginal}.${ext}`;
  const uploadUrl = await createPresignedPutUrl(key, mimeType);

  return {
    key,
    file_name: `${jobNumber}_${certNumber}_${safeOriginal}.${ext}`,
    file_url: key,
    upload_url: uploadUrl,
    public_url: buildStorageObjectUrl(key),
  };
}

export async function createInspectorUploadTicket(body: Record<string, unknown>, category: 'cv' | 'training') {
  const fileName = String(body.file_name || '').trim();
  const mimeType = String(body.mime_type || '').trim();
  if (!fileName || !mimeType) throw new Error('file_name and mime_type are required');

  const allowed = category === 'cv' ? cvTypes : trainingTypes;
  if (!allowed.includes(mimeType)) throw new Error('Invalid file type for this upload');

  const ext = normalizeExtension(fileName);
  const labelRaw = String(body.label || fileName.replace(/\.[^.]+$/, '') || 'file');
  const safeLabel = labelRaw.replace(/[^a-zA-Z0-9-_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'file';
  const key = `inspectors/${category}/${Date.now()}_${crypto.randomUUID().slice(0, 8)}_${safeLabel}.${ext}`;
  const uploadUrl = await createPresignedPutUrl(key, mimeType);

  return category === 'cv'
    ? {
        cv_file: fileName,
        cv_url: key,
        upload_url: uploadUrl,
        public_url: buildStorageObjectUrl(key),
      }
    : {
        file_name: `${safeLabel}.${ext}`,
        file_url: key,
        upload_url: uploadUrl,
        public_url: buildStorageObjectUrl(key),
      };
}

function normalizeExtension(fileName: string) {
  return (fileName.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '') || 'bin';
}

function sanitizeUpper(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}
