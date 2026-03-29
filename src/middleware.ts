import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/", "/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  if (!pathname.startsWith("/dashboard") && !pathname.startsWith("/missions") && !pathname.startsWith("/gallery") && !pathname.startsWith("/leaderboard") && !pathname.startsWith("/profile") && !pathname.startsWith("/sky-tools") && !pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const session = request.cookies.get("sb-access-token") ?? request.cookies.get("sb-auth-token");
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
