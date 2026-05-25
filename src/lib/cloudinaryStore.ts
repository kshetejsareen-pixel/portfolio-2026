import cloudinary from '@/lib/cloudinary'

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? 'dsouvrzlr'

// Public read — CDN URL with timestamp cache-buster (no credentials needed, works on Vercel).
export async function cloudinaryRead<T>(publicId: string, fallback: T): Promise<T> {
  try {
    const url = `https://res.cloudinary.com/${CLOUD}/raw/upload/${publicId}?_t=${Date.now()}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return fallback
    return await res.json() as T
  } catch (err) {
    console.error('[cloudinaryRead] failed for', publicId, err)
    return fallback
  }
}

// Admin read — uses the Cloudinary admin API to get the current versioned URL,
// bypassing CDN caching entirely. Only call this from server-side admin routes
// where CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET are available.
export async function cloudinaryReadFresh<T>(publicId: string, fallback: T): Promise<T> {
  try {
    const resource = await cloudinary.api.resource(publicId, { resource_type: 'raw' })
    const res = await fetch(resource.secure_url, { cache: 'no-store' })
    if (!res.ok) return fallback
    return await res.json() as T
  } catch (err) {
    console.error('[cloudinaryReadFresh] failed for', publicId, err)
    return fallback
  }
}

export async function cloudinaryWrite<T>(publicId: string, data: T): Promise<void> {
  const dataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(data)).toString('base64')}`
  await cloudinary.uploader.upload(dataUri, {
    public_id:     publicId,
    resource_type: 'raw',
    overwrite:     true,
    invalidate:    true,
  })
}
