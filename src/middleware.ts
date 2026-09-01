import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const { pathname } = req.nextUrl

  const isDashboardRoute =
    pathname === "/" ||
    pathname.startsWith("/overview") ||
    pathname.startsWith("/marketplace") ||
    pathname.startsWith("/leads") ||
    pathname.startsWith("/webhooks") ||
    pathname.startsWith("/settings")

  const isAuthRoute = pathname.startsWith("/login")

  if (isDashboardRoute && !isLoggedIn) {
    const search = req.nextUrl.search
    const callbackUrl = encodeURIComponent(pathname + search)
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${callbackUrl}`, req.nextUrl)
    )
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/overview", req.nextUrl))
  }

  if (pathname.startsWith("/marketplace")) {
    const search = req.nextUrl.search
    return NextResponse.redirect(new URL(`/overview${search}`, req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
