/** Lightweight HTML cleanup for student Q&A content (college-project level). */
export function sanitizeHtml(html: string) {
  let out = String(html || "")

  // Remove high-risk tags entirely (including content where it matters)
  out = out.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
  out = out.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
  out = out.replace(/<\/?(iframe|object|embed|svg|math|link|meta|form|base|textarea|input|button)[^>]*>/gi, "")

  // Strip event handlers and javascript: URLs
  out = out.replace(/\son\w+\s*=\s*(['"]).*?\1/gi, "")
  out = out.replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
  out = out.replace(/javascript\s*:/gi, "")
  out = out.replace(/data\s*:\s*text\/html/gi, "")

  // Only allow safe <img> sources
  out = out.replace(/<img\b([^>]*?)>/gi, (_full, attrs: string) => {
    const srcMatch = /\bsrc\s*=\s*(['"])(.*?)\1/i.exec(attrs)
    const altMatch = /\balt\s*=\s*(['"])(.*?)\1/i.exec(attrs)
    const src = srcMatch?.[2]?.trim() || ""
    if (!isSafeImageSrc(src)) return ""
    const alt = (altMatch?.[2] || "Question image").replace(/[<>"']/g, "")
    return `<img src="${src}" alt="${alt}" loading="lazy" class="question-image" />`
  })

  // Neutralize risky anchors
  out = out.replace(/<a\b([^>]*?)>/gi, (_full, attrs: string) => {
    const hrefMatch = /\bhref\s*=\s*(['"])(.*?)\1/i.exec(attrs)
    const href = hrefMatch?.[2]?.trim() || ""
    if (!href || /^(javascript|data)\s*:/i.test(href)) {
      return "<a>"
    }
    if (href.startsWith("/") || href.startsWith("https://") || href.startsWith("http://") || href.startsWith("#")) {
      return `<a href="${href.replace(/"/g, "")}" rel="noopener noreferrer" target="_blank">`
    }
    return "<a>"
  })

  return out
}

export function isSafeImageSrc(src: string) {
  if (!src) return false
  if (src.startsWith("/uploads/questions/")) return true
  if (src.startsWith("https://images.unsplash.com/")) return true
  if (src.startsWith("https://picsum.photos/")) return true
  return false
}

export function plainToHtml(text: string) {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
  return `<p>${escaped.replace(/\n/g, "<br/>")}</p>`
}

/** Build question HTML from plain text + uploaded image URLs */
export function buildQuestionHtml(text: string, imageUrls: string[] = []) {
  const body = plainToHtml(text)
  const safeImages = imageUrls.filter(isSafeImageSrc)
  if (!safeImages.length) return body
  const gallery = safeImages
    .map(
      (src) =>
        `<figure class="question-figure"><img src="${src}" alt="Attached image" loading="lazy" class="question-image" /></figure>`
    )
    .join("")
  return `${body}${gallery}`
}
