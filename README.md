# MentorMesh

Campus Q&A platform for students — ask questions, answer peers, follow tags, and build reputation.

## Quick start

See **[SETUP.md](./SETUP.md)** for full instructions (Neon database, local run, GitHub, Vercel).

```bash
npm install
# create .env from .env.example (Neon DATABASE_URL + JWT_SECRET)
npx prisma db push
npm run db:seed
npm run dev
```

## Demo login (after seed)

- Admin: `admin@mentormail.com` / `MentorMesh123`
- Students: `{enrollment}@mentormail.com` / `MentorMesh123`

## Stack

Next.js · Prisma · PostgreSQL · Tailwind · Vercel
