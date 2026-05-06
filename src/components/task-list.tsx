"use client"

import { useState } from "react"
import { createTask, updateTask, deleteTask, updateTaskStatus } from "@/actions/tasks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Loader2,
  Search,
  Calendar,
  User,
  Trash2,
  Pencil,
  ChevronRight,
} from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: string | Date | null
  assignedToId: string | null
  assignedTo: { id: string; name: string; email: string } | null
  createdBy: { name: string }
  projectId: string
}

interface Member {
  id: string
  name: string
  email: string
}

interface TaskListProps {
  tasks: Task[]
  projectId: string
  members: Member[]
  isAdmin: boolean
  currentUserId: string
}

const statusOptions = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "DONE", label: "Done" },
]

const priorityOptions = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
]

export function TaskList({ tasks, projectId, members, isAdmin, currentUserId }: TaskListProps) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")
  const [filterPriority, setFilterPriority] = useState("ALL")
  const [filterAssignee, setFilterAssignee] = useState("ALL")

  // Form state for create/edit
  const [formStatus, setFormStatus] = useState("TODO")
  const [formPriority, setFormPriority] = useState("MEDIUM")
  const [formAssignee, setFormAssignee] = useState("")

  const filteredTasks = tasks.filter((task) => {
    if (search && !task.title.toLowerCase().includes(search.toLowerCase())) return false
    if (filterStatus !== "ALL" && task.status !== filterStatus) return false
    if (filterPriority !== "ALL" && task.priority !== filterPriority) return false
    if (filterAssignee !== "ALL" && task.assignedToId !== filterAssignee) return false
    return true
  })

  function openCreate() {
    setFormStatus("TODO")
    setFormPriority("MEDIUM")
    setFormAssignee("")
    setCreateOpen(true)
  }

  function openEdit(task: Task) {
    setFormStatus(task.status)
    setFormPriority(task.priority)
    setFormAssignee(task.assignedToId || "")
    setEditTask(task)
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set("projectId", projectId)
    formData.set("status", formStatus)
    formData.set("priority", formPriority)
    formData.set("assignedToId", formAssignee)
    const result = await createTask(formData)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Task created!")
      setCreateOpen(false)
    }
    setLoading(false)
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!editTask) return
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    formData.set("projectId", projectId)
    formData.set("status", formStatus)
    formData.set("priority", formPriority)
    formData.set("assignedToId", formAssignee)
    const result = await updateTask(editTask.id, formData)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Task updated!")
      setEditTask(null)
    }
    setLoading(false)
  }

  async function handleDelete(taskId: string) {
    const result = await deleteTask(taskId)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Task deleted!")
    }
  }

  async function handleStatusChange(taskId: string, status: string | null) {
    if (!status) return
    const result = await updateTaskStatus(taskId, status)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Status updated!")
    }
  }

  const TaskFormFields = ({ task }: { task?: Task | null }) => (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={task?.title} required placeholder="Task title" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={task?.description || ""} placeholder="Describe the task..." rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={formStatus} onValueChange={(val) => val && setFormStatus(val)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select value={formPriority} onValueChange={(val) => val && setFormPriority(val)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {priorityOptions.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Input
            type="date"
            name="dueDate"
            defaultValue={
              task?.dueDate
                ? format(new Date(task.dueDate), "yyyy-MM-dd")
                : ""
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Assignee</Label>
          <Select value={formAssignee} onValueChange={(val) => setFormAssignee(val || "")}>
            <SelectTrigger><SelectValue placeholder="Unassigned" /></SelectTrigger>
            <SelectContent>
              {members.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  )

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || "ALL")}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            {statusOptions.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={(val) => setFilterPriority(val || "ALL")}>
          <SelectTrigger className="w-[130px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Priority</SelectItem>
            {priorityOptions.map((p) => (
              <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterAssignee} onValueChange={(val) => setFilterAssignee(val || "ALL")}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Assignee" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Assignees</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isAdmin && (
          <Button
            onClick={openCreate}
            className="bg-gradient-to-r from-chart-1 to-chart-2 text-white shadow-lg shadow-blue-500/25"
          >
            <Plus className="mr-1 h-4 w-4" /> Add Task
          </Button>
        )}
      </div>

      {/* Task Items */}
      {filteredTasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">No tasks found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => {
            const canChangeStatus =
              isAdmin || task.assignedToId === currentUserId

            return (
              <Card
                key={task.id}
                className="group border-0 shadow-sm transition-all hover:shadow-md"
              >
                <CardContent className="flex items-center gap-4 p-4">
                  {/* Status indicator */}
                  <div
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      task.status === "DONE"
                        ? "bg-emerald-500"
                        : task.status === "IN_PROGRESS"
                        ? "bg-blue-500"
                        : "bg-muted-foreground/40"
                    }`}
                  />

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium ${task.status === "DONE" ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {task.assignedTo && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {task.assignedTo.name}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(task.dueDate), "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Badges */}
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

                  {/* Status select */}
                  {canChangeStatus && (
                    <Select
                      value={task.status}
                      onValueChange={(value) => handleStatusChange(task.id, value)}
                    >
                      <SelectTrigger className="w-[130px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}

                  {/* Admin actions */}
                  {isAdmin && (
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(task)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(task.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}

                  <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create Task Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
            <DialogDescription>Add a new task to this project</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <TaskFormFields />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Create Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <TaskFormFields task={editTask} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTask(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
