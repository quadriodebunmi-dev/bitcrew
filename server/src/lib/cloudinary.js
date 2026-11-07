import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config.js';

const c = config.cloudinary;
export const cloudinaryReady = Boolean(c.cloudName && c.apiKey && c.apiSecret);

if (cloudinaryReady) {
  cloudinary.config({ cloud_name: c.cloudName, api_key: c.apiKey, api_secret: c.apiSecret, secure: true });
} else {
  console.warn('[cloudinary] not configured. Image uploads are disabled until CLOUDINARY_* are set.');
}

export function uploadBuffer(buffer, subfolder = 'general') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${c.folder}/${subfolder}`,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'],
        // Cap stored size so a 6000px phone photo does not eat the free quota.
        transformation: [{ width: 2400, height: 2400, crop: 'limit' }],
      },
      (err, res) => {
        if (err) return reject(err);
        resolve({ url: res.secure_url, publicId: res.public_id, width: res.width, height: res.height, alt: '' });
      }
    );
    stream.end(buffer);
  });
}

// Remove images that are no longer referenced. Only touches our own folder.
export async function destroyImages(ids = []) {
  if (!cloudinaryReady || !ids.length) return;
  const mine = ids.filter((id) => id.startsWith(`${c.folder}/`));
  await Promise.allSettled(mine.map((id) => cloudinary.uploader.destroy(id, { invalidate: true })));
}
