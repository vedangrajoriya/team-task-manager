"use client"

import { useState } from "react"
import { deleteProject, updateProject } from "@/actions/projects"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Pencil, Trash2, Loader2, X, Check } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ProjectHeaderProps {
  project: {
    id: string
    title: string
    description: string | null
    _count: { tasks: number; members: number }
    tasks: { status: string }[]
  }
  isAdmin: boolean
}

export function ProjectHeader({ project, isAdmin }: ProjectHeaderProps) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const router = useRouter()

  const done = project.tasks.filter((t) => t.status === "DONE").length
  const total = project.tasks.length
  const progress = total > 0 ? Math.round((done / total) * 100) : 0

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateProject(project.id, formData)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Project updated!")
      setEditing(false)
    }
    setLoading(false)
  }

  async function handleDelete() {
    setLoading(true)
    const result = await deleteProject(project.id)
    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success("Project deleted!")
      router.push("/dashboard/projects")
    }
  }

  return (
    <div>
      <Link href="/dashboard/projects" className="mb-4 inline-block">
        <Button variant="ghost" className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
      </Link>

      {editing ? (
        <form onSubmit={handleUpdate} className="space-y-3">
          <Input name="title" defaultValue={project.title} required className="text-xl font-bold h-12" />
          <Input name="description" defaultValue={project.description || ""} placeholder="Description" />
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              <span className="ml-1">Save</span>
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
              <X className="h-4 w-4" /> Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
            {project.description && (
              <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
            )}
            <div className="mt-3 flex items-center gap-3">
              <Badge variant="outline">{progress}% complete</Badge>
              <span className="text-xs text-muted-foreground">
                {done}/{total} tasks done
              </span>
            </div>
          </div>

          {isAdmin && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="mr-1 h-3 w-3" /> Edit
              </Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setDeleteOpen(true)}>
                <Trash2 className="mr-1 h-3 w-3" /> Delete
              </Button>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Project</DialogTitle>
                    <DialogDescription>
                      Are you sure? This will permanently delete &quot;{project.title}&quot; and all its
                      tasks. This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Delete
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
