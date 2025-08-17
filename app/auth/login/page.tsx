"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import { ArrowRight, Brain, Zap } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useSignUp, useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface ClerkError {
  errors: {
    code: string;
    message: string;
    longMessage?: string;
    meta?: Record<string, unknown>;
  }[];
}

const AuthRMBL = () => {
  const { isLoaded: signUpLoaded, signUp } = useSignUp();
  const { isLoaded: signInLoaded, signIn } = useSignIn();
  const { isLoaded: userLoaded, isSignedIn } = useUser();
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const isLoaded = signUpLoaded && signInLoaded && userLoaded;

  // Redirect if already signed in
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push("/main/ideas");
    }
  }, [userLoaded, isSignedIn, router]);

  // Handle URL error messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");

    if (errorParam === "oauth_failed") {
      setError("Authentication failed. Please try again.");
    }
  }, []);

  const handleGoogleAuth = async (): Promise<void> => {
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      // Try sign in first
      if (signIn) {
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/api/sso-callback",
          redirectUrlComplete: "/main/ideas",
        });
      }
    } catch (err: unknown) {
      // If sign in fails, try sign up
      try {
        if (signUp) {
          await signUp.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl: "/api/sso-callback",
            redirectUrlComplete: "/main/ideas",
          });
        }
      } catch (signUpErr: unknown) {
        const clerkError = signUpErr as ClerkError;
        setError(
          clerkError.errors?.[0]?.message || "Google authentication failed"
        );
        setIsLoading(false);
      }
    }
  };

  if (!isLoaded || isSignedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white font-sans">
      <Head>
        <title>Welcome to RMBL</title>
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
        <div className="hidden lg:flex lg:w-1/3 bg-gradient-to-br from-green-500 to-green-600 flex-col justify-center items-center text-white p-12">
          <div className="text-center">
            <img
              src="/LOGO RMBL-ICON_WHITE.svg"
              className="min-w-5 min-h-9 size-100"
              alt="Logo"
            />
            <h1 className="text-4xl lg:text-5xl font-bold mb-6">
              Your Second Brain
            </h1>
            <p className="text-xl text-green-100 leading-relaxed max-w-md">
              Transform scattered thoughts into organized insights with the
              power of your voice
            </p>
          </div>
        </div>

        {/* Right Side - Auth Section */}
        <div className="w-full lg:w-2/3 flex flex-col justify-center items-center p-8 lg:p-16">
          <div className="w-full max-w-md">
            {/* Mobile-only logo */}
            <div className="lg:hidden mb-10 text-center">
              <div className="flex flex-col justify-center items-center">
                <img
                  src="/LOGO RMBL-ICON.svg"
                  className="min-w-5 min-h-9 size-50"
                  alt="Logo"
                />
              </div>
            </div>

            <div className="text-center mb-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
                Welcome to RMBL
              </h2>
              <p className="text-lg text-gray-600">
                Get started in seconds with your Google account
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className={`w-full bg-white border-1 border-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-xl flex items-center justify-center hover:bg-gray-50 hover:border-gray-300 transition duration-200 shadow-sm ${
                  isLoading
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:shadow-md"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-600 mr-3"></div>
                    Connecting...
                  </>
                ) : (
                  <>
                    <FcGoogle className="w-6 h-6 mr-3" />
                    Continue with Google
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  By continuing, you agree to our{" "}
                  <a
                    href="/terms-of-service"
                    className="text-green-600 hover:text-green-800 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a
                    href="/privacy-policy"
                    className="text-green-600 hover:text-green-800 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>

            {/* Features Section */}
            <div className="mt-12">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                Why professionals choose RMBL
              </h3>
              <div className="space-y-4">
                {/* Feature 1 */}
                <div className="bg-gray-50 p-4 rounded-xl flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-4 flex-shrink-0">
                    <Zap className="text-green-500 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      Instant Capture
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Record thoughts in one click, no typing required
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="bg-gray-50 p-4 rounded-xl flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-4 flex-shrink-0">
                    <Brain className="text-green-500 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      AI Transformation
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Turn voice notes into emails, blogs, and lists
                      automatically
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="bg-gray-50 p-4 rounded-xl flex items-start">
                  <div className="bg-green-100 p-2 rounded-full mr-4 flex-shrink-0">
                    <ArrowRight className="text-green-500 w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-1">
                      Async Workflow
                    </h4>
                    <p className="text-gray-600 text-sm">
                      Perfect for busy schedules and remote work
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthRMBL;
