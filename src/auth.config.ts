import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"

export const authConfig = {
  session: { strategy: "jwt" },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || process.env.GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_SECRET,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const email = String(credentials.email).toLowerCase().trim()
        const password = String(credentials.password)

        // Super Admin account credentials
        if (
          (email === "admin@crm.com" && password === "admin123") ||
          (email === "superadmin@omnireach.com" && password === "superadmin123")
        ) {
          return {
            id: "user-superadmin-1",
            name: "Super Admin",
            email: email,
            role: "SUPERADMIN",
            workspace: "all",
          }
        }

        // Standard Client / Tenant user account
        if (email.includes("@") && password.length >= 6) {
          const isLawFirm = email.includes("law") || email.includes("legal")
          return {
            id: `user-client-${Date.now()}`,
            name: email.split("@")[0],
            email: email,
            role: "USER",
            workspace: isLawFirm ? "legal" : "dental",
          }
        }

        return null
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id || token.sub
        token.role =
          (user as { role?: string }).role ||
          (token.email === "admin@crm.com" || token.email === "superadmin@omnireach.com"
            ? "SUPERADMIN"
            : "USER")
        token.workspace =
          (user as { workspace?: string }).workspace || token.workspace || "dental"
      } else if (!token.role) {
        token.role =
          token.email === "admin@crm.com" || token.email === "superadmin@omnireach.com"
            ? "SUPERADMIN"
            : "USER"
      }

      if (!token.workspace) {
        token.workspace = "dental"
      }
      return token
    },
    session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub
        }
        ;(session.user as { role?: string }).role =
          (token.role as string) || "USER"
        ;(session.user as { workspace?: string }).workspace =
          (token.workspace as string) || "dental"
      }
      return session
    },
  },
} satisfies NextAuthConfig
