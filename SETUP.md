# MentorMesh — Complete Setup Guide (Easy Words)

This guide is for someone who received the **MentorMesh zip file**.

Follow the steps **in order**. You do **not** need Docker.

By the end you will:

1. Run the project on your computer  
2. Upload it to **GitHub**  
3. Host it online with **Vercel** (free)

---

## What is MentorMesh?

MentorMesh is a campus Q&A website (Next.js + PostgreSQL).

Students can:

- Sign up / log in  
- Ask questions (with images)  
- Answer, vote, bookmark  
- Follow tags and get notifications  

---

## Part 0 — What you need before starting

Install these on your computer (Windows is fine):

| Tool | Why | Download |
|------|-----|----------|
| **Node.js 20 or newer** | Runs the website | https://nodejs.org (LTS version) |
| **Git** | Upload to GitHub | https://git-scm.com |
| **A code editor (optional)** | Easy to edit files | https://code.visualstudio.com or Cursor |
| **GitHub account** | Free code hosting | https://github.com |
| **Neon account** | Free online database (no Docker) | https://neon.tech |
| **Vercel account** | Free website hosting | https://vercel.com (sign in with GitHub) |

### Check that Node.js works

Open **PowerShell** or **Command Prompt** and run:

```bash
node -v
npm -v
```

You should see version numbers (example: `v20.x.x` and `10.x.x`).  
If not, install Node.js again and **restart** the terminal.

---

## Part 1 — Unzip the project

1. Download the zip file  
2. Right-click → **Extract All…**  
3. Put it somewhere simple, for example:

```text
C:\Projects\Mentormesh
```

4. Open that folder. You should see files like:

- `package.json`
- `prisma`
- `app`
- `.env.example`
- this guide (`SETUP.md`)

> Tip: Do **not** work inside `Downloads` forever. Move the folder to `Documents` or `C:\Projects`.

---

## Part 2 — Create a free database (Neon) — NO Docker

MentorMesh needs PostgreSQL. Neon gives you that in the cloud for free.

### Steps

1. Go to https://neon.tech and sign up (GitHub login is easiest)  
2. Click **Create a project**  
3. Give it any name (example: `mentormesh`)  
4. Choose a region close to you  
5. Click **Create**  
6. On the dashboard, find **Connection string**  
7. Copy the URL that looks like:

```text
postgresql://username:password@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
```

Keep this secret. Do not post it publicly.

---

## Part 3 — Create your `.env` file

1. In the project folder, find `.env.example`  
2. Copy it and rename the copy to `.env`  

### On Windows (PowerShell)

Open PowerShell **inside the Mentormesh folder**:

```powershell
cd C:\Projects\Mentormesh
copy .env.example .env
```

3. Open `.env` in Notepad / VS Code and edit it like this:

