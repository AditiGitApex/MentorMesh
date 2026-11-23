import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getSessionUserId } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const userId = await getSessionUserId(req)

  const tags = await prisma.tag.findMany({
    include: {
      _count: { select: { questions: true, followers: true } },
      followers: userId
        ? { where: { userId }, select: { userId: true } }
        : false,
    },
    orderBy: { name: "asc" },
  })

  const payload = tags
    .map((t) => ({
      id: t.id,
      name: t.name,
      count: t._count.questions,
      followers: t._count.followers,
      following: Array.isArray(t.followers) ? t.followers.length > 0 : false,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))

  return NextResponse.json({ tags: payload })
}
