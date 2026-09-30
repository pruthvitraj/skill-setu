const fs = require('fs/promises');
const path = require('path');
const env = require('../../config/env');
const s3 = require('./s3.service');

const localDir = path.join(__dirname, '../../../uploads');

async function saveBuffer({ buffer, mimeType, originalName, folder }) {
  if (env.storageProvider === 's3') {
    return s3.upload({ buffer, mimeType, originalName, folder });
  }
  await fs.mkdir(path.join(localDir, folder), { recursive: true });
  const safe = originalName.replace(/[^\w.\-]/g, '_');
  const name = `${Date.now()}-${safe}`;
  const rel = path.join(folder, name);
  await fs.writeFile(path.join(localDir, rel), buffer);
  return { key: rel.replace(/\\/g, '/'), url: `/uploads/${rel.replace(/\\/g, '/')}` };
}

async function deleteFile(key) {
  if (env.storageProvider === 's3') {
    return s3.remove(key);
  }
  const root = path.resolve(localDir);
  const target = path.resolve(localDir, key);
  if (target !== root && !target.startsWith(`${root}${path.sep}`)) {
    throw new Error('Invalid storage key');
  }
  await fs.rm(target, { force: true });
}

module.exports = { saveBuffer, deleteFile };
