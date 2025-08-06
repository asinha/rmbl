"use client";

import { Button } from "@/components/ui/button";
import Head from "next/head";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import FeatureCard from "./ui/FeatureCard";

export function LandingPage() {
  const { user } = useUser();

  const features = [
    {
      icon: "mic_none",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-100",
      badge: "Core",
      title: "Frictionless Voice Capture",
      description:
        "One click to start recording. No setup, no complexity. Just speak your mind.",
    },
    {
      icon: "description",
      iconColor: "text-purple-500",
      bgColor: "bg-purple-100",
      badge: "AI Powered",
      title: "Instant Transcription",
      description:
        "Your voice becomes text in real-time. Perfect accuracy, every time.",
    },
    {
      icon: "email",
      iconColor: "text-green-500",
      bgColor: "bg-green-100",
      badge: "Transform",
      title: "Email Generation",
      description:
        "Transform your rambling thoughts into professional emails instantly.",
    },
    {
      icon: "list_alt",
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-100",
      badge: "Transform",
      title: "Smart Listicles",
      description:
        "Turn your ideas into organized lists and action items automatically.",
    },
    {
      icon: "timer",
      iconColor: "text-red-500",
      bgColor: "bg-red-100",
      badge: "Freemium",
      title: "Time-Based Limits",
      description:
        "Free tier: 1 minute recordings. Pro: unlimited thinking time.",
    },
    {
      icon: "label",
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-100",
      badge: "Organization",
      title: "Smart Tagging",
      description:
        "Organize thoughts with Work, Personal, Meeting, and Idea tags.",
    },
    {
      icon: "psychology",
      iconColor: "text-pink-500",
      bgColor: "bg-pink-100",
      badge: "Core",
      title: "Second Brain",
      description:
        "Build a repository of your thoughts. Search, recall, and reuse insights.",
    },
    {
      icon: "insights",
      iconColor: "text-teal-500",
      bgColor: "bg-teal-100",
      badge: "Analytics",
      title: "Insight Dashboard",
      description:
        "See patterns in your thinking. Track your most productive ideas.",
    },
    {
      icon: "flash_on",
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-400 bg-opacity-30",
      badge: "Productivity",
      title: "Async Workflows",
      description:
        "Perfect for busy professionals. Capture now, process later.",
    },
    {
      icon: "inventory_2",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-100",
      badge: "Storage",
      title: "Thought Archive",
      description:
        "Never lose a good idea. Everything stored, searchable, retrievable.",
    },
  ];

  const workflows = [
    {
      badge: "Founders",
      title: "Daily Reflections",
      description:
        "Start or end your day by capturing thoughts, insights, and learnings.",
    },
    {
      badge: "Consultants",
      title: "Meeting Follow-ups",
      description:
        "Quickly record action items and follow-ups after important meetings.",
    },
    {
      badge: "Investors",
      title: "Idea Dumping",
      description:
        "Brain dump investment insights, market observations, and opportunities.",
    },
    {
      badge: "Creators",
      title: "Content Planning",
      description:
        "Capture content ideas and turn them into blogs, newsletters, and posts.",
    },
  ];

  const pricingPlans = [
    {
      name: "Free",
      icon: "mic_none",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      price: "$0",
      period: "/forever",
      description: "Perfect for testing the waters",
      features: [
        "1-minute recording limit",
        "Basic transcription",
        "Simple tagging (Work, Personal)",
        "Basic dashboard view",
        "Up to 10 recordings stored",
      ],
      excluded: [
        "No AI transformations",
        "Limited storage",
        "No export options",
      ],
      buttonVariant: "outline",
      buttonText: "Start Free",
    },
    {
      name: "Pro",
      icon: "workspace_premium",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-500",
      price: "$19",
      period: "/per month",
      description: "Unlimited thinking for serious professionals",
      features: [
        "Unlimited recording time",
        "AI-powered transformations",
        "Email generation",
        "Blog post creation",
        "Smart listicle generation",
        "Advanced tagging system",
        "Full search & archive",
        "Export to multiple formats",
        "Priority support",
        "Coming soon: Integrations",
      ],
      popular: true,
      buttonVariant: "default",
      buttonText: "Go Pro",
      buttonClass: "bg-gradient-to-r from-blue-500 to-purple-600",
    },
  ];

  return (
    <>
      <Head>
        <title>RMBL - Your voice, amplified</title>
        <meta
          name="description"
          content="Transform your voice into actionable insights"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
      </Head>

      <main className="bg-white font-sans">
        {/* Hero Section */}
        <div className="flex items-center justify-center min-h-[80vh] bg-purple-50">
          <div className="container mx-auto p-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                Speak your mind.
              </span>
            </h1>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                RMBL your thoughts.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              One click is all it takes to transform your voice into actionable
              insights. Your second brain, always listening.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              {user ? (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:opacity-90"
                  >
                    <span className="material-icons mr-2">mic</span>
                    Start RMBLing
                    <span className="material-icons ml-2">arrow_forward</span>
                  </Button>
                </Link>
              ) : (
                <SignInButton>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-indigo-600 to-purple-500 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:opacity-90"
                  >
                    <span className="material-icons mr-2">mic</span>
                    Start RMBLing
                    <span className="material-icons ml-2">arrow_forward</span>
                  </Button>
                </SignInButton>
              )}

              <Button
                variant="outline"
                className="bg-white text-gray-700 font-semibold py-3 px-6 rounded-lg border border-gray-300 shadow-md hover:shadow-lg transition-all hover:bg-gray-50"
              >
                See How It Works
              </Button>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 max-w-4xl mx-auto">
              <FeatureCard
                icon="mic"
                iconColor="text-blue-500"
                bgColor="bg-blue-100"
                title="Quick Capture"
                description="Voice to text in seconds"
              />

              <FeatureCard
                icon="auto_awesome"
                iconColor="text-purple-500"
                bgColor="bg-purple-100"
                title="AI Transform"
                description="Emails, blogs, lists"
              />

              <FeatureCard
                icon="memory"
                iconColor="text-green-500"
                bgColor="bg-green-100"
                title="Second Brain"
                description="Organize and recall"
              />
            </div>

            {/* Trusted By */}
            <p className="text-gray-500 text-sm mb-4">
              Trusted by busy professionals
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 text-gray-500">
              <span>Company</span>
              <span>Startup</span>
              <span>Agency</span>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4 py-16">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Your voice, <span className="text-purple-600">amplified</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              RMBL transforms the way busy professionals capture, process, and
              act on their thoughts.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`${feature.bgColor} p-2 rounded-full`}>
                    <span className={`material-icons ${feature.iconColor}`}>
                      {feature.icon}
                    </span>
                  </div>
                  <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {feature.badge}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h2>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Section */}
        <div className="container mx-auto px-8 py-16 text-center bg-gray-50">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Perfect for every workflow
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            Whether you're starting your day, wrapping up meetings, or capturing
            late-night insights— RMBL fits seamlessly into your routine.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {workflows.map((workflow, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
              >
                <span className="inline-block bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full mb-4">
                  {workflow.badge}
                </span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {workflow.title}
                </h3>
                <p className="text-gray-500">{workflow.description}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Pricing Section */}
        <div className="container mx-auto px-4 py-16 bg-gray-50">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Simple, honest pricing
            </h1>
            <p className="text-gray-500 mt-4 text-lg">
              Start free, upgrade when your thoughts need more room to grow.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row justify-center gap-8">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-md p-8 w-full max-w-md border ${
                  plan.popular
                    ? "border-2 border-indigo-500 relative"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-sm font-semibold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="flex flex-col items-center">
                  <div className={`${plan.iconBg} rounded-full p-4 mb-4`}>
                    <span
                      className={`material-icons ${plan.iconColor}`}
                      style={{ fontSize: "32px" }}
                    >
                      {plan.icon}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {plan.name}
                  </h2>
                  <p className="text-4xl font-bold text-gray-900 mt-2">
                    {plan.price}{" "}
                    <span className="text-lg font-normal text-gray-500">
                      {plan.period}
                    </span>
                  </p>
                  <p className="text-gray-500 mt-2">{plan.description}</p>
                </div>

                <div className="mt-8">
                  <ul className="space-y-3 text-gray-600">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center">
                        <span className="material-icons text-green-500 mr-3">
                          check_circle
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {plan.excluded && (
                    <div className="mt-8 border-t pt-6">
                      <p className="text-gray-500 mb-4">Not included:</p>
                      <ul className="space-y-3 text-gray-400">
                        {plan.excluded.map((item, i) => (
                          <li key={i} className="flex items-center">
                            <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-10 text-center">
                  <Button
                    variant={plan.buttonVariant as "default" | "outline"}
                    className={`w-full font-semibold py-3 px-6 rounded-lg transition ${
                      plan.buttonClass || ""
                    }`}
                  >
                    {plan.buttonText}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Final CTA Section */}
        <div className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-16 px-4">
          <div className="container mx-auto max-w-4xl p-8 rounded-lg">
            <div className="flex justify-center items-center mb-4">
              <span className="material-icons text-4xl">flash_on</span>
              <h2 className="text-3xl font-bold ml-2">Ready to RMBL?</h2>
            </div>
            <p className="text-lg mb-6">
              Join busy professionals who've made RMBL their second brain.
              <br />
              Start with a free account—no credit card required.
            </p>
            {user ? (
              <Link href="/dashboard">
                <Button
                  variant="secondary"
                  className="bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition duration-300 ease-in-out flex items-center justify-center mx-auto"
                >
                  <span className="material-icons mr-2">mic</span>
                  Start Your First Recording
                </Button>
              </Link>
            ) : (
              <SignInButton>
                <Button
                  variant="secondary"
                  className="bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition duration-300 ease-in-out flex items-center justify-center mx-auto"
                >
                  <span className="material-icons mr-2">mic</span>
                  Get Started for Free
                </Button>
              </SignInButton>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
