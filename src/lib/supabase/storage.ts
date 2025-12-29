import { createClient } from './client'

export const BUCKETS = {
  INSPECTIONS: 'inspection-photos',
  SERVICE_REQUESTS: 'service-request-photos',
  PROPERTIES: 'property-photos',
  DOCUMENTS: 'documents',
  AVATARS: 'avatars',
} as const

export type BucketName = typeof BUCKETS[keyof typeof BUCKETS]

interface UploadOptions {
  bucket: BucketName
  path: string
  file: File
  onProgress?: (progress: number) => void
}

interface UploadResult {
  url: string
  path: string
  error?: string
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFile({ bucket, path, file }: UploadOptions): Promise<UploadResult> {
  const supabase = createClient()

  // Generate unique filename
  const ext = file.name.split('.').pop()
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 8)
  const filename = `${timestamp}-${randomStr}.${ext}`
  const fullPath = `${path}/${filename}`

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fullPath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (error) {
    console.error('Upload error:', error)
    return { url: '', path: '', error: error.message }
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path)

  return {
    url: urlData.publicUrl,
    path: data.path,
  }
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  bucket: BucketName,
  path: string,
  files: File[]
): Promise<UploadResult[]> {
  const results = await Promise.all(
    files.map(file => uploadFile({ bucket, path, file }))
  )
  return results
}

/**
 * Delete a file from storage
 */
export async function deleteFile(bucket: BucketName, path: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('Delete error:', error)
    return false
  }

  return true
}

/**
 * Delete multiple files
 */
export async function deleteFiles(bucket: BucketName, paths: string[]): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths)

  if (error) {
    console.error('Delete error:', error)
    return false
  }

  return true
}

/**
 * Get a signed URL for private files (expires in 1 hour)
 */
export async function getSignedUrl(
  bucket: BucketName,
  path: string,
  expiresIn = 3600
): Promise<string | null> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) {
    console.error('Signed URL error:', error)
    return null
  }

  return data.signedUrl
}

/**
 * Compress image before upload (client-side)
 */
export async function compressImage(
  file: File,
  maxWidth = 1920,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    img.onload = () => {
      let { width, height } = img

      if (width > maxWidth) {
        height = (height * maxWidth) / width
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      ctx?.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: 'image/jpeg' }))
          } else {
            reject(new Error('Failed to compress image'))
          }
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
