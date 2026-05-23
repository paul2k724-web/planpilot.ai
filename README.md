# PlanPilot AI

AI-powered project delivery dashboard built for recruiter demos, sprint planning,
risk visibility, and team execution.

PlanPilot AI turns a standard project management dashboard into a portfolio-grade
product: teams can manage projects and tasks, review timelines, search work,
track health signals, and generate sprint plans through a built-in AI-style
Copilot that works without AWS or a paid AI subscription.

## Highlights

- AI Sprint Copilot with sprint generation, task estimates, risk notes, and one-click board task creation
- AI-style planning engine that runs locally without paid model APIs
- Demo mode that runs without AWS Cognito when Cognito env vars are not provided
- Project dashboard with health score, completion rate, urgent work, overdue work, charts, and execution queue
- Project boards with Kanban drag-and-drop, list, table, and timeline views
- Full-stack architecture with Next.js, Express, Prisma, PostgreSQL, Redux Toolkit Query, Tailwind CSS, and MUI Data Grid
- Free-demo friendly deployment path using Vercel, Render, and Neon/PostgreSQL

## Demo Architecture

```mermaid
flowchart LR
  User["Recruiter / Demo User"] --> Client["Next.js Client on Vercel"]
  Client --> API["Express API on Render"]
  API --> DB["PostgreSQL on Neon"]
  API --> Copilot["Local AI Planning Engine"]
```

## Local Setup

Install dependencies:

```bash
cd client
npm ci

cd ../server
npm ci
```

Create server env:

```bash
cd server
cp .env.example .env
```

Set:

```env
PORT=8000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
CORS_ORIGIN=http://localhost:3000
```

Create client env:

```bash
cd client
cp .env.example .env.local
```

Set:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=
```

Leaving Cognito values blank enables demo mode.

Prepare database when you want PostgreSQL persistence:

```bash
cd server
npx prisma generate
npx prisma migrate deploy
npm run seed
```

Run locally:

```bash
cd server
npm run dev

cd ../client
npm run dev
```

Open `http://localhost:3000`.

For a no-database demo, run the server without `DATABASE_URL`. The backend uses
seeded in-memory data and the AI Copilot still works.

## Demo Mode

Demo mode lets recruiters run the app without AWS and without a database.

- Leave Cognito variables blank in the client.
- Omit `DATABASE_URL` or set `DEMO_MODE=true` in the server.
- The backend uses seeded in-memory data and stays fully functional.

## Deployment Without AWS

Recommended student-friendly deployment:

- Frontend: Vercel
- Backend: Render
- Database: Neon PostgreSQL

Set these environment variables in production:

Server:

```env
PORT=8000
DATABASE_URL="your-neon-postgres-url"
CORS_ORIGIN=https://your-vercel-app.vercel.app
```

Client:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-render-api.onrender.com
NEXT_PUBLIC_COGNITO_USER_POOL_ID=
NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=
```

## Testing

Backend route tests:

```bash
cd server
npm test
```

Playwright smoke test (requires backend + frontend running):

```bash
cd server
npm run dev

cd ../client
npm run dev
npm run test:e2e
```

## Resume Pitch

Built PlanPilot AI, a full-stack AI-powered project delivery dashboard using
Next.js, Node.js, Express, Prisma, PostgreSQL, Tailwind CSS, Redux Toolkit Query,
and MUI Data Grid. Implemented Kanban task management, project analytics,
timeline views, search, demo-mode authentication, and an AI Sprint Copilot that
generates sprint plans, risk scores, task estimates, and board-ready execution
items.

## Portfolio Assets

- Live demo: add your deployed URL here
- Demo video (60-90s): add your Loom or YouTube link here
- Screenshots: add `./screenshots/dashboard.png`, `./screenshots/copilot.png`, `./screenshots/board.png`
- Architecture diagram: use the Mermaid diagram above or replace it with an exported PNG

## Security Notes

`npm audit fix` was run for non-breaking updates. Remaining advisories are in
transitive dependencies tied to Next.js or AWS Amplify. If you want to clear
them fully, review `npm audit fix --force` and test build output before adopting.

## Verification

Current verified commands:

```bash
cd server && npm run build
cd client && npm run build
```

Both production builds pass.
