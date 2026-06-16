import { NextResponse } from "next/server";
import {
  clearAdminAuthCookies,
  getHostFromRequest,
} from "@/lib/auth/session";

function logoutResponse(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url));
  clearAdminAuthCookies(response.cookies, getHostFromRequest(request));
  return response;
}

export async function GET(request: Request) {
  return logoutResponse(request);
}

export async function POST(request: Request) {
  return logoutResponse(request);
}
