import cloudinary from '@/lib/cloudinary'

// Read: use the admin API to get the current versioned URL, then fetch content.
// The admin API bypasses CDN entirely so we always get the latest version number.
// The versioned CDN URL (e.g. /v1748123456/ks-assignments) is a cache miss after
// any write because cloudinaryWrite changes the version on each upload.
// Write: upload via the SDK (requires credentials — only called from the local admin).
export async function cloudinaryRead<T>(publicId: string, fallback: T): Promise<T> {
  try {
    const resource = await cloudinary.api.resource(publicId, { resource_type: 'raw' })
    const res = await fetch(resource.secure_url, { cache: 'no-store' })
    if (!res.ok) return fallback
    return await res.json() as T
  } catch (err) {
    console.error('[cloudinaryRead] failed for', publicId, err)
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
