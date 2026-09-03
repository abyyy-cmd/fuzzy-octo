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

        // Support demo/admin credentials or standard test accounts
        if (
          (email === "admin@crm.com" && password === "admin123") ||
          (email.includes("@") && password.length >= 6)
        ) {
          return {
            id: "user-admin-1",
            name: "Admin User",
            email: email,
            role: "admin",
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
        token.role = (user as { role?: string }).role || "admin"
      }
      // Placeholder tenant/workspace as requested (will be made dynamic)
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
        ;(session.user as { role?: string }).role = token.role as string
        ;(session.user as { workspace?: string }).workspace =
          (token.workspace as string) || "dental"
      }
      return session
    },
  },
} satisfies NextAuthConfig
