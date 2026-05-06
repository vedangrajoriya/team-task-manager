"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional(),
  assignedToId: z.string().optional(),
  projectId: z.string().min(1, "Project is required"),
})

export async function createTask(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (session.user.role !== "ADMIN") return { error: "Only admins can create tasks" }

  const data = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    status: (formData.get("status") as string) || "TODO",
    priority: (formData.get("priority") as string) || "MEDIUM",
    dueDate: (formData.get("dueDate") as string) || undefined,
    assignedToId: (formData.get("assignedToId") as string) || undefined,
    projectId: formData.get("projectId") as string,
  }

  const parsed = taskSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const task = await prisma.task.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || "",
        status: parsed.data.status as "TODO" | "IN_PROGRESS" | "DONE",
        priority: parsed.data.priority as "LOW" | "MEDIUM" | "HIGH",
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        assignedToId: parsed.data.assignedToId || null,
        projectId: parsed.data.projectId,
        createdById: session.user.id,
      },
    })

    await prisma.activityLog.create({
      data: {
        action: `Created task "${task.title}"`,
        userId: session.user.id,
        projectId: parsed.data.projectId,
        taskId: task.id,
      },
    })

    revalidatePath(`/dashboard/projects/${parsed.data.projectId}`)
    revalidatePath("/dashboard")
    return { success: true, taskId: task.id }
  } catch (error) {
    console.error(error)
    return { error: "Failed to create task" }
  }
}

export async function updateTask(taskId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const task = await prisma.task.findUnique({ where: { id: taskId } })
  if (!task) return { error: "Task not found" }

  // Members can only update status of tasks assigned to them
  if (session.user.role === "MEMBER") {
    if (task.assignedToId !== session.user.id) {
      return { error: "You can only update tasks assigned to you" }
    }
    const status = formData.get("status") as string
    if (!status) return { error: "Status is required" }

    await prisma.task.update({
      where: { id: taskId },
      data: { status: status as "TODO" | "IN_PROGRESS" | "DONE" },
    })

    await prisma.activityLog.create({
      data: {
        action: `Updated task "${task.title}" status to ${status}`,
        userId: session.user.id,
        projectId: task.projectId,
        taskId: task.id,
      },
    })

    revalidatePath(`/dashboard/projects/${task.projectId}`)
    revalidatePath("/dashboard")
    return { success: true }
  }

  // Admin can update everything
  const data = {
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || undefined,
    status: (formData.get("status") as string) || "TODO",
    priority: (formData.get("priority") as string) || "MEDIUM",
    dueDate: (formData.get("dueDate") as string) || undefined,
    assignedToId: (formData.get("assignedToId") as string) || undefined,
    projectId: formData.get("projectId") as string,
  }

  const parsed = taskSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description || "",
        status: parsed.data.status as "TODO" | "IN_PROGRESS" | "DONE",
        priority: parsed.data.priority as "LOW" | "MEDIUM" | "HIGH",
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
        assignedToId: parsed.data.assignedToId || null,
      },
    })

    await prisma.activityLog.create({
      data: {
        action: `Updated task "${parsed.data.title}"`,
        userId: session.user.id,
        projectId: task.projectId,
        taskId: task.id,
      },
    })

    revalidatePath(`/dashboard/projects/${task.projectId}`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to update task" }
  }
}

export async function deleteTask(taskId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (session.user.role !== "ADMIN") return { error: "Only admins can delete tasks" }

  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) return { error: "Task not found" }

    await prisma.task.delete({ where: { id: taskId } })

    revalidatePath(`/dashboard/projects/${task.projectId}`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to delete task" }
  }
}

export async function updateTaskStatus(taskId: string, status: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) return { error: "Task not found" }

    if (session.user.role === "MEMBER" && task.assignedToId !== session.user.id) {
      return { error: "You can only update tasks assigned to you" }
    }

    await prisma.task.update({
      where: { id: taskId },
      data: { status: status as "TODO" | "IN_PROGRESS" | "DONE" },
    })

    await prisma.activityLog.create({
      data: {
        action: `Changed task "${task.title}" status to ${status}`,
        userId: session.user.id,
        projectId: task.projectId,
        taskId: task.id,
      },
    })

    revalidatePath(`/dashboard/projects/${task.projectId}`)
    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to update task status" }
  }
}
