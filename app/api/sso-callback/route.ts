import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  const url = new URL(request.url);

  const redirectUrl = url.searchParams.get("redirect") || "/main/ideas";

  if (!userId) {
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_failed", request.url)
    );
  }

  // User is authenticated but no clear intent - redirect to main app
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
