import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/db"
import { requireAdmin, jsonError } from "@/lib/auth"

const schema = z.object({
  reputationDelta: z.number().int().min(-500).max(500).optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
})

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req)
  if (!admin) return jsonError("Forbidden", 403)
  const { id } = await ctx.params

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return jsonError("Invalid update payload.")

  if (id === admin.id && parsed.data.role === "USER") {
    return jsonError("You cannot demote yourself.")
  }

  const target = await prisma.user.findUnique({ where: { id } })
  if (!target) return jsonError("User not found.", 404)

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(parsed.data.role ? { role: parsed.data.role } : {}),
      ...(parsed.data.reputationDelta
        ? { reputation: { increment: parsed.data.reputationDelta } }
        : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      reputation: true,
    },
  })

  return NextResponse.json({ user: updated })
}
