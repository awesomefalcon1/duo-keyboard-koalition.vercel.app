import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

// Routes that do NOT require authentication
const PUBLIC_PATHS = ["/", "/auth/callback", "/unauthorized"]

// API routes that are intentionally public (opt-in allowlist)
const PUBLIC_API_PATHS = ["/api/health", "/api/contact", "/api/report"]

function isPublicRoute(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p)) return true
  if (PUBLIC_API_PATHS.some((p) => pathname === p)) return true
  if (pathname.startsWith("/_next/") || pathname.startsWith("/favicon")) return true
  return false
}

export async function middleware(request: NextRequest) {
  const { pathname } = new URL(request.url)

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
        set(name, value, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          request.cookies.set({ name, value: "", ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    }
  )

  // Refresh session on every request (keeps cookie fresh)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (isPublicRoute(pathname)) {
    return response
  }

  // Protected route — require authenticated user
  if (!user || error) {
    // For API routes, return 401 JSON instead of redirect
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    return NextResponse.redirect(new URL("/unauthorized", request.url))
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
