export const AVATAR_STYLES = [
  "avataaars",
  "lorelei",
  "notionists",
  "open-peeps",
  "personas",
  "bottts",
] as const

export type AvatarStyle = (typeof AVATAR_STYLES)[number]

export function buildAvatarUrl(style: AvatarStyle | string, seed: string) {
  const safe = encodeURIComponent(seed || "mentor")
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${safe}`
}

export function avatarPresets(seedBase: string) {
  return AVATAR_STYLES.map((style) => ({
    style,
    url: buildAvatarUrl(style, `${seedBase}-${style}`),
    label: style.replace(/-/g, " "),
  }))
}

/** Dicebear remote SVG is fine; uploaded SVG / data:image/svg are not. */
export function isAllowedAvatarUrl(url: string) {
  if (!url || url.length > 500_000) return false
  if (url.startsWith("/uploads/avatars/")) {
    return !/\.svg(\?|$)/i.test(url)
  }
  if (url.startsWith("https://api.dicebear.com/")) return true
  if (url.startsWith("data:image/")) {
    if (/data:image\/svg/i.test(url)) return false
    return /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(url)
  }
  return false
}

export const ALLOWED_AVATAR_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
])
