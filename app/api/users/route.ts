import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { mapUserPublic } from "@/lib/mappers"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const leaderboard = searchParams.get("leaderboard") === "1"
  const limit = Math.min(Number(searchParams.get("limit") || 50), 200)

  const users = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: leaderboard ? { reputation: "desc" } : { name: "asc" },
    take: limit,
  })

  return NextResponse.json({ users: users.map(mapUserPublic) })
}
