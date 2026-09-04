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

  // 1. If requesting /admin/login, allow it (or redirect to /admin if already super admin)
  if (isAdminAuthRoute) {
    if (isLoggedIn && isSuperAdmin) {
      return NextResponse.redirect(new URL("/admin", req.nextUrl))
    }
    return NextResponse.next()
  }

  // 2. For any other /admin/... route, verify that the session token exists and has role === 'SUPERADMIN'
  if (isAdminRoute) {
    if (!isLoggedIn || !isSuperAdmin) {
      return NextResponse.redirect(
        new URL(`/admin/login?callbackUrl=${callbackUrl}`, req.nextUrl)
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
    return NextResponse.redirect(new URL("/omnireach", req.nextUrl))
  }

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
