import cloudinary from '../config/cloudinary.js';

/**
 * Uploads a file buffer (from multer memory storage) to Cloudinary and
 * returns its public HTTPS URL.
 */
export const saveImage = async (file) => {
  if (!file) return null;

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'pasumai-tamilagam' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
};

/**
 * Deletes a previously uploaded image from Cloudinary given its stored URL.
 */
export const deleteImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) return;
  try {
    const afterUpload = imageUrl.split('/upload/')[1];
    if (!afterUpload) return;
    // Strip the version segment (v1234567890/) and file extension
    const withoutVersion = afterUpload.replace(/^v\d+\//, '');
    const publicId = withoutVersion.replace(/\.[^/.]+$/, '');
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Failed to delete Cloudinary image:', err);
  }
};