```env
DATABASE_URL="paste-your-neon-connection-string-here"
JWT_SECRET="change-this-to-any-long-random-text-at-least-32-characters"
DEFAULT_USER_PASSWORD="MentorMesh123"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Notes

- `DATABASE_URL` = your Neon link (keep the quotes)  
- `JWT_SECRET` = any long random sentence/password (used for login cookies)  
- `DEFAULT_USER_PASSWORD` = password used when seeding demo users  
- Do **not** upload `.env` to GitHub (it is already ignored)

---

## Part 4 — Install and run on your computer

Open PowerShell in the Mentormesh folder:

```powershell
cd C:\Projects\Mentormesh
```

### Step A — Install packages

```powershell
npm install
```

This may take a few minutes. Wait until it finishes.

### Step B — Create database tables

```powershell
npx prisma db push
```

### Step C — Fill the database with demo data

```powershell
npm run db:seed
```

This creates:

- ~1000 student accounts from the campus roll list  
- Branch questions (AIML, RAI, CEA, CSE, etc.)  
- Tags, follows, notifications  
- Admin account  

### Step D — Start the website

```powershell
npm run dev
```

Then open your browser:

```text
http://localhost:3000
```

Leave the terminal open while you use the site.

---

## Part 5 — How to log in (after seed)

### Admin

- Email: `admin@mentormail.com`  
- Password: `MentorMesh123`  
  (or whatever you set in `DEFAULT_USER_PASSWORD`)

### Any student

- Email format: `{enrollmentNumber}@mentormail.com`  
  Example: `22002170110056@mentormail.com`  
- Password: same as `DEFAULT_USER_PASSWORD` (default `MentorMesh123`)

---

## Part 6 — Upload to GitHub

### A. Create an empty GitHub repo

1. Go to https://github.com  
2. Click **+** → **New repository**  
3. Name it `Mentormesh` (or any name)  
4. Keep it **Public** (or Private if your teacher prefers)  
5. Do **NOT** add README / .gitignore / license (your zip already has the project)  
6. Click **Create repository**

### B. Push your code from the computer

In PowerShell (inside Mentormesh folder):

```powershell
git init
git add .
git commit -m "Initial MentorMesh project"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/Mentormesh.git
git push -u origin main
```

Replace `YOUR_GITHUB_USERNAME` with your real GitHub username.

### First time Git asks you to log in

- Use your GitHub account in the browser popup, **or**  
- Install GitHub CLI (`gh`) and run `gh auth login`

### Important safety check

Never commit `.env`.  
If someone asks for your Neon password / JWT secret, do not share it in chat publicly.

After push, open:

```text
https://github.com/YOUR_GITHUB_USERNAME/Mentormesh
```

---

## Part 7 — Host online with Vercel (free)

### A. Import the GitHub project

1. Go to https://vercel.com  
2. Sign in with **GitHub**  
3. Click **Add New…** → **Project**  
4. Find **Mentormesh** and click **Import**

### B. Add environment variables (very important)

Before / during deploy, open **Environment Variables** and add:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Same Neon connection string from your `.env` |
| `JWT_SECRET` | Same long secret from your `.env` |
| `DEFAULT_USER_PASSWORD` | `MentorMesh123` (or your chosen password) |
| `NEXT_PUBLIC_APP_URL` | Leave blank for first deploy, then update (see below) |

Make sure these are enabled for **Production**.

### C. Deploy

1. Click **Deploy**  
2. Wait 1–3 minutes  
3. Vercel gives you a link like:

```text
https://mentormesh-xxxx.vercel.app
```

4. Open that link in your browser

### D. Update the public URL

1. In Vercel → Project → **Settings** → **Environment Variables**  
2. Set:

```text
NEXT_PUBLIC_APP_URL=https://your-real-vercel-link.vercel.app
```

3. Redeploy once (Deployments → … → Redeploy)

---

## Part 8 — Does the online site have data?

Yes, **if** you already ran `npm run db:seed` against the **same Neon database**.

- Local computer and Vercel can share the **same Neon DB**  
- Then the online site already has users/questions  

If the online site looks empty:

```powershell
cd C:\Projects\Mentormesh
npm run db:seed
```

(This uses your local `.env` Neon URL and fills the cloud DB again.)

> Warning: seeding **deletes and recreates** demo data. Do not run seed on a database with real important data you want to keep.

---

## Part 9 — Day-to-day commands (cheat sheet)

### Run locally

```powershell
cd C:\Projects\Mentormesh
npm run dev
```

### Stop local server

In the terminal: press `Ctrl + C`

### After code changes, push to GitHub

```powershell
git add .
git commit -m "Describe what you changed"
git push
```

Vercel usually auto-redeploys after every push to `main`.

### Reset / recreate demo data

```powershell
npm run db:seed
```

---

## Part 10 — What is NOT inside the zip?

| Item | Inside zip? | What to do |
|------|-------------|------------|
| Source code | Yes | Use it |
| `node_modules` | Usually no | Run `npm install` |
| Live database | No | Use Neon + `db push` + `db:seed` |
| Your personal `.env` secrets | Should be no | Create your own `.env` |

So: zip = code. Database = created by Neon + seed commands.

---

## Part 11 — Common problems (and fixes)

### `npm` is not recognized

- Node.js is not installed, or terminal was not restarted  
- Reinstall Node.js LTS → close and reopen PowerShell

### `Can't reach database server`

- Wrong `DATABASE_URL`  
- Neon project paused (free tier may sleep) → open Neon dashboard and wake it  
- Missing `?sslmode=require` on Neon URL

### `JWT_SECRET missing or too short`

- Make `JWT_SECRET` at least 16–32 characters in `.env`

### Site works locally but Vercel login fails

- Env vars missing on Vercel  
- Different `JWT_SECRET` than you expect  
- Redeploy after adding env vars

### `prisma` / seed errors

Run again from the project folder:

```powershell
npx prisma generate
npx prisma db push
npm run db:seed
```

### Images uploaded on Vercel disappear later

Normal for a student demo. Vercel’s server filesystem is temporary.  
Local uploads and Dicebear avatars are fine for college demos.

### Port 3000 already used

```powershell
npx next dev -p 3001
```

Then open `http://localhost:3001`

---

## Part 12 — Suggested folder checklist before zipping (for the sender)

If **you** are making the zip for a friend, exclude:

- `node_modules`
- `.next`
- `.env` (send `.env.example` only)
- `.git` (optional; they can create a new GitHub repo)

Include:

- all source code  
- `prisma/`  
- `data/`  
- `SETUP.md` (this file)  
- `.env.example`  
- `package.json`

---

## Part 13 — Final success checklist

- [ ] Node.js installed (`node -v` works)  
- [ ] Project unzipped  
- [ ] Neon database created  
- [ ] `.env` filled  
- [ ] `npm install` done  
- [ ] `npx prisma db push` done  
- [ ] `npm run db:seed` done  
- [ ] `npm run dev` opens on http://localhost:3000  
- [ ] Can log in with admin or student account  
- [ ] Code pushed to GitHub  
- [ ] Vercel project connected  
- [ ] Vercel env vars set  
- [ ] Live Vercel link opens and works  

---

## Need help?

Check these first:

1. Are you inside the Mentormesh folder in the terminal?  
2. Does `.env` exist and have the Neon URL?  
3. Did seed finish without red errors?  
4. Did you add the same env vars on Vercel?

If something fails, copy the **full error text** from the terminal and share it with your teammate / teacher.

---

**You’re done.**  
Local app → GitHub → Vercel live link. No Docker required.
