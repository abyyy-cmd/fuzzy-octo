import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl
  const userRole = (
    (req.auth?.user as { role?: string })?.role || ""
  )
    .toUpperCase()
    .replace(/[\s-_]+/g, "")
  const isSuperAdmin = userRole === "SUPERADMIN" || userRole === "ADMIN"
  const userWorkspace =
    (req.auth?.user as { workspace?: string })?.workspace || "legal"

  const isAdminAuthRoute = pathname.startsWith("/admin/login")
  const isAdminRoute = pathname.startsWith("/admin")

  const isStandardAuthRoute = pathname === "/login"
  const isDashboardRoute =
    pathname === "/" ||
    pathname.startsWith("/omnireach") ||
    pathname.startsWith("/overview") ||
    pathname.startsWith("/marketplace") ||
    pathname.startsWith("/leads") ||
    pathname.startsWith("/vapi") ||
    pathname.startsWith("/calls") ||
    pathname.startsWith("/meetings") ||
    pathname.startsWith("/webhooks") ||
    pathname.startsWith("/settings")

  const search = req.nextUrl.search
  const callbackUrl = encodeURIComponent(pathname + search)

  // 1. If requesting /admin/login
  if (isAdminAuthRoute) {
    if (isLoggedIn) {
      if (isSuperAdmin) {
        return NextResponse.redirect(new URL("/admin", req.nextUrl))
      } else {
        return NextResponse.redirect(
          new URL(`/omnireach?workspace=${userWorkspace}`, req.nextUrl)
        )
      }
    }
    return NextResponse.next()
  }

  // 2. For any other /admin/... route
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/admin/login?callbackUrl=${callbackUrl}`, req.nextUrl)
      )
    }
    if (!isSuperAdmin) {
      return NextResponse.redirect(
        new URL(`/omnireach?workspace=${userWorkspace}`, req.nextUrl)
      )
    }
    return NextResponse.next()
  }

  // 3. Unauthenticated user trying to access client dashboard routes
  if (isDashboardRoute && !isLoggedIn) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, req.nextUrl)
    )
  }

  // 4. Authenticated user visiting client /login page
  if (isStandardAuthRoute && isLoggedIn) {
    if (isSuperAdmin) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl))
    }
    return NextResponse.redirect(
      new URL(`/omnireach?workspace=${userWorkspace}`, req.nextUrl)
    )
  }

  // 5. Handling root path '/'
  if (pathname === "/") {
    if (isLoggedIn) {
      if (isSuperAdmin) {
        return NextResponse.redirect(new URL("/admin", req.nextUrl))
      }
      return NextResponse.redirect(
        new URL(`/omnireach?workspace=${userWorkspace}`, req.nextUrl)
      )
    }
  }

  // 6. Marketplace alias redirect
  if (pathname.startsWith("/marketplace")) {
    return NextResponse.redirect(new URL(`/omnireach${search}`, req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

