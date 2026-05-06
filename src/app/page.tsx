import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Zap, ArrowRight, CheckCircle2 } from "lucide-react"

export default function HomePage() {
  const features = [
    "Role-Based Access Control",
    "Real-time Project Tracking",
    "Task Assignment & Prioritization",
    "Team Collaboration",
    "Activity Logging",
    "Dashboard Analytics",
  ]

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20">
      {/* Navbar */}
      <nav className="border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-chart-1 to-chart-2 text-white">
              <Zap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">TaskFlow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-chart-1 to-chart-2 text-white shadow-lg shadow-blue-500/25">
                Get Started <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="mx-auto max-w-3xl text-center">
          {/* Background effects */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/3 -translate-x-1/2 h-96 w-96 rounded-full bg-chart-1/5 blur-[100px]" />
            <div className="absolute left-1/3 top-1/2 h-64 w-64 rounded-full bg-chart-2/5 blur-[80px]" />
          </div>

          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-background/80 px-4 py-1.5 text-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Now in public beta
            </div>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Manage tasks
              <br />
              <span className="bg-gradient-to-r from-chart-1 to-chart-2 bg-clip-text text-transparent">
                like never before
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              A modern project management platform built for teams. Organize, track,
              and deliver projects with powerful role-based access control.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-12 bg-gradient-to-r from-chart-1 to-chart-2 px-8 text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40"
                >
                  Start Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="h-12 px-8">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Features list */}
            <div className="mx-auto mt-16 grid max-w-lg gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-2 rounded-lg border bg-background/50 p-3 text-sm backdrop-blur"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
