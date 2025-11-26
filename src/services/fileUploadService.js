// src/services/fileUploadService.js
// Service để upload files (images, audio, PDFs) lên Supabase Storage

import { supabase } from './supabaseClient.js';

/**
 * Upload image to Supabase Storage
 * @param {File} file - Image file
 * @param {string} path - Path in bucket (e.g., 'book-1/cover.jpg')
 * @returns {Promise<{success: boolean, url?: string, error?: Object}>}
 */
export async function uploadImage(file, path) {
  try {
    const { data, error } = await supabase.storage
      .from('book-images')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('[FileUpload] Error uploading image:', error);
      return { success: false, error };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('book-images')
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;
    console.log('[FileUpload] ✅ Image uploaded:', publicUrl);

    return { success: true, url: publicUrl };
  } catch (err) {
    console.error('[FileUpload] Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Upload audio file to Supabase Storage
 * @param {File} file - Audio file
 * @param {string} path - Path in bucket (e.g., 'quiz/question-1.mp3')
 * @returns {Promise<{success: boolean, url?: string, error?: Object}>}
 */
export async function uploadAudio(file, path) {
  try {
    const { data, error } = await supabase.storage
      .from('audio-files')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('[FileUpload] Error uploading audio:', error);
      return { success: false, error };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('audio-files')
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;
    console.log('[FileUpload] ✅ Audio uploaded:', publicUrl);

    return { success: true, url: publicUrl };
  } catch (err) {
    console.error('[FileUpload] Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Upload PDF file to Supabase Storage
 * @param {File} file - PDF file
 * @param {string} path - Path in bucket (e.g., 'lesson-1/theory.pdf')
 * @returns {Promise<{success: boolean, url?: string, error?: Object}>}
 */
export async function uploadPDF(file, path) {
  try {
    const { data, error } = await supabase.storage
      .from('pdf-files')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('[FileUpload] Error uploading PDF:', error);
      return { success: false, error };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('pdf-files')
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;
    console.log('[FileUpload] ✅ PDF uploaded:', publicUrl);

    return { success: true, url: publicUrl };
  } catch (err) {
    console.error('[FileUpload] Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Delete file from Supabase Storage
 * @param {string} bucket - Bucket name ('book-images', 'audio-files', 'pdf-files')
 * @param {string} path - Path to file
 * @returns {Promise<{success: boolean, error?: Object}>}
 */
export async function deleteFile(bucket, path) {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('[FileUpload] Error deleting file:', error);
      return { success: false, error };
    }

    console.log('[FileUpload] ✅ File deleted:', path);
    return { success: true };
  } catch (err) {
    console.error('[FileUpload] Unexpected error:', err);
    return { success: false, error: err };
  }
}

/**
 * Get public URL for a file
 * @param {string} bucket - Bucket name
 * @param {string} path - Path to file
 * @returns {string} Public URL
 */
export function getPublicUrl(bucket, path) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
  
  return data.publicUrl;
}

/**
 * Generate unique file path
 * @param {string} prefix - Prefix (e.g., 'book', 'quiz', 'lesson')
 * @param {string} filename - Original filename
 * @returns {string} Unique path
 */
export function generateFilePath(prefix, filename) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = filename.split('.').pop();
  const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  
  return `${prefix}/${timestamp}_${random}_${safeName}`;
}

