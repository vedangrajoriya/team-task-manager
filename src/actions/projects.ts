"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
})

export async function createProject(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (session.user.role !== "ADMIN") return { error: "Only admins can create projects" }

  const title = formData.get("title") as string
  const description = formData.get("description") as string

  const parsed = projectSchema.safeParse({ title, description })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    const project = await prisma.project.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || "",
        createdById: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: "ADMIN",
          },
        },
      },
    })

    await prisma.activityLog.create({
      data: {
        action: `Created project "${project.title}"`,
        userId: session.user.id,
        projectId: project.id,
      },
    })

    revalidatePath("/dashboard/projects")
    return { success: true, projectId: project.id }
  } catch (error) {
    console.error(error)
    return { error: "Failed to create project" }
  }
}

export async function updateProject(projectId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (session.user.role !== "ADMIN") return { error: "Only admins can edit projects" }

  const title = formData.get("title") as string
  const description = formData.get("description") as string

  const parsed = projectSchema.safeParse({ title, description })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  try {
    await prisma.project.update({
      where: { id: projectId },
      data: {
        title: parsed.data.title,
        description: parsed.data.description || "",
      },
    })

    await prisma.activityLog.create({
      data: {
        action: `Updated project "${parsed.data.title}"`,
        userId: session.user.id,
        projectId,
      },
    })

    revalidatePath("/dashboard/projects")
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to update project" }
  }
}

export async function deleteProject(projectId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (session.user.role !== "ADMIN") return { error: "Only admins can delete projects" }

  try {
    await prisma.project.delete({ where: { id: projectId } })
    revalidatePath("/dashboard/projects")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to delete project" }
  }
}

export async function addMember(projectId: string, email: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (session.user.role !== "ADMIN") return { error: "Only admins can add members" }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return { error: "User not found with that email" }

    const existingMember = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
    })
    if (existingMember) return { error: "User is already a member" }

    await prisma.projectMember.create({
      data: { userId: user.id, projectId, role: "MEMBER" },
    })

    await prisma.activityLog.create({
      data: {
        action: `Added ${user.name} to the project`,
        userId: session.user.id,
        projectId,
      },
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to add member" }
  }
}

export async function removeMember(projectId: string, userId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }
  if (session.user.role !== "ADMIN") return { error: "Only admins can remove members" }

  try {
    await prisma.projectMember.delete({
      where: { userId_projectId: { userId, projectId } },
    })

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to remove member" }
  }
}

export async function getProjects() {
  const session = await auth()
  if (!session?.user?.id) return []

  if (session.user.role === "ADMIN") {
    return prisma.project.findMany({
      include: {
        _count: { select: { tasks: true, members: true } },
        createdBy: { select: { name: true } },
        tasks: { select: { status: true } },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  return prisma.project.findMany({
    where: {
      members: { some: { userId: session.user.id } },
    },
    include: {
      _count: { select: { tasks: true, members: true } },
      createdBy: { select: { name: true } },
      tasks: { select: { status: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getProject(projectId: string) {
  const session = await auth()
  if (!session?.user?.id) return null

  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      createdBy: { select: { name: true, email: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      },
      tasks: {
        include: {
          assignedTo: { select: { id: true, name: true, email: true } },
          createdBy: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { tasks: true, members: true } },
    },
  })
}
