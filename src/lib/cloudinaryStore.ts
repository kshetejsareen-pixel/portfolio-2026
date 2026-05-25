import cloudinary from '@/lib/cloudinary'

// Generic helper for storing JSON blobs as Cloudinary raw files.
// Read uses the Admin API to get the versioned URL (always fresh, bypasses CDN cache).
// Write overwrites the raw file in place.

export async function cloudinaryRead<T>(publicId: string, fallback: T): Promise<T> {
  try {
    const meta = await cloudinary.api.resource(publicId, { resource_type: 'raw' })
    const res  = await fetch(meta.secure_url, { cache: 'no-store' })
    if (!res.ok) return fallback
    return await res.json() as T
  } catch {
    return fallback
  }
}

export async function cloudinaryWrite<T>(publicId: string, data: T): Promise<void> {
  const dataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(data)).toString('base64')}`
  await cloudinary.uploader.upload(dataUri, {
    public_id:     publicId,
    resource_type: 'raw',
    overwrite:     true,
  })
}
