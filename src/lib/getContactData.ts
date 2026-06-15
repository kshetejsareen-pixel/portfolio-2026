import { readCopyConfig } from '@/lib/copyConfig'
import type { ContactCopy } from '@/lib/copyConfig'

export async function getContactCopy(): Promise<ContactCopy> {
  const config = await readCopyConfig()
  return (config.contact as ContactCopy) ?? {}
}
