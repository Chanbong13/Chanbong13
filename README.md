# LifePilot 🚀

A comprehensive personal life management web app with LINE OA integration.

## Features

- **Task Management** — priorities, deadlines, reminders, categories
- **Health Tracking** — heart rate, blood pressure, sleep, steps, weight with charts
- **Mental Wellness Journal** — mood/stress/energy scoring + reflection notes
- **Workout Planner** — schedule, track, and log exercises
- **Food Calorie Tracking** — manual + LINE OA bot integration
- **Important Date Reminders** — birthdays, bills, appointments with LINE alerts
- **Habit Tracking** — daily habit check-in streaks
- **LINE OA Bot** — food logging and daily summaries via LINE

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, TypeScript, TailwindCSS, shadcn/ui |
| Backend | Next.js API Routes |
| ORM | Prisma |
| Database | PostgreSQL (Supabase) |
| Auth | NextAuth v5 |
| Charts | Recharts |
| Messaging | LINE Messaging API |

## Quick Start

### 1. Clone and install

```bash
git clone <repo>
cd lifepilot
npm install
```

### 2. Set up environment

```bash
cp .env.example .env
# Fill in your values
```

Required variables:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

Optional (for full features):
```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LINE_CHANNEL_ACCESS_TOKEN=
LINE_CHANNEL_SECRET=
```

### 3. Set up database

```bash
npm run db:push     # Push schema to database
npm run db:generate # Generate Prisma client
npm run db:seed     # Seed demo data (optional)
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo account:** `demo@lifepilot.app` / `demo1234`

## LINE OA Setup

1. Create a [LINE Official Account](https://developers.line.biz)
2. Enable Messaging API
3. Set webhook URL to: `https://your-domain.com/api/line/webhook`
4. Add channel tokens to `.env`
5. Users can send:
   - `กิน [food name]` → auto-log calories
   - `สรุป` → get today's summary
   - `task: [title]` → create a task

## Deployment

### Vercel + Supabase

1. Create a [Supabase](https://supabase.com) project
2. Copy the PostgreSQL connection string to `DATABASE_URL`
3. Deploy to [Vercel](https://vercel.com):
   ```bash
   npx vercel --prod
   ```
4. Set all environment variables in Vercel dashboard
5. Run migrations: `npx prisma migrate deploy`

### Database Schema

See `prisma/schema.prisma` for the complete schema:
- `User` + `Account` + `Session` (NextAuth)
- `Task` with status/priority/deadline
- `ImportantDate` with recurring support
- `HealthLog` — vitals tracking
- `MentalLog` — mood/stress/energy journaling
- `WorkoutPlan` — exercise scheduling
- `FoodLog` — calorie tracking
- `Habit` + `HabitLog` — habit streaks
- `Notification` — notification history
- `Integration` — LINE/Strava/Apple Health tokens

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Login, Register pages
│   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── page.tsx      # Dashboard home
│   │   ├── tasks/
│   │   ├── health/
│   │   ├── mental/
│   │   ├── workout/
│   │   ├── food/
│   │   ├── reminders/
│   │   ├── habits/
│   │   └── settings/
│   └── api/
│       ├── auth/         # NextAuth + register
│       ├── tasks/
│       ├── health/
│       ├── mental/
│       ├── workout/
│       ├── food/
│       ├── reminders/
│       ├── habits/
│       └── line/webhook/ # LINE webhook handler
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Sidebar, Navbar, ThemeProvider
│   ├── dashboard/        # Dashboard widgets
│   ├── tasks/
│   ├── health/
│   ├── mental/
│   ├── workout/
│   ├── food/
│   ├── reminders/
│   └── habits/
├── lib/
│   ├── auth.ts           # NextAuth config
│   ├── prisma.ts         # Prisma client
│   ├── line.ts           # LINE API helpers
│   ├── utils.ts          # Utility functions
│   └── validations.ts    # Zod schemas
├── hooks/
│   └── use-toast.ts
└── types/
    └── next-auth.d.ts
```

## Future Improvements

- [ ] AI productivity analysis (Claude API)
- [ ] AI mood trend analysis
- [ ] Strava API sync
- [ ] Apple HealthKit integration
- [ ] Pomodoro timer
- [ ] Focus mode
- [ ] Smart reminder scheduling
- [ ] PWA / mobile app
- [ ] Export data to CSV/PDF
