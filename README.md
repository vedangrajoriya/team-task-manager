# Team Task Manager (TaskFlow)

A modern SaaS-style task and project management platform with role-based access control, built with Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Prisma, and PostgreSQL.

## Features

- **Authentication**: Sign up, login, logout with Auth.js (NextAuth) Credentials Provider
- **Role-Based Access Control**: ADMIN and MEMBER roles with backend authorization
- **Projects**: Create, edit, delete projects; add/remove members
- **Tasks**: Create, assign, filter, search, change status/priority, set due dates
- **Dashboard**: Stat cards, task distribution chart, recent activity, task list
- **Dark/Light Mode**: Full theme support via next-themes
- **Responsive UI**: Modern design with shadcn/ui components

## Tech Stack

- Next.js 15+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma ORM
- PostgreSQL
- Auth.js (NextAuth)
- Zod validation
- Recharts (charts)
- Lucide Icons

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@host:port/database"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### Database Setup

```bash
npx prisma db push
npx prisma db seed
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seed Data

| Email             | Password    | Role   |
| ----------------- | ----------- | ------ |
| admin@example.com | password123 | ADMIN  |
| alice@example.com | password123 | MEMBER |
| bob@example.com   | password123 | MEMBER |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/auth/           # NextAuth API route
│   ├── dashboard/          # Dashboard pages
│   │   ├── projects/       # Projects pages
│   │   └── page.tsx        # Dashboard home
│   ├── login/              # Login page
│   ├── register/           # Register page
│   └── page.tsx            # Landing page
├── actions/                # Server actions
│   ├── auth.ts             # Auth actions
│   ├── projects.ts         # Project CRUD
│   └── tasks.ts            # Task CRUD
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── dashboard-charts.tsx
│   ├── dashboard-nav.tsx
│   ├── member-list.tsx
│   ├── project-header.tsx
│   ├── task-list.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/                    # Utilities
│   ├── prisma.ts
│   └── utils.ts
├── services/               # Data fetching
│   └── dashboard.ts
├── types/                  # TypeScript types
│   └── next-auth.d.ts
├── auth.config.ts          # NextAuth config
├── auth.ts                 # NextAuth exports
└── middleware.ts           # Route protection
```

## License

MIT
