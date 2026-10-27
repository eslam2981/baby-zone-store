// Supabase Storage domain service
import { supabase } from '../lib/supabase';

export const storageApi = {
  /**
   * Upload an image file to a Supabase storage bucket
   * @param {File} file - Browser File object
   * @param {string} [bucket='products'] - Target bucket name
   * @returns {Promise<{ publicUrl: string, fileName: string }>}
   */
  async uploadImage(file, bucket = 'products') {
    if (!file) throw new Error('No file provided for upload');

    const ext = file.name.split('.').pop() || 'jpg';
    const cleanFileName = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from(bucket)
      .upload(cleanFileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadErr) {
      throw uploadErr;
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(cleanFileName);

    return {
      publicUrl,
      fileName: cleanFileName
    };
  },

  /**
   * Get the public URL for an asset in a Supabase storage bucket
   * @param {string} fileName - File name or path in bucket
   * @param {string} [bucket='products'] - Target bucket name
   * @returns {string}
   */
  getPublicUrl(fileName, bucket = 'products') {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    return publicUrl;
  }
};
