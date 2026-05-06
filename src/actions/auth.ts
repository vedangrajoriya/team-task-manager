"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Role } from "@prisma/client"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const parsed = loginSchema.safeParse({ email, password })
  if (!parsed.success) {
    return { error: "Invalid email or password" }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." }
        default:
          return { error: "Something went wrong." }
      }
    }
    throw error
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" })
}

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
})

export async function register(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const parsed = registerSchema.safeParse({ name, email, password })
  if (!parsed.success) {
    return { error: "Invalid data" }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return { error: "User already exists with this email." }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    
    // First user becomes ADMIN, others become MEMBER
    const userCount = await prisma.user.count()
    const role = userCount === 0 ? Role.ADMIN : Role.MEMBER

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Register Error:", error)
    return { error: "Something went wrong during registration." }
  }
}
