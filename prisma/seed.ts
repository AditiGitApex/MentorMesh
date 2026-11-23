import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import fs from "node:fs"
import path from "node:path"
import { BRANCH_THREADS } from "../data/branch-threads"
import { buildExtraThreads } from "../data/extra-threads"
import { personalThread } from "../data/personal-threads"

const prisma = new PrismaClient()

type Student = {
  enrollmentNo: string
  name: string
  email: string
  branch: string
  division: string
  rollNo: number
  batch: string
  section: string
}

function avatarFor(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`
}

function daysAgo(n: number) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(10 + (n % 8), (n * 7) % 60, 0, 0)
  return d
}

async function main() {
  const password = process.env.DEFAULT_USER_PASSWORD || "MentorMesh123"
  const passwordHash = await bcrypt.hash(password, 10)

  const studentsPath = path.join(process.cwd(), "data", "students.json")
  const students: Student[] = JSON.parse(fs.readFileSync(studentsPath, "utf8"))

  console.log(`Seeding ${students.length} roster students...`)

  await prisma.notification.deleteMany()
  await prisma.tagFollow.deleteMany()
  await prisma.bookmark.deleteMany()
  await prisma.answerVote.deleteMany()
  await prisma.questionVote.deleteMany()
  await prisma.answer.deleteMany()
  await prisma.questionTag.deleteMany()
  await prisma.question.deleteMany()
  await prisma.tag.deleteMany()
  await prisma.user.deleteMany()

  const BATCH = 100
  for (let i = 0; i < students.length; i += BATCH) {
    const slice = students.slice(i, i + BATCH)
    await prisma.user.createMany({
      data: slice.map((s) => ({
        enrollmentNo: s.enrollmentNo,
        email: s.email.toLowerCase(),
        name: s.name,
        passwordHash,
        avatar: avatarFor(s.enrollmentNo),
        reputation: Math.floor(Math.random() * 40),
        branch: s.branch || null,
        division: s.division || null,
        rollNo: s.rollNo || null,
        batch: s.batch || null,
        section: s.section || null,
        role: "USER" as const,
      })),
      skipDuplicates: true,
    })
    console.log(`  users ${Math.min(i + BATCH, students.length)}/${students.length}`)
  }

  await prisma.user.upsert({
    where: { email: "admin@mentormail.com" },
    update: { passwordHash, reputation: 500, role: "ADMIN" },
    create: {
      email: "admin@mentormail.com",
      name: "MentorMesh Admin",
      passwordHash,
      avatar: avatarFor("admin"),
      reputation: 500,
      role: "ADMIN",
      enrollmentNo: null,
      bio: "Platform steward for MentorMesh.",
    },
  })

  // Collect all tags
  const ALL_THREADS = [...BRANCH_THREADS, ...buildExtraThreads()]
  const tagNames = [
    ...new Set(ALL_THREADS.flatMap((t) => [...t.tags, t.branch])),
  ].sort()
  for (const name of tagNames) {
    await prisma.tag.create({ data: { name } })
  }
  const tagMap = Object.fromEntries((await prisma.tag.findMany()).map((t) => [t.name, t.id]))
  console.log(`Tags: ${tagNames.length}`)

  // Authors by branch
  const users = await prisma.user.findMany({
    where: { role: "USER", branch: { not: null } },
    select: { id: true, name: true, email: true, branch: true },
  })
  const byBranch = new Map<string, typeof users>()
  for (const u of users) {
    const b = u.branch || "CSE"
    if (!byBranch.has(b)) byBranch.set(b, [])
    byBranch.get(b)!.push(u)
  }

  const pick = (branch: string, offset = 0) => {
    const pool = byBranch.get(branch) || users
    if (!pool.length) return users[0]
    return pool[offset % pool.length]
  }

  console.log(`Seeding ${ALL_THREADS.length} branch threads...`)
  let qCount = 0
  for (let i = 0; i < ALL_THREADS.length; i++) {
    const thread = ALL_THREADS[i]
    const author = pick(thread.branch, i)
    const answerers = [
      pick(thread.branch, i + 1),
      pick(thread.branch, i + 2),
    ].filter((u) => u && u.id !== author.id)

    const createdAt = daysAgo((i % 20) + 1)
    const tagIds = [...new Set(thread.tags)]
      .map((n) => tagMap[n])
      .filter(Boolean)

    const question = await prisma.question.create({
      data: {
        title: thread.title,
        description: thread.description,
        authorId: author.id,
        votes: thread.votes ?? 5 + (i % 17),
        createdAt,
        updatedAt: createdAt,
        tags: { create: tagIds.map((tagId) => ({ tagId })) },
        answers: {
          create: thread.answers.map((a, ai) => {
            const ansAuthor = answerers[ai % Math.max(answerers.length, 1)] || pick(thread.branch, i + 3)
            return {
              content: a.content,
              authorId: ansAuthor.id,
              votes: 3 + ((i + ai) % 12),
              isAccepted: !!a.accepted,
              createdAt: new Date(createdAt.getTime() + (ai + 1) * 3600_000 * 5),
            }
          }),
        },
      },
      include: { answers: true },
    })

    // Reputation bumps for accepted answers
    for (const ans of question.answers) {
      if (ans.isAccepted) {
        await prisma.user.update({
          where: { id: ans.authorId },
          data: { reputation: { increment: 25 } },
        })
      } else {
        await prisma.user.update({
          where: { id: ans.authorId },
          data: { reputation: { increment: 5 } },
        })
      }
    }
    await prisma.user.update({
      where: { id: author.id },
      data: { reputation: { increment: 3 } },
    })

    // Notify question author about first answer
    if (question.answers[0] && question.answers[0].authorId !== author.id) {
      await prisma.notification.create({
        data: {
          userId: author.id,
          title: "New answer",
          message: `Someone answered your question "${question.title}".`,
          link: `/questions/${question.id}`,
          questionId: question.id,
          createdAt: question.answers[0].createdAt,
          read: i % 3 === 0,
        },
      })
    }

    qCount++
  }
  console.log(`  curated questions created: ${qCount}`)

  // Ensure EVERY roster user (enrollment ID) has asked at least one question
  console.log("Seeding one question per enrollment ID...")
  for (const name of ["Help", "Campus"]) {
    if (!tagMap[name]) {
      const t = await prisma.tag.create({ data: { name } })
      tagMap[name] = t.id
    }
  }

  const usersNeedingQuestion = await prisma.user.findMany({
    where: {
      role: "USER",
      enrollmentNo: { not: null },
      questions: { none: {} },
    },
    select: {
      id: true,
      name: true,
      email: true,
      enrollmentNo: true,
      branch: true,
    },
    orderBy: { enrollmentNo: "asc" },
  })

  const Q_BATCH = 40
  let personalCount = 0
  for (let i = 0; i < usersNeedingQuestion.length; i += Q_BATCH) {
    const slice = usersNeedingQuestion.slice(i, i + Q_BATCH)
    await Promise.all(
      slice.map(async (u, offset) => {
        const idx = i + offset
        const thread = personalThread({
          name: u.name,
          enrollmentNo: u.enrollmentNo,
          branch: u.branch,
          index: idx,
        })
        const tagIds = [...new Set(thread.tags)]
          .map((n) => tagMap[n])
          .filter(Boolean)
        const createdAt = daysAgo((idx % 45) + 1)
        const classmate = pick(u.branch || "CSE", idx + 17)

        await prisma.question.create({
          data: {
            title: thread.title,
            description: thread.description,
            authorId: u.id,
            votes: 1 + (idx % 9),
            createdAt,
            updatedAt: createdAt,
            tags: { create: tagIds.map((tagId) => ({ tagId })) },
            ...(classmate && classmate.id !== u.id && idx % 3 === 0
              ? {
                  answers: {
                    create: [
                      {
                        content: `<p>Start with the fundamentals, keep a short notes doc, and ask a follow-up here with what you already tried. You’re on the right track, ${u.name.split(" ")[0]}.</p>`,
                        authorId: classmate.id,
                        votes: 1 + (idx % 5),
                        isAccepted: false,
                        createdAt: new Date(createdAt.getTime() + 6 * 3600_000),
                      },
                    ],
                  },
                }
              : {}),
          },
        })
      })
    )
    personalCount += slice.length
    console.log(`  personal questions ${personalCount}/${usersNeedingQuestion.length}`)
  }

  // Auto-follow branch tags for every student
  console.log("Seeding tag follows for all students...")
  for (const [branch, pool] of byBranch.entries()) {
    const tagId = tagMap[branch]
    if (!tagId || !pool.length) continue
    await prisma.tagFollow.createMany({
      data: pool.map((u) => ({ userId: u.id, tagId })),
      skipDuplicates: true,
    })
    if (tagMap["Career"]) {
      await prisma.tagFollow.createMany({
        data: pool.map((u) => ({ userId: u.id, tagId: tagMap["Career"] })),
        skipDuplicates: true,
      })
    }
    if (tagMap["Help"]) {
      await prisma.tagFollow.createMany({
        data: pool.map((u) => ({ userId: u.id, tagId: tagMap["Help"] })),
        skipDuplicates: true,
      })
    }
  }

  // Welcome notifications for first 40 users
  const sampleUsers = users.slice(0, 40)
  await prisma.notification.createMany({
    data: sampleUsers.map((u) => ({
      userId: u.id,
      title: "Welcome to MentorMesh",
      message: `Hi ${u.name.split(" ")[0]}, your campus mail is ${u.email}. Follow tags in your branch to get thread alerts.`,
      link: "/tags",
      read: false,
    })),
  })

  // Notify followers about a recent branch question
  const sampleQ = await prisma.question.findFirst({
    orderBy: { createdAt: "desc" },
    include: { tags: { include: { tag: true } }, author: true },
  })
  if (sampleQ) {
    const tagIds = sampleQ.tags.map((t) => t.tagId)
    const follows = await prisma.tagFollow.findMany({
      where: { tagId: { in: tagIds }, userId: { not: sampleQ.authorId } },
      take: 30,
    })
    if (follows.length) {
      await prisma.notification.createMany({
        data: follows.map((f) => ({
          userId: f.userId,
          title: "New thread in a tag you follow",
          message: `${sampleQ.author.name} posted “${sampleQ.title}”.`,
          link: `/questions/${sampleQ.id}`,
          questionId: sampleQ.id,
          read: false,
        })),
        skipDuplicates: true,
      })
    }
  }

  const [userCount, questionCount, answerCount, followCount, notifCount, authorsWithQuestions] =
    await Promise.all([
      prisma.user.count(),
      prisma.question.count(),
      prisma.answer.count(),
      prisma.tagFollow.count(),
      prisma.notification.count(),
      prisma.user.count({
        where: { role: "USER", enrollmentNo: { not: null }, questions: { some: {} } },
      }),
    ])

  const rosterUsers = await prisma.user.count({
    where: { role: "USER", enrollmentNo: { not: null } },
  })

  console.log(`Done.
  users=${userCount}
  rosterUsers=${rosterUsers}
  authorsWithQuestions=${authorsWithQuestions}
  questions=${questionCount}
  answers=${answerCount}
  tagFollows=${followCount}
  notifications=${notifCount}
  password=${password}
  admin=admin@mentormail.com`)

  if (authorsWithQuestions < rosterUsers) {
    throw new Error(
      `Expected every enrollment to author a question (${authorsWithQuestions}/${rosterUsers}).`
    )
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
