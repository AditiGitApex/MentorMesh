# MentorMesh backend

## Stack
- **PostgreSQL 17** (Docker Compose on port `5433`)
- **Prisma** ORM
- **Next.js App Router API** (`/api/*`)
- **JWT httpOnly cookies** + **bcrypt** passwords

## Quick start
```bash
docker compose up -d
npm install --legacy-peer-deps
npx prisma db push
npm run db:seed
npm run dev
```

## Roster accounts
All students from the TY1–TY4 SEM-7 roll list PDFs are seeded with:

- **Email:** `{enrollmentNumber}@mentormail.com`
- **Default password:** `MentorMesh123` (from `.env` `DEFAULT_USER_PASSWORD`)

Admin:
- `admin@mentormail.com` / `MentorMesh123`

## Notes
- Mentor phone numbers from the PDFs are **not** stored.
- Seed data lives in `data/students.json` (generated from the PDFs).
