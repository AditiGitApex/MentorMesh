import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { mapUser, mapUserPublic } from "@/lib/mappers"
import { jsonError, getSessionUserId } from "@/lib/auth"

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params
  const sessionId = await getSessionUserId(req)
  const user = await prisma.user.findUnique({
    where: { id },
    include: { bookmarks: { select: { questionId: true } } },
  })
  if (!user) return jsonError("User not found.", 404)

  const payload = sessionId === user.id ? mapUser(user) : mapUserPublic(user)
  return NextResponse.json({ user: payload })
}
