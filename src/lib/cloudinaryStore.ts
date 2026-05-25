import cloudinary from '@/lib/cloudinary'

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME ?? 'dsouvrzlr'

// Module-level write-through cache. Keyed by publicId.
// Populated on every write so the next read-before-write always sees current data.
// On cold starts (fresh Vercel instance, dev restart) the cache is empty and we
// fall back to a CDN fetch — acceptable since the previous write used invalidate:true.
const writeCache: Record<string, unknown> = {}

// Public read — returns cached data if available (post-write), otherwise CDN fetch.
export async function cloudinaryRead<T>(publicId: string, fallback: T): Promise<T> {
  if (publicId in writeCache) return writeCache[publicId] as T
  try {
    const url = `https://res.cloudinary.com/${CLOUD}/raw/upload/${publicId}`
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) return fallback
    const data = await res.json() as T
    writeCache[publicId] = data
    return data
  } catch (err) {
    console.error('[cloudinaryRead] failed for', publicId, err)
    return fallback
  }
}

// Admin read — uses the Cloudinary admin API to get the current versioned URL,
// bypassing CDN caching entirely. Only call this from server-side admin routes
// where CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET are available.
export async function cloudinaryReadFresh<T>(publicId: string, fallback: T): Promise<T> {
  if (publicId in writeCache) return writeCache[publicId] as T
  try {
    const resource = await cloudinary.api.resource(publicId, { resource_type: 'raw' })
    const res = await fetch(resource.secure_url, { cache: 'no-store' })
    if (!res.ok) return fallback
    const data = await res.json() as T
    writeCache[publicId] = data
    return data
  } catch (err) {
    console.error('[cloudinaryReadFresh] failed for', publicId, err)
    return fallback
  }
}

export async function cloudinaryWrite<T>(publicId: string, data: T): Promise<void> {
  // Update cache immediately so the next read in this process sees current data.
  writeCache[publicId] = data
  const dataUri = `data:application/json;base64,${Buffer.from(JSON.stringify(data)).toString('base64')}`
  await cloudinary.uploader.upload(dataUri, {
    public_id:     publicId,
    resource_type: 'raw',
    overwrite:     true,
    invalidate:    true,
  })
}
