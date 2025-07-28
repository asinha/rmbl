"use client";

import React, { useState, FormEvent, useEffect } from "react";
import Head from "next/head";
import { Brain } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface ClerkError {
  errors: {
    code: string;
    message: string;
    longMessage?: string;
    meta?: Record<string, unknown>;
  }[];
}

const LoginRMBL = () => {
  const { isLoaded: clerkLoaded, signIn } = useSignIn();
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [rememberMe, setRememberMe] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  // Redirect if already signed in
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push("/main/ideas");
    }
  }, [userLoaded, isSignedIn, router]);

  const handleGoogleSignIn = async (): Promise<void> => {
    if (!clerkLoaded || !signIn) return;

    setIsLoading(true);
    setError("");
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/api/sso-callback",
        redirectUrlComplete: "/main/ideas",
      });
    } catch (err: unknown) {
      const clerkError = err as ClerkError;
      setError(clerkError.errors?.[0]?.message || "Google sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!clerkLoaded || !signIn) return;

    setIsLoading(true);
    setError("");
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        // Clerk automatically handles session creation
        router.push("/main/ideas");
      } else {
        throw new Error("Sign in not complete");
      }
    } catch (err: unknown) {
      const clerkError = err as ClerkError;
      setError(clerkError.errors?.[0]?.message || "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userLoaded || !clerkLoaded || isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white font-sans">
      <Head>
        <title>Login to RMBL</title>
        <link
          href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Gradient Section */}
        <div className="hidden lg:flex lg:w-1/3 bg-gradient-to-br from-indigo-500 to-purple-600 flex-col justify-center items-center text-white p-6 lg:p-12">
          <div className="text-center">
            <Brain
              className="mx-auto"
              size={80}
              style={{ textShadow: "0 0 20px rgba(255, 255, 255, 0.3)" }}
            />
            <h1 className="text-3xl lg:text-4xl font-bold mt-6 mb-4">
              Welcome
            </h1>
            <p className="text-base lg:text-lg text-indigo-100">
              Organize your thoughts and boost productivity
            </p>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="w-full lg:w-2/3 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile-only logo */}
            <div className="lg:hidden mb-6 text-center">
              <Brain
                size={60}
                className="mx-auto text-indigo-600"
                style={{ textShadow: "0 0 15px rgba(99, 102, 241, 0.3)" }}
              />
              <h1 className="text-2xl font-bold text-indigo-600 mt-2">RMBL</h1>
            </div>

            <div className="text-left mb-6 sm:mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                Login to RMBL
              </h2>
              <p className="text-gray-600 mt-1 sm:mt-2">
                Access your second brain
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className={`w-full bg-white border border-gray-300 text-gray-700 font-medium py-2 sm:py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-50 transition duration-150 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <FcGoogle className="w-5 h-5 mr-3" />
                {isLoading ? "Processing..." : "Continue with Google"}
              </button>

              <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="mx-4 text-gray-500 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember-me"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Remember me
                    </label>
                  </div>

                  <Link
                    href="/forgot-password"
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </button>
              </form>
            </div>

            <p className="mt-8 sm:mt-10 text-center text-sm sm:text-base text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="text-indigo-600 font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRMBL;
