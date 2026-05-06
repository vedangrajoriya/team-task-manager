import { PrismaClient, Role, TaskStatus, TaskPriority } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: Role.ADMIN },
  })

  if (existingAdmin) {
    console.log("Database already seeded. Skipping...")
    return
  }

  const hashedPassword = await bcrypt.hash("password123", 10)

  // 1 Admin user
  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  })

  // 2 Member users
  const member1 = await prisma.user.create({
    data: {
      name: "Alice Member",
      email: "alice@example.com",
      password: hashedPassword,
      role: Role.MEMBER,
    },
  })

  const member2 = await prisma.user.create({
    data: {
      name: "Bob Member",
      email: "bob@example.com",
      password: hashedPassword,
      role: Role.MEMBER,
    },
  })

  // Sample Project
  const project1 = await prisma.project.create({
    data: {
      title: "Website Redesign",
      description: "Redesigning the corporate website for better conversions.",
      createdById: admin.id,
    },
  })

  const project2 = await prisma.project.create({
    data: {
      title: "Mobile App Launch",
      description: "Prepare and launch the new mobile application.",
      createdById: admin.id,
    },
  })

  // Add members to projects
  await prisma.projectMember.createMany({
    data: [
      { userId: member1.id, projectId: project1.id, role: Role.MEMBER },
      { userId: member2.id, projectId: project1.id, role: Role.MEMBER },
      { userId: admin.id, projectId: project1.id, role: Role.ADMIN },
      { userId: member1.id, projectId: project2.id, role: Role.MEMBER },
    ],
  })

  // Sample tasks for Project 1
  await prisma.task.create({
    data: {
      title: "Create wireframes",
      description: "Design wireframes for the homepage and about page.",
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
      projectId: project1.id,
      createdById: admin.id,
      assignedToId: member1.id,
      dueDate: new Date(new Date().setDate(new Date().getDate() - 2)),
    },
  })

  await prisma.task.create({
    data: {
      title: "Implement authentication",
      description: "Set up NextAuth with proper role-based access.",
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      projectId: project1.id,
      createdById: admin.id,
      assignedToId: member2.id,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    },
  })

  // Sample tasks for Project 2
  await prisma.task.create({
    data: {
      title: "App Store Listing",
      description: "Prepare screenshots and description for the App Store.",
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      projectId: project2.id,
      createdById: admin.id,
      assignedToId: member1.id,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 10)),
    },
  })

  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
