import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  const url = new URL(request.url);

  const redirectUrl = url.searchParams.get("redirect") || "/main/dashboard";

  if (!userId) {
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_failed", request.url)
    );
  }

  const response = NextResponse.redirect(
    new URL("/main/dashboard", request.url)
  );
  response.cookies.set("app_brand", "RMBL", {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // User is authenticated but no clear intent - redirect to main app
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
