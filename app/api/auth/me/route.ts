import { NextResponse } from "next/server"
import { requireUser, toPublicUser, jsonError } from "@/lib/auth"

export async function GET() {
  const user = await requireUser()
  if (!user) return jsonError("Unauthorized", 401)
  return NextResponse.json({ user: toPublicUser(user) })
}
