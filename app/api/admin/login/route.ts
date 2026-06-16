import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  getHostFromRequest,
  setAdminAuthCookie,
  verifyAdminPassword,
} from "@/lib/auth";
import {
  checkLoginRateLimit,
  clearLoginFailures,
  recordLoginFailure,
} from "@/lib/security/rate-limit";

async function createLoginResponse(
  request: Request,
  password: string,
  nextPath: string,
) {
  if (!(await verifyAdminPassword(password, request))) {
    return null;
  }

  const token = await createAdminSessionToken();
  const destination = nextPath.startsWith("/admin") ? nextPath : "/admin/productos";
  const response = NextResponse.redirect(new URL(destination, request.url));
  setAdminAuthCookie(response.cookies, token, getHostFromRequest(request));
  return response;
}

function rateLimitResponse(request: Request, retryAfterSeconds: number) {
  if ((request.headers.get("content-type") ?? "").includes("application/json")) {
    return NextResponse.json(
      {
        error: `Demasiados intentos. Espera ${retryAfterSeconds} segundos.`,
      },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) },
      },
    );
  }

  const loginUrl = new URL("/admin/login", request.url);
  loginUrl.searchParams.set("error", "rate");
  return NextResponse.redirect(loginUrl);
}

export async function POST(request: Request) {
  const rateLimit = checkLoginRateLimit(request);
  if (!rateLimit.allowed) {
    return rateLimitResponse(request, rateLimit.retryAfterSeconds);
  }

  const contentType = request.headers.get("content-type") ?? "";
  let password = "";
  let nextPath = "/admin/productos";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      password?: string;
      next?: string;
    };
    password = body.password ?? "";
    nextPath = body.next ?? nextPath;
  } else {
    const formData = await request.formData();
    password = String(formData.get("password") ?? "");
    nextPath = String(formData.get("next") ?? nextPath);
  }

  const response = await createLoginResponse(request, password, nextPath);

  if (!response) {
    recordLoginFailure(request);

    if (contentType.includes("application/json")) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 });
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "1");
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  clearLoginFailures(request);
  return response;
}
