import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "node:fs/promises"
import path from "node:path"
import { randomBytes } from "node:crypto"
import { requireUser, jsonError } from "@/lib/auth"

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"])

export async function POST(req: NextRequest) {
  const user = await requireUser(req)
  if (!user) return jsonError("Sign in to upload images.", 401)

  const contentType = req.headers.get("content-type") || ""
  if (!contentType.includes("multipart/form-data")) {
    return jsonError("Expected multipart form upload.")
  }

  const form = await req.formData()
  const file = form.get("file")
  if (!file || typeof file === "string") return jsonError("No image file provided.")

  const blob = file as File
  if (!ALLOWED.has(blob.type)) return jsonError("Use PNG, JPEG, WebP, or GIF.")
  if (blob.size > MAX_BYTES) return jsonError("Image must be under 5MB.")

  const ext =
    blob.type === "image/png"
      ? "png"
      : blob.type === "image/webp"
        ? "webp"
        : blob.type === "image/gif"
          ? "gif"
          : "jpg"

  const dir = path.join(process.cwd(), "public", "uploads", "questions")
  await mkdir(dir, { recursive: true })
  const filename = `${user.id}-${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`
  const bytes = Buffer.from(await blob.arrayBuffer())
  await writeFile(path.join(dir, filename), bytes)

  const url = `/uploads/questions/${filename}`
  return NextResponse.json({ url }, { status: 201 })
}
