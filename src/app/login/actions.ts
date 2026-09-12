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
  const email = (formData.get("email") as string)?.toLowerCase().trim()
  const password = formData.get("password") as string
  let callbackUrl = (formData.get("callbackUrl") as string) || ""

  if (!email || !password) {
    return { error: "Please enter both email and password." }
  }

  // Detect appropriate target based on user/account intent
  const isSuperAdmin =
    email.includes("admin") || email === "superadmin@omnireach.com"
  const isLegal =
    email.includes("legal") ||
    email.includes("law") ||
    email.includes("attorney")
  const isDental =
    email.includes("dental") ||
    email.includes("clinic") ||
    email.includes("dentist") ||
    email.includes("smile")

  if (isSuperAdmin) {
    if (
      !callbackUrl ||
      callbackUrl === "/omnireach" ||
      callbackUrl === "/overview" ||
      callbackUrl === "/"
    ) {
      callbackUrl = "/admin"
    }
  } else if (isLegal) {
    if (
      !callbackUrl ||
      callbackUrl === "/admin" ||
      callbackUrl === "/overview" ||
      callbackUrl === "/" ||
      !callbackUrl.includes("workspace=")
    ) {
      callbackUrl = "/omnireach?workspace=legal"
    }
  } else if (isDental) {
    if (
      !callbackUrl ||
      callbackUrl === "/admin" ||
      callbackUrl === "/overview" ||
      callbackUrl === "/" ||
      !callbackUrl.includes("workspace=")
    ) {
      callbackUrl = "/omnireach?workspace=dental"
    }
  } else {
    if (!callbackUrl || callbackUrl === "/admin") {
      callbackUrl = "/omnireach"
    }
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

export async function githubLoginAction(formData: FormData) {
  const callbackUrl = (formData.get("callbackUrl") as string) || "/omnireach"
  await signIn("github", { redirectTo: callbackUrl })
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}

