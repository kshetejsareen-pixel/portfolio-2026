import cloudinary from '@/lib/cloudinary'

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? 'dsouvrzlr'

// Read: fetch the public CDN URL directly — no admin credentials needed.
// A timestamp query param bypasses CDN caching so reads are always fresh.
// Write: upload via the SDK (requires credentials — only called from the local admin).
export async function cloudinaryRead<T>(publicId: string, fallback: T): Promise<T> {
  try {
    const url = `https://res.cloudinary.com/${CLOUD}/raw/upload/${publicId}?_t=${Date.now()}`
    const res = await fetch(url, { cache: 'no-store' })
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
    invalidate:    true,
  })
}
