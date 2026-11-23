import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { requireUser, jsonError, toPublicUser } from "@/lib/auth"
import { ALLOWED_AVATAR_MIME, isAllowedAvatarUrl } from "@/lib/avatars"
import { writeFile, mkdir } from "node:fs/promises"
import path from "node:path"

const schema = z.object({
  name: z.string().min(2).max(120).optional(),
  bio: z.string().max(280).optional().nullable(),
  avatar: z.string().min(1).optional(),
})

export async function PATCH(req: NextRequest) {
  const user = await requireUser(req)
  if (!user) return jsonError("Unauthorized", 401)

  const contentType = req.headers.get("content-type") || ""

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData()
    const file = form.get("avatar")
    const name = String(form.get("name") || "").trim()
    const bioRaw = form.get("bio")
    const bio = bioRaw == null ? undefined : String(bioRaw).slice(0, 280)

    let avatarUrl: string | undefined
    if (file && typeof file !== "string") {
      const blob = file as File
      if (!ALLOWED_AVATAR_MIME.has(blob.type)) {
        return jsonError("Avatar must be PNG, JPEG, WebP, or GIF (no SVG).")
      }
      if (blob.size > 4 * 1024 * 1024) return jsonError("Avatar must be under 4MB.")
      const bytes = Buffer.from(await blob.arrayBuffer())
      const ext =
        blob.type === "image/png"
          ? "png"
          : blob.type === "image/webp"
            ? "webp"
            : blob.type === "image/gif"
              ? "gif"
              : "jpg"
      const dir = path.join(process.cwd(), "public", "uploads", "avatars")
      await mkdir(dir, { recursive: true })
      const filename = `${user.id}.${ext}`
      await writeFile(path.join(dir, filename), bytes)
      avatarUrl = `/uploads/avatars/${filename}?v=${Date.now()}`
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name ? { name } : {}),
        ...(bio !== undefined ? { bio: bio || null } : {}),
        ...(avatarUrl ? { avatar: avatarUrl } : {}),
      },
      include: { bookmarks: { select: { questionId: true } } },
    })
    return NextResponse.json({ user: toPublicUser(updated) })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError("Invalid profile payload.")

  if (parsed.data.avatar && !isAllowedAvatarUrl(parsed.data.avatar)) {
    return jsonError("That avatar source is not allowed. Use PNG/JPEG/WebP/GIF or a Dicebear style.")
  }

  let avatar = parsed.data.avatar
  if (avatar?.startsWith("data:image/")) {
    const match = /^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,(.+)$/i.exec(avatar)
    if (!match) return jsonError("Invalid image data.")
    const mime = match[1].toLowerCase()
    const ext = mime.includes("png")
      ? "png"
      : mime.includes("webp")
        ? "webp"
        : mime.includes("gif")
          ? "gif"
          : "jpg"
    const buf = Buffer.from(match[2], "base64")
    if (buf.length > 4 * 1024 * 1024) return jsonError("Avatar must be under 4MB.")
    const dir = path.join(process.cwd(), "public", "uploads", "avatars")
    await mkdir(dir, { recursive: true })
    const filename = `${user.id}.${ext}`
    await writeFile(path.join(dir, filename), buf)
    avatar = `/uploads/avatars/${filename}?v=${Date.now()}`
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(parsed.data.name ? { name: parsed.data.name.trim() } : {}),
      ...(parsed.data.bio !== undefined ? { bio: parsed.data.bio?.trim() || null } : {}),
      ...(avatar ? { avatar } : {}),
    },
    include: { bookmarks: { select: { questionId: true } } },
  })

  return NextResponse.json({ user: toPublicUser(updated) })
}
