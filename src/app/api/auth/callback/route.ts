import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/dashboard";
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (error) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", errorDescription || error || "OAuth authentication failed");
    return NextResponse.redirect(loginUrl);
  }

  // Set session cookie and redirect to dashboard
  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  response.cookies.set("cvforge_session", "true", {
    path: "/",
    maxAge: 604800,
    sameSite: "lax",
  });

  return response;
}
