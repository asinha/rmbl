"use client";

import React, { useState, FormEvent } from "react";
import Head from "next/head";
import { ArrowRight, Brain, Zap } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface ClerkError {
  errors: {
    code: string;
    message: string;
    longMessage?: string;
    meta?: Record<string, unknown>;
  }[];
}

const JoinRMBL = () => {
  const { isLoaded, signUp } = useSignUp();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [pendingVerification, setPendingVerification] =
    useState<boolean>(false);
  const [code, setCode] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleGoogleSignUp = async (): Promise<void> => {
    if (!isLoaded || !signUp) return;

    setIsLoading(true);
    setError("");
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/api/sso-callback",
        redirectUrlComplete: "/main/ideas",
      });
    } catch (err: unknown) {
      const clerkError = err as ClerkError;
      setError(clerkError.errors?.[0]?.message || "Google sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setIsLoading(true);
    setError("");
    try {
      const result = await signUp.create({
        emailAddress: email,
        password,
      });

      if (result.status === "complete") {
        await signUp.prepareEmailAddressVerification();
        setPendingVerification(true);
      }
    } catch (err: unknown) {
      const clerkError = err as ClerkError;
      setError(clerkError.errors?.[0]?.message || "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!isLoaded || !signUp) return;

    setIsLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        // Replace setActive with the new approach
        const { createdSessionId } = completeSignUp;

        // In Clerk v5+, we need to handle the session differently
        if (createdSessionId) {
          // Typically you would redirect after verification
          router.push("/dashboard");
        } else {
          throw new Error("Failed to create session");
        }
      }
    } catch (err: unknown) {
      const clerkError = err as ClerkError;
      setError(clerkError.errors?.[0]?.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white font-sans">
      <Head>
        <title>Join RMBL</title>
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
              size={80}
              className="mx-auto"
              style={{ textShadow: "0 0 20px rgba(255, 255, 255, 0.3)" }}
            />
            <h1 className="text-3xl lg:text-4xl font-bold mt-6 mb-4">
              Your Second Brain
            </h1>
            <p className="text-base lg:text-lg text-indigo-100">
              Transform scattered thoughts into organized insights with the
              power of your voice
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

            {pendingVerification ? (
              <div className="border border-gray-200 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Verify Your Email
                </h2>
                <p className="text-gray-600 mb-6">
                  We've sent a verification code to {email}. Please enter it
                  below.
                </p>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                    {error}
                  </div>
                )}
                <form onSubmit={handleVerifyEmail} className="space-y-4">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Verification code"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? "Verifying..." : "Verify Email"}
                  </button>
                </form>
              </div>
            ) : (
              <>
                <div className="text-left mb-6 sm:mb-10">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Join RMBL
                  </h2>
                  <p className="text-gray-600 mt-1 sm:mt-2">
                    Start capturing your thoughts in seconds
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                  <button
                    onClick={handleGoogleSignUp}
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

                  <form onSubmit={handleEmailSignUp} className="space-y-4">
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
                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </button>
                  </form>
                </div>

                <div className="mt-8 sm:mt-10">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-4 sm:mb-6">
                    Why professionals choose RMBL
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {/* Feature 1 */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg flex items-start">
                      <div className="bg-blue-100 p-2 rounded-full inline-flex">
                        <Zap className="text-blue-500 w-5 h-5" />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <h4 className="font-semibold text-gray-800">
                          Instant Capture
                        </h4>
                        <p className="text-gray-600 text-xs sm:text-sm">
                          Record thoughts in one click, no typing required
                        </p>
                      </div>
                    </div>

                    {/* Feature 2 */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg flex items-start">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Brain className="text-purple-500 w-5 h-5" />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <h4 className="font-semibold text-gray-800">
                          AI Transformation
                        </h4>
                        <p className="text-gray-600 text-xs sm:text-sm">
                          Turn voice notes into emails, blogs, and lists
                          automatically
                        </p>
                      </div>
                    </div>

                    {/* Feature 3 */}
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg flex items-start">
                      <div className="bg-green-100 p-2 rounded-full">
                        <ArrowRight className="text-green-500 w-5 h-5" />
                      </div>
                      <div className="ml-3 sm:ml-4">
                        <h4 className="font-semibold text-gray-800">
                          Async Workflow
                        </h4>
                        <p className="text-gray-600 text-xs sm:text-sm">
                          Perfect for busy schedules and remote work
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-8 sm:mt-10 text-center text-sm sm:text-base text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="text-indigo-600 font-medium hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinRMBL;
