import { supabase } from '../lib/supabase';

export const PAYMENT_SCREENSHOT_BUCKET = 'payment-screenshots';

export const ALLOWED_SCREENSHOT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateScreenshotFile(file) {
  if (!file) return { valid: false, error: 'No file selected' };
  if (!ALLOWED_SCREENSHOT_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG or WebP images are allowed' };
  }
  if (file.size > MAX_SCREENSHOT_BYTES) {
    return { valid: false, error: 'Image must be 5 MB or smaller' };
  }
  return { valid: true };
}

function extensionFor(type) {
  return type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
}

/**
 * Uploads a payment screenshot to Supabase Storage.
 * Returns { url, path }. Throws on failure.
 */
export async function uploadPaymentScreenshot(file) {
  const check = validateScreenshotFile(file);
  if (!check.valid) throw new Error(check.error);

  const path = `proofs/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extensionFor(file.type)}`;

  const { error } = await supabase.storage
    .from(PAYMENT_SCREENSHOT_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(PAYMENT_SCREENSHOT_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export const PRIZE_MEDIA_BUCKET = 'prize-media';
export const ALLOWED_PRIZE_MEDIA_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
];
export const MAX_PRIZE_MEDIA_BYTES = 50 * 1024 * 1024;

export function validatePrizeMediaFile(file) {
  if (!file) return { valid: false, error: 'No file selected' };
  if (!ALLOWED_PRIZE_MEDIA_TYPES.includes(file.type)) {
    return { valid: false, error: 'Unsupported image or video type' };
  }
  if (file.size > MAX_PRIZE_MEDIA_BYTES) {
    return { valid: false, error: 'Media must be 50 MB or smaller' };
  }
  return { valid: true };
}

function extensionForMedia(type) {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  if (type === 'image/gif') return 'gif';
  if (type === 'video/webm') return 'webm';
  if (type === 'video/ogg') return 'ogg';
  if (type === 'video/quicktime') return 'mov';
  if (type.startsWith('video/')) return 'mp4';
  return 'jpg';
}

export async function uploadPrizeMedia(file) {
  const check = validatePrizeMediaFile(file);
  if (!check.valid) throw new Error(check.error);

  const path = `media/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extensionForMedia(file.type)}`;
  const { error } = await supabase.storage
    .from(PRIZE_MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(PRIZE_MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

/** Removes an uploaded screenshot (best-effort). */
export async function deletePaymentScreenshot(path) {
  if (!path) return;
  try {
    await supabase.storage.from(PAYMENT_SCREENSHOT_BUCKET).remove([path]);
  } catch (err) {
    console.warn('Could not delete payment screenshot:', err);
  }
}
