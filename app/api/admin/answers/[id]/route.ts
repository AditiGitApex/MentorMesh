import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { requireAdmin, jsonError } from "@/lib/auth"

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(req)
  if (!admin) return jsonError("Forbidden", 403)
  const { id } = await ctx.params

  const existing = await prisma.answer.findUnique({ where: { id } })
  if (!existing) return jsonError("Answer not found.", 404)

  await prisma.answer.delete({ where: { id } })
  return NextResponse.json({ ok: true, id, questionId: existing.questionId })
}
