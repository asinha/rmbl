import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  const url = new URL(request.url);

  // Get the intended action from query parameters
  const intendedAction = url.searchParams.get("action"); // 'signup' or 'login'
  const redirectUrl = url.searchParams.get("redirect") || "/main/ideas";

  // Case 1: User exists and was trying to sign up
  if (userId && intendedAction === "signup") {
    return NextResponse.redirect(
      new URL("/auth/login?message=account_exists", request.url)
    );
  }

  // Case 2: No user and was trying to login
  if (!userId && intendedAction === "login") {
    return NextResponse.redirect(
      new URL("/auth/sign-up?message=account_not_found", request.url)
    );
  }

  // Case 3: User exists and was trying to login (success case)
  if (userId && intendedAction === "login") {
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Case 4: No user and was trying to sign up (success case for new OAuth user)
  if (!userId && intendedAction === "signup") {
    // This might happen if OAuth signup failed
    return NextResponse.redirect(
      new URL("/auth/sign-up?error=oauth_signup_failed", request.url)
    );
  }

  // Default case: OAuth authentication failed or unclear intent
  if (!userId) {
    return NextResponse.redirect(
      new URL("/auth/login?error=oauth_failed", request.url)
    );
  }

  // User is authenticated but no clear intent - redirect to main app
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}
