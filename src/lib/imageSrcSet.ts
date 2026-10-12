// Cloudinary URLs are built with a w_2400 transform; swap the width to let
// the browser pick the smallest sufficient variant.
//
// Lives here rather than in a component so the editorial grid and the
// full-screen viewer can share it without importing each other, and separate
// from lib/cloudinary.ts because that one configures the server-side SDK with
// the API secret — this is client-safe string work.
export const SRCSET_WIDTHS = [800, 1200, 1600, 2400]

export function cloudinarySrcSet(url: string): string | undefined {
  if (!url.includes('w_2400')) return undefined
  return SRCSET_WIDTHS.map((w) => `${url.replace('w_2400', `w_${w}`)} ${w}w`).join(', ')
}
