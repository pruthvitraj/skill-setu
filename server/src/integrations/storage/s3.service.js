const env = require('../../config/env');
const { AppError } = require('../../utils/AppError');

async function upload({ buffer, mimeType, originalName, folder }) {
  if (!env.aws.bucket) {
    throw new AppError('S3 is not configured', 500, 'STORAGE_NOT_CONFIGURED');
  }
  const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
  const key = `${folder}/${Date.now()}-${originalName.replace(/[^\w.\-]/g, '_')}`;
  const client = new S3Client({ region: env.aws.region });
  await client.send(
    new PutObjectCommand({
      Bucket: env.aws.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );
  return { key, url: `https://${env.aws.bucket}.s3.${env.aws.region}.amazonaws.com/${key}` };
}

async function remove(key) {
  if (!env.aws.bucket) {
    throw new AppError('S3 is not configured', 500, 'STORAGE_NOT_CONFIGURED');
  }
  const { DeleteObjectCommand, S3Client } = require('@aws-sdk/client-s3');
  const client = new S3Client({ region: env.aws.region });
  await client.send(new DeleteObjectCommand({ Bucket: env.aws.bucket, Key: key }));
}

module.exports = { upload, remove };
