"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"

export type LoginFormState = {
  error?: string
  success?: boolean
}

export async function loginAction(
  prevState: LoginFormState | null,
  formData: FormData
): Promise<LoginFormState> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const callbackUrl = (formData.get("callbackUrl") as string) || "/overview"

  if (!email || !password) {
    return { error: "Please enter both email and password." }
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." }
        default:
          return { error: "Authentication failed. Please try again." }
      }
    }
    // Next.js redirect mechanism throws a special error which must be re-thrown
    throw error
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}
