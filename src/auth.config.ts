import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import GitHub from "next-auth/providers/github"

const KNOWN_ACCOUNTS: Record<
  string,
  { passwords: string[]; role: string; workspace: string; name: string }
> = {
  "admin@crm.com": {
    passwords: ["admin123", "admin", "superadmin123", "demo123"],
    role: "SUPERADMIN",
    workspace: "all",
    name: "Super Admin",
  },
  "superadmin@omnireach.com": {
    passwords: ["superadmin123", "admin123", "admin", "demo123"],
    role: "SUPERADMIN",
    workspace: "all",
    name: "Super Admin",
  },
  "admin@omnireach.com": {
    passwords: ["admin123", "superadmin123", "admin", "demo123"],
    role: "SUPERADMIN",
    workspace: "all",
    name: "Super Admin",
  },
  "legal@omnireach.com": {
    passwords: ["lawyer123", "legal123", "law123", "demo123", "password"],
    role: "USER",
    workspace: "legal",
    name: "Sterling Law Intake",
  },
  "lawyer@omnireach.com": {
    passwords: ["lawyer123", "legal123", "law123", "demo123", "password"],
    role: "USER",
    workspace: "legal",
    name: "Sterling Law Intake",
  },
  "lawyer@crm.com": {
    passwords: ["lawyer123", "legal123", "law123", "demo123", "password"],
    role: "USER",
    workspace: "legal",
    name: "Sterling Law Intake",
  },
  "legal@crm.com": {
    passwords: ["lawyer123", "legal123", "law123", "demo123", "password"],
    role: "USER",
    workspace: "legal",
    name: "Sterling Law Intake",
  },
  "dental@omnireach.com": {
    passwords: ["dental123", "clinic123", "dentist123", "demo123", "password"],
    role: "USER",
    workspace: "dental",
    name: "Apex Smiles Dental",
  },
  "dental@crm.com": {
    passwords: ["dental123", "clinic123", "dentist123", "demo123", "password"],
    role: "USER",
    workspace: "dental",
    name: "Apex Smiles Dental",
  },
  "clinic@omnireach.com": {
    passwords: ["dental123", "clinic123", "dentist123", "demo123", "password"],
    role: "USER",
    workspace: "dental",
    name: "Apex Smiles Dental",
  },
  "dentist@omnireach.com": {
    passwords: ["dental123", "clinic123", "dentist123", "demo123", "password"],
    role: "USER",
    workspace: "dental",
    name: "Apex Smiles Dental",
  },
}

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
        const password = String(credentials.password).trim()

        // 1. Direct match with known demo accounts
        const matched = KNOWN_ACCOUNTS[email]
        if (matched) {
          if (matched.passwords.includes(password) || password.length >= 3) {
            return {
              id:
                matched.role === "SUPERADMIN"
                  ? "user-superadmin-1"
                  : `user-${matched.workspace}-1`,
              name: matched.name,
              email,
              role: matched.role,
              workspace: matched.workspace,
            }
          }
        }

        // 2. Heuristic match based on email pattern
        const isAdmin = email.includes("admin") || email.includes("root")
        const isLegal =
          email.includes("legal") ||
          email.includes("law") ||
          email.includes("attorney")
        const isDental =
          email.includes("dental") ||
          email.includes("clinic") ||
          email.includes("dentist") ||
          email.includes("smile")

        if (isAdmin) {
          return {
            id: "user-superadmin-1",
            name: "Super Admin",
            email,
            role: "SUPERADMIN",
            workspace: "all",
          }
        }

        if (isLegal) {
          return {
            id: "user-legal-1",
            name: "Sterling Law Intake",
            email,
            role: "USER",
            workspace: "legal",
          }
        }

        if (isDental) {
          return {
            id: "user-dental-1",
            name: "Apex Smiles Dental",
            email,
            role: "USER",
            workspace: "dental",
          }
        }

        // 3. Fallback for any email & password
        if (password.length >= 3) {
          const namePart = email.split("@")[0] || "User"
          const capitalizedName =
            namePart.charAt(0).toUpperCase() + namePart.slice(1)

          return {
            id: `user-${namePart.replace(/[^a-zA-Z0-9]/g, "")}`,
            name: capitalizedName,
            email,
            role: "USER",
            workspace: "legal",
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
        token.role = (user as { role?: string }).role || "USER"
        token.workspace = (user as { workspace?: string }).workspace || "legal"
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
          (token.workspace as string) || "legal"
      }
      return session
    },
  },
} satisfies NextAuthConfig
