import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin, jsonError } from "@/lib/auth"

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return jsonError("Forbidden", 403)

  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const [questions, answers, users, unanswered, askedToday, answeredToday, recent, recentUsers] =
    await Promise.all([
      prisma.question.count(),
      prisma.answer.count(),
      prisma.user.count(),
      prisma.question.count({ where: { answers: { none: {} } } }),
      prisma.question.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.answer.count({ where: { createdAt: { gte: startOfDay } } }),
      prisma.question.findMany({
        take: 12,
        orderBy: { createdAt: "desc" },
        include: {
          author: { select: { name: true, email: true } },
          _count: { select: { answers: true } },
        },
      }),
      prisma.user.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          reputation: true,
          enrollmentNo: true,
          createdAt: true,
        },
      }),
    ])

  return NextResponse.json({
    stats: {
      questions,
      answers,
      members: users,
      unanswered,
      askedToday,
      answeredToday,
      reported: 0,
    },
    recent: recent.map((q) => ({
      id: q.id,
      title: q.title,
      author: q.author.name,
      authorEmail: q.author.email,
      answers: q._count.answers,
      date: q.createdAt.toISOString(),
    })),
    recentUsers: recentUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      reputation: u.reputation,
      enrollmentNo: u.enrollmentNo,
      date: u.createdAt.toISOString(),
    })),
  })
}
