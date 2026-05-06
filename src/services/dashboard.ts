"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function getDashboardData() {
  const session = await auth()
  if (!session?.user?.id) return null

  const userId = session.user.id
  const isAdmin = session.user.role === "ADMIN"

  // Get tasks based on role
  const taskWhere = isAdmin ? {} : { assignedToId: userId }

  const [
    totalTasks,
    completedTasks,
    overdueTasks,
    activeProjects,
    recentActivity,
    myTasks,
    tasksByStatus,
  ] = await Promise.all([
    prisma.task.count({ where: taskWhere }),
    prisma.task.count({ where: { ...taskWhere, status: "DONE" } }),
    prisma.task.count({
      where: {
        ...taskWhere,
        status: { not: "DONE" },
        dueDate: { lt: new Date() },
      },
    }),
    isAdmin
      ? prisma.project.count()
      : prisma.project.count({
          where: { members: { some: { userId } } },
        }),
    prisma.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        project: { select: { title: true } },
      },
      ...(isAdmin ? {} : { where: { userId } }),
    }),
    prisma.task.findMany({
      where: isAdmin ? {} : { assignedToId: userId },
      include: {
        project: { select: { title: true } },
        assignedTo: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.task.groupBy({
      by: ["status"],
      _count: { status: true },
      ...(isAdmin ? {} : { where: { assignedToId: userId } }),
    }),
  ])

  // Transform status data for charts
  const statusDistribution = [
    {
      name: "To Do",
      value: tasksByStatus.find((s) => s.status === "TODO")?._count?.status || 0,
      fill: "hsl(var(--chart-1))",
    },
    {
      name: "In Progress",
      value:
        tasksByStatus.find((s) => s.status === "IN_PROGRESS")?._count?.status || 0,
      fill: "hsl(var(--chart-2))",
    },
    {
      name: "Done",
      value: tasksByStatus.find((s) => s.status === "DONE")?._count?.status || 0,
      fill: "hsl(var(--chart-3))",
    },
  ]

  return {
    totalTasks,
    completedTasks,
    overdueTasks,
    activeProjects,
    recentActivity,
    myTasks,
    statusDistribution,
  }
}
