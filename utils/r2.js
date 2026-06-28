import crypto from 'crypto';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

const ALLOWED_TYPES = [
  'image/',
  'video/',
  'application/pdf',
  'application/zip',
  'application/gzip',
  'application/x-7z-compressed',
  'application/x-rar-compressed',
  'text/plain',
  'text/csv',
  'application/json',
  'application/vnd.openxmlformats-officedocument.',
  'application/vnd.ms-',
  'application/msword',
];

/**
 * Strip dangerous characters from a filename.
 */
export function sanitizeFileName(name) {
  let clean = name
    .replace(/[\x00-\x1f\x7f]/g, '')
    .replace(/[\/\\]/g, '')
    .trim();

  const dotIndex = clean.lastIndexOf('.');
  const ext = dotIndex > 0 ? clean.slice(dotIndex) : '';
  let base = dotIndex > 0 ? clean.slice(0, dotIndex) : clean;

  while (Buffer.byteLength(base + ext, 'utf8') > 255) {
    base = base.slice(0, -1);
  }

  clean = base + ext;

  return clean || 'unnamed';
}

/**
 * Generate a unique R2 object key: {uuid}_{sanitized-name}
 */
export function generateFileKey(originalName) {
  const uuid = crypto.randomUUID();
  const safe = sanitizeFileName(originalName);
  return `${uuid}_${safe}`;
}

/**
 * Validate file metadata before generating a presigned URL.
 */
export function validateFile(fileName, fileSize, contentType) {
  if (!fileName || fileName.trim() === '') {
    return { valid: false, error: 'Empty filename' };
  }

  if (!fileSize || fileSize <= 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (fileSize > MAX_FILE_SIZE) {
    return { valid: false, error: 'File exceeds 100MB limit' };
  }

  if (!contentType) {
    return { valid: false, error: 'Unsupported file type' };
  }

  const isAllowed = ALLOWED_TYPES.some(
    (t) => contentType === t || contentType.startsWith(t)
  );

  if (!isAllowed) {
    return { valid: false, error: 'Unsupported file type' };
  }

  return { valid: true };
}
