import { getProject } from "@/actions/projects"
import { auth } from "@/auth"
import { notFound } from "next/navigation"
import { ProjectHeader } from "@/components/project-header"
import { TaskList } from "@/components/task-list"
import { MemberList } from "@/components/member-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ListTodo, Users } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params
  const session = await auth()
  const project = await getProject(id)

  if (!project) notFound()

  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} isAdmin={isAdmin} />

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="tasks" className="gap-2">
            <ListTodo className="h-4 w-4" />
            Tasks ({project.tasks.length})
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="h-4 w-4" />
            Members ({project.members.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <TaskList
            tasks={project.tasks}
            projectId={project.id}
            members={project.members.map((m) => m.user)}
            isAdmin={isAdmin}
            currentUserId={session?.user?.id || ""}
          />
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <MemberList
            members={project.members}
            projectId={project.id}
            isAdmin={isAdmin}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
