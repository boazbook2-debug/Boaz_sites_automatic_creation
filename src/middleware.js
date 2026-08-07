import { NextResponse } from "next/server";
import agency from "@/data/agency";

const COOKIE_NAME = "demo_access";
const PUBLIC_PATHS = ["/demo-login", "/api/demo-login"];

// Real server-side gate for pitch-demo deployments (agency.demoAccessCode
// set) — unlike a client component, this runs before any page content is
// rendered, so an unauthenticated request never receives the agency's data
// in the response at all (client-side-only gating still ships the full RSC
// payload in the initial HTML, which defeats the point).
//
// The code can arrive two ways: typed into /demo-login, or as a `?key=`
// query param on the link itself — the latter unlocks silently in the same
// response (sets the cookie, falls through to the real page), so the
// intended recipient just clicks one link and never sees a login screen.
// Anyone without that exact link still can't get in by guessing.
export function middleware(request) {
  const code = agency.demoAccessCode;
  if (!code) return NextResponse.next();

  const { pathname, searchParams } = request.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname.startsWith("/intake") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (cookie === code) return NextResponse.next();

  if (searchParams.get("key") === code) {
    const res = NextResponse.next();
    res.cookies.set(COOKIE_NAME, code, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
    return res;
  }

  if (pathname.startsWith("/uploads")) {
    return new NextResponse(null, { status: 403 });
  }

  const url = request.nextUrl.clone();
  url.pathname = "/demo-login";
  url.search = "";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
