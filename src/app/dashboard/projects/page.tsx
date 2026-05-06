import { getProjects } from "@/actions/projects"
import { auth } from "@/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FolderKanban, Users, ListTodo } from "lucide-react"

export default async function ProjectsPage() {
  const session = await auth()
  const projects = await getProjects()
  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track all your projects
          </p>
        </div>
        {isAdmin && (
          <Link href="/dashboard/projects/new">
            <Button className="bg-gradient-to-r from-chart-1 to-chart-2 text-white shadow-lg shadow-blue-500/25">
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </Link>
        )}
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FolderKanban className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {isAdmin
                ? "Create your first project to get started."
                : "You haven't been added to any projects yet."}
            </p>
            {isAdmin && (
              <Link href="/dashboard/projects/new" className="mt-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Create Project
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const done = project.tasks.filter((t) => t.status === "DONE").length
            const total = project.tasks.length
            const progress = total > 0 ? Math.round((done / total) * 100) : 0

            return (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
                <Card className="group cursor-pointer border-0 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-chart-1/10 to-chart-2/10">
                        <FolderKanban className="h-5 w-5 text-chart-1" />
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {progress}% complete
                      </Badge>
                    </div>
                    <CardTitle className="mt-3 text-base group-hover:text-chart-1 transition-colors">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-xs">
                      {project.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {/* Progress bar */}
                    <div className="mb-3 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-chart-1 to-chart-3 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ListTodo className="h-3 w-3" />
                        {project._count.tasks} tasks
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {project._count.members} members
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
