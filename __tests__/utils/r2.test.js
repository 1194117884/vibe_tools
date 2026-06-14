import { sanitizeFileName, generateFileKey, validateFile } from '../../utils/r2';

describe('sanitizeFileName', () => {
  test('returns original name when already safe', () => {
    expect(sanitizeFileName('report.pdf')).toBe('report.pdf');
  });

  test('strips path separators', () => {
    expect(sanitizeFileName('../../../etc/passwd')).toBe('......etcpasswd');
  });

  test('strips control characters', () => {
    expect(sanitizeFileName('test\x00file.txt')).toBe('testfile.txt');
  });

  test('strips leading/trailing whitespace', () => {
    expect(sanitizeFileName('  hello.pdf  ')).toBe('hello.pdf');
  });

  test('handles unicode characters', () => {
    expect(sanitizeFileName('报告.pdf')).toBe('报告.pdf');
  });

  test('truncates names longer than 255 bytes', () => {
    const longName = 'a'.repeat(300) + '.pdf';
    const result = sanitizeFileName(longName);
    expect(Buffer.byteLength(result, 'utf8')).toBeLessThanOrEqual(255);
    expect(result.endsWith('.pdf')).toBe(true);
  });
});

describe('generateFileKey', () => {
  test('produces expected uuid_name pattern', () => {
    const key = generateFileKey('my file.pdf');
    expect(key).toMatch(/^[a-f0-9-]{36}_my file\.pdf$/);
  });

  test('sanitizes the filename portion', () => {
    const key = generateFileKey('../../../bad.pdf');
    expect(key).toMatch(/^[a-f0-9-]{36}_\.\.\.\.\.\.bad\.pdf$/);
  });

  test('generates unique keys for same filename', () => {
    const key1 = generateFileKey('file.txt');
    const key2 = generateFileKey('file.txt');
    expect(key1).not.toBe(key2);
  });
});

describe('validateFile', () => {
  test('accepts valid image file', () => {
    const result = validateFile('photo.jpg', 1000000, 'image/jpeg');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('accepts valid PDF', () => {
    const result = validateFile('doc.pdf', 5000000, 'application/pdf');
    expect(result.valid).toBe(true);
  });

  test('accepts text/plain', () => {
    const result = validateFile('notes.txt', 1000, 'text/plain');
    expect(result.valid).toBe(true);
  });

  test('accepts application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', () => {
    const result = validateFile('sheet.xlsx', 100000, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(result.valid).toBe(true);
  });

  test('rejects empty filename', () => {
    const result = validateFile('', 100, 'text/plain');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Empty filename');
  });

  test('rejects zero file size', () => {
    const result = validateFile('empty.txt', 0, 'text/plain');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('File is empty');
  });

  test('rejects negative file size', () => {
    const result = validateFile('file.txt', -1, 'text/plain');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('File is empty');
  });

  test('rejects file over 100MB', () => {
    const result = validateFile('big.bin', 104857601, 'application/zip');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('File exceeds 100MB limit');
  });

  test('rejects disallowed content type', () => {
    const result = validateFile('virus.exe', 1000, 'application/x-msdownload');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Unsupported file type');
  });

  test('rejects empty content type', () => {
    const result = validateFile('file.bin', 100, '');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Unsupported file type');
  });

  test('accepts json files', () => {
    const result = validateFile('data.json', 500, 'application/json');
    expect(result.valid).toBe(true);
  });

  test('accepts zip archives', () => {
    const result = validateFile('archive.zip', 10000000, 'application/zip');
    expect(result.valid).toBe(true);
  });

  test('accepts gzip archives', () => {
    const result = validateFile('archive.gz', 10000000, 'application/gzip');
    expect(result.valid).toBe(true);
  });

  test('accepts 7z archives', () => {
    const result = validateFile('archive.7z', 10000000, 'application/x-7z-compressed');
    expect(result.valid).toBe(true);
  });

  test('accepts rar archives', () => {
    const result = validateFile('archive.rar', 10000000, 'application/x-rar-compressed');
    expect(result.valid).toBe(true);
  });

  test('accepts csv files', () => {
    const result = validateFile('data.csv', 1000, 'text/csv');
    expect(result.valid).toBe(true);
  });

  test('accepts legacy .doc files', () => {
    const result = validateFile('legacy.doc', 100000, 'application/msword');
    expect(result.valid).toBe(true);
  });
});
