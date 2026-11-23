import { prisma } from "@/lib/db"

export async function notifyUser(input: {
  userId: string
  title: string
  message: string
  link?: string
  questionId?: string
}) {
  if (!input.userId) return
  return prisma.notification.create({
    data: {
      userId: input.userId,
      title: input.title,
      message: input.message,
      link: input.link,
      questionId: input.questionId,
    },
  })
}

export async function notifyTagFollowers(input: {
  tagIds: string[]
  excludeUserId: string
  title: string
  message: string
  link: string
  questionId: string
}) {
  if (!input.tagIds.length) return
  const follows = await prisma.tagFollow.findMany({
    where: {
      tagId: { in: input.tagIds },
      userId: { not: input.excludeUserId },
    },
    select: { userId: true },
  })
  const unique = [...new Set(follows.map((f) => f.userId))]
  if (!unique.length) return

  await prisma.notification.createMany({
    data: unique.map((userId) => ({
      userId,
      title: input.title,
      message: input.message,
      link: input.link,
      questionId: input.questionId,
    })),
  })
}
