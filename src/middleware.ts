import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const config = {
  matcher: ["/simages/:path*", "/rimages/:path*"],
}

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("Referer", "https://idoitmyself.xyz/")

  const { pathname, search } = request.nextUrl
  request.nextUrl.href = `https://static.theshalola.xyz${pathname}${search}`

  return NextResponse.rewrite(request.nextUrl, {
    request: {
      headers: requestHeaders,
    },
  })
}
