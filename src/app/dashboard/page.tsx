import { getDashboardData } from "@/services/dashboard"
import { auth } from "@/auth"
import {
  CheckCircle2,
  ListTodo,
  AlertTriangle,
  FolderOpen,
  Clock,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardCharts } from "@/components/dashboard-charts"
import { formatDistanceToNow } from "date-fns"

export default async function DashboardPage() {
  const session = await auth()
  const data = await getDashboardData()

  if (!data) return null

  const statCards = [
    {
      title: "Total Tasks",
      value: data.totalTasks,
      icon: ListTodo,
      gradient: "from-blue-500 to-blue-600",
      bgGlow: "bg-blue-500/10",
    },
    {
      title: "Completed",
      value: data.completedTasks,
      icon: CheckCircle2,
      gradient: "from-emerald-500 to-emerald-600",
      bgGlow: "bg-emerald-500/10",
    },
    {
      title: "Overdue",
      value: data.overdueTasks,
      icon: AlertTriangle,
      gradient: "from-rose-500 to-rose-600",
      bgGlow: "bg-rose-500/10",
    },
    {
      title: "Active Projects",
      value: data.activeProjects,
      icon: FolderOpen,
      gradient: "from-violet-500 to-violet-600",
      bgGlow: "bg-violet-500/10",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {session?.user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-muted-foreground">
          Here&apos;s an overview of your tasks and projects.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card
            key={card.title}
            className="group relative overflow-hidden border-0 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className={`absolute inset-0 ${card.bgGlow} opacity-0 transition-opacity group-hover:opacity-100`} />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-lg bg-gradient-to-br ${card.gradient} p-2`}>
                <card.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Activity */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Charts */}
        <div className="lg:col-span-4">
          <DashboardCharts statusDistribution={data.statusDistribution} />
        </div>

        {/* Recent Activity */}
        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-4 w-4 text-chart-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest actions across your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentActivity.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No activity yet
                </p>
              ) : (
                data.recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                  >
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-chart-1" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-snug">
                        <span className="font-medium">{activity.user.name}</span>{" "}
                        <span className="text-muted-foreground">
                          {activity.action}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {activity.project.title} ·{" "}
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Tasks */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-chart-4" />
            My Tasks
          </CardTitle>
          <CardDescription>Tasks assigned to you</CardDescription>
        </CardHeader>
        <CardContent>
          {data.myTasks.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              No tasks assigned
            </p>
          ) : (
            <div className="space-y-2">
              {data.myTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {task.project.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        task.priority === "HIGH"
                          ? "destructive"
                          : task.priority === "MEDIUM"
                          ? "default"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {task.priority}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        task.status === "DONE"
                          ? "border-emerald-500/30 text-emerald-500"
                          : task.status === "IN_PROGRESS"
                          ? "border-blue-500/30 text-blue-500"
                          : "border-muted-foreground/30"
                      }
                    >
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
