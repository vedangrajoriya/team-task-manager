# TaskFlow: Team Task Manager

[![Live Production Deployment](https://img.shields.io/badge/Live%20Demo-TaskFlow-2ecc71?style=for-the-badge&logo=vercel)](https://team-task-manager-production-2a63.up.railway.app/)

TaskFlow is a modern, production-grade SaaS-style task and project management platform. Built with a focus on performance, aesthetics, and robust role-based access control (RBAC), it provides teams with the tools they need to collaborate efficiently.

**Live Production URL:** [https://team-task-manager-production-2a63.up.railway.app/](https://team-task-manager-production-2a63.up.railway.app/)

---

## 🌟 Key Features

*   **Secure Authentication:** Session-based authentication using **Auth.js (NextAuth v5)** with Credentials Provider and Bcrypt password hashing.
*   **Role-Based Access Control (RBAC):**
    *   🛡️ **ADMIN**: Full control over projects, tasks, and member management.
    *   👤 **MEMBER**: Can view assigned projects and update the status of their assigned tasks only. Server actions rigorously enforce these rules.
*   **Advanced Project Management:**
    *   Create, edit, and delete projects.
    *   Manage project members (add/remove users).
    *   Real-time progress tracking.
*   **Comprehensive Task Management:**
    *   Create tasks with rich metadata (Assignee, Priority, Status, Due Date).
    *   Advanced filtering (by Status, Priority, Assignee) and search capabilities.
    *   Inline status updates for seamless workflow.
*   **Analytics Dashboard:**
    *   Aggregated key metrics (Total Projects, Active Tasks, Completion Rate).
    *   Interactive task distribution charts using **Recharts**.
    *   Recent activity feed for a quick overview.
*   **Premium UI/UX:**
    *   Built with **shadcn/ui (v4)** and **Tailwind CSS**.
    *   Fully responsive, "glassmorphism" design inspired by modern SaaS platforms.
    *   Built-in Dark/Light mode support via `next-themes`.
    *   Smooth transitions and micro-interactions.

---

## 🛠️ Technology Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | Next.js 15+ (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | Auth.js (NextAuth v5) |
| **Styling** | Tailwind CSS v4 |
| **UI Components**| shadcn/ui (using `@base-ui/react` primitives) |
| **Validation** | Zod v4 |
| **Icons** | Lucide React |
| **Charts** | Recharts |

---

## 🚀 Getting Started (Local Development)

### Prerequisites

*   Node.js 18+
*   A running PostgreSQL database instance (e.g., local, Docker, or managed service like Railway/Neon).

### 1. Clone the repository

```bash
git clone https://github.com/vedangrajoriya/team-task-manager.git
cd team-task-manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following:

```env
# Database connection string
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth Configuration
# Generate a secret using: openssl rand -base64 32
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Auth.js v5 compatibility
AUTH_SECRET="your-super-secret-key"
AUTH_TRUST_HOST=true
```

### 4. Database Setup & Seeding

Push the Prisma schema to your database and run the seed script to populate initial data:

```bash
npx prisma db push
npx prisma db seed
```

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## 🔑 Demo Credentials

The database seed script (`prisma/seed.ts`) automatically creates the following test accounts:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@example.com` | `password123` | Full access. Can create/delete projects and tasks, and manage members. |
| **MEMBER** | `alice@example.com` | `password123` | Read access to assigned projects. Can only update status of assigned tasks. |
| **MEMBER** | `bob@example.com` | `password123` | Read access to assigned projects. Can only update status of assigned tasks. |

---

## 📁 Project Structure

```text
src/
├── actions/         # Secure Next.js Server Actions (Auth, Projects, Tasks)
├── app/             # Next.js App Router (Pages, Layouts, API Routes)
│   ├── api/auth/    # NextAuth dynamic route handler
│   ├── dashboard/   # Protected dashboard routes
│   ├── login/       # Public login page
│   ├── register/    # Public registration page
│   └── globals.css  # Global styles and Tailwind configuration
├── components/      # Reusable React components
│   └── ui/          # shadcn/ui building blocks
├── lib/             # Utility functions and Prisma client instance
├── services/        # Data aggregation logic (e.g., Dashboard stats)
├── types/           # Global TypeScript type definitions
├── auth.config.ts   # NextAuth configuration options
├── auth.ts          # NextAuth export functions
└── middleware.ts    # Edge middleware for route protection
prisma/
├── schema.prisma    # Database schema definition
└── seed.ts          # Initial data population script
```

---

## 📄 License

This project is licensed under the MIT License.
