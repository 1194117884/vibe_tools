import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { verifyToken } from '../../../utils/auth';
import { validateFile, generateFileKey } from '../../../utils/r2';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 1. Validate JWT
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: '会话已过期，请重新验证' });
    }

    const token = authHeader.slice(7);
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
      verifyToken(token, jwtSecret);
    } catch {
      return res.status(401).json({ error: '会话已过期，请重新验证' });
    }

    // 2. Parse and validate request
    const { fileName, fileSize, contentType } = req.body || {};

    if (!fileName) {
      return res.status(400).json({ error: 'Missing fileName' });
    }
    if (!fileSize) {
      return res.status(400).json({ error: 'Missing fileSize' });
    }
    if (!contentType) {
      return res.status(400).json({ error: 'Missing contentType' });
    }

    const validation = validateFile(fileName, fileSize, contentType);
    if (!validation.valid) {
      const statusMap = {
        'File exceeds 50MB limit': 413,
        'Unsupported file type': 415,
        'File is empty': 400,
        'Empty filename': 400,
      };
      const status = statusMap[validation.error] || 400;
      return res.status(status).json({ error: validation.error });
    }

    // 3. Generate S3 pre-signed URL
    const r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });

    const fileKey = generateFileKey(fileName);

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
      ContentLength: fileSize,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 300 });

    const publicUrl = `${process.env.R2_PUBLIC_URL}/${fileKey}`;

    return res.status(200).json({
      uploadUrl,
      publicUrl,
      key: fileKey,
    });
  } catch (error) {
    console.error('Presign error:', error);
    return res.status(500).json({ error: '上传服务暂时不可用，请稍后再试' });
  }
}
