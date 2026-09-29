/**
 * Cloudinary & Storage Media Upload Service
 * Client-side direct unsigned multipart upload with Supabase Storage fallback
 * Mirrors Flutter CloudinaryService configuration (folder: 'animals')
 */

import { supabase } from '../supabase';

export interface CloudinaryUploadOptions {
  folder?: string;
  tags?: string[];
}

export interface CloudinaryUploadResult {
  secureUrl: string;
  secure_url: string;
  publicId: string;
  format?: string;
  bytes?: number;
}

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dwfowhzwn';
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'dashsocial';

export class CloudinaryService {
  /**
   * Client-side canvas image compression utility
   */
  public static async compressImage(
    file: File | Blob,
    maxDimension = 1280,
    quality = 0.82
  ): Promise<Blob> {
    if (typeof window === 'undefined') return file;

    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(blob || file);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = url;
    });
  }

  /**
   * Upload File or Blob to Cloudinary (folder: 'animals') with Supabase Storage fallback
   */
  public static async uploadImage(
    file: File | Blob,
    options?: string | CloudinaryUploadOptions
  ): Promise<CloudinaryUploadResult> {
    const folder = typeof options === 'string' ? options : (options?.folder || 'animals');
    const tags = typeof options === 'object' && options?.tags ? options.tags.join(',') : undefined;

    // Perform client-side compression
    const compressedBlob = await this.compressImage(file);

    // 1. Attempt Cloudinary Unsigned Upload
    try {
      const formData = new FormData();
      formData.append('file', compressedBlob, file instanceof File ? file.name : 'animal_photo.jpg');
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', folder);
      if (tags) {
        formData.append('tags', tags);
      }

      const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        const finalUrl = data.secure_url || '';
        return {
          secureUrl: finalUrl,
          secure_url: finalUrl,
          publicId: data.public_id || '',
          format: data.format,
          bytes: data.bytes,
        };
      }
    } catch (cloudErr) {
      console.warn('Cloudinary upload unsuccessful, trying Supabase Storage fallback:', cloudErr);
    }

    // 2. Supabase Storage Fallback
    try {
      if (supabase) {
        const fileExt = file instanceof File ? file.name.split('.').pop() : 'jpg';
        const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from('animals')
          .upload(fileName, compressedBlob, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (!uploadErr && uploadData) {
          const { data: publicUrlData } = supabase.storage.from('animals').getPublicUrl(uploadData.path);
          if (publicUrlData?.publicUrl) {
            return {
              secureUrl: publicUrlData.publicUrl,
              secure_url: publicUrlData.publicUrl,
              publicId: uploadData.path,
            };
          }
        }
      }
    } catch (supaErr) {
      console.warn('Supabase storage fallback error:', supaErr);
    }

    // 3. Offline / Browser Object URL fallback
    const localUrl = URL.createObjectURL(compressedBlob);
    return {
      secureUrl: localUrl,
      secure_url: localUrl,
      publicId: `local_${Date.now()}`,
    };
  }
}
