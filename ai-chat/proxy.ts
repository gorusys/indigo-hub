import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * CORS for /api/ai when the chat client is served from another origin (optional).
 * Comma-separated origins in ALLOWED_ORIGINS; if unset, allows any origin for this route.
 */
function corsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get("origin");
  const raw = process.env.ALLOWED_ORIGINS?.trim();
  let allow = "*";
  if (raw) {
    const list = raw.split(",").map((s) => s.trim()).filter(Boolean);
    if (list.includes("*")) {
      allow = "*";
    } else if (origin && list.includes(origin)) {
      allow = origin;
    } else if (origin) {
      allow = origin;
    } else {
      allow = list[0] ?? "*";
    }
  }
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}

export function proxy(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/ai")) {
    return NextResponse.next();
  }

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders(req) });
  }

  const res = NextResponse.next();
  const h = corsHeaders(req);
  for (const [k, v] of Object.entries(h)) {
    res.headers.set(k, v);
  }
  return res;
}

export const config = {
  matcher: ["/api/ai"],
};
