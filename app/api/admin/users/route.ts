import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin, jsonError } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req)
  if (!admin) return jsonError("Forbidden", 403)

  const q = new URL(req.url).searchParams.get("q")?.trim() || ""
  const users = await prisma.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { enrollmentNo: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 40,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      reputation: true,
      enrollmentNo: true,
      branch: true,
      createdAt: true,
      _count: { select: { questions: true, answers: true } },
    },
  })

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      reputation: u.reputation,
      enrollmentNo: u.enrollmentNo,
      branch: u.branch,
      questions: u._count.questions,
      answers: u._count.answers,
      date: u.createdAt.toISOString(),
    })),
  })
}
