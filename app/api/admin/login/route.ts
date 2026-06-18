import { NextResponse } from "next/server";
import {
  createAdminSessionToken,
  getHostFromRequest,
  setAdminAuthCookie,
  verifyAdminLogin,
} from "@/lib/auth";
import { getStoreSlugFromRequest } from "@/lib/store/context";
import {
  checkLoginRateLimit,
  clearLoginFailures,
  recordLoginFailure,
} from "@/lib/security/rate-limit";

async function createLoginResponse(
  request: Request,
  username: string,
  password: string,
  nextPath: string,
) {
  const session = await verifyAdminLogin(username, password, request);
  if (!session) {
    return null;
  }

  const token = await createAdminSessionToken(session);
  const destination = nextPath.startsWith("/admin") ? nextPath : "/admin/productos";
  const response = NextResponse.redirect(new URL(destination, request.url));
  const storeSlug = getStoreSlugFromRequest(request);
  setAdminAuthCookie(
    response.cookies,
    token,
    storeSlug,
    getHostFromRequest(request),
  );
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
  let username = "admin";
  let nextPath = "/admin/productos";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      password?: string;
      username?: string;
      next?: string;
    };
    password = body.password ?? "";
    username = body.username ?? username;
    nextPath = body.next ?? nextPath;
  } else {
    const formData = await request.formData();
    password = String(formData.get("password") ?? "");
    username = String(formData.get("username") ?? username);
    nextPath = String(formData.get("next") ?? nextPath);
  }

  const response = await createLoginResponse(
    request,
    username,
    password,
    nextPath,
  );

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
