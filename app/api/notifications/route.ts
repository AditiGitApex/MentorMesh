import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { requireUser, jsonError } from "@/lib/auth"

export async function GET(req: NextRequest) {
  const user = await requireUser(req)
  if (!user) return jsonError("Unauthorized", 401)

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json({
    notifications: notifications.map((n) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      link: n.link || undefined,
      read: n.read,
      date: n.createdAt.toISOString(),
      userId: n.userId,
    })),
  })
}

const patchSchema = z.object({
  ids: z.array(z.string().min(1)).max(50).optional(),
})

export async function PATCH(req: NextRequest) {
  const user = await requireUser(req)
  if (!user) return jsonError("Unauthorized", 401)

  const body = await req.json().catch(() => ({}))
  const parsed = patchSchema.safeParse(body)
  const ids = parsed.success ? parsed.data.ids : undefined

  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      read: false,
      ...(ids?.length ? { id: { in: ids } } : {}),
    },
    data: { read: true },
  })

  return NextResponse.json({ ok: true })
}
