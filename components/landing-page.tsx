"use client";

import { Button } from "@/components/ui/button";
import Head from "next/head";
import { SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import FeatureCard from "./ui/FeatureCard";
import {
  Mic,
  FileText,
  Mail,
  List,
  Timer,
  Tag,
  Brain,
  TrendingUp,
  Zap,
  Archive,
  ArrowRight,
  Sparkles,
  Check,
  Star,
  PlayCircle,
  X,
  Lock,
  CheckCircle,
  Award,
  Smartphone,
} from "lucide-react";

export function LandingPage() {
  const { user } = useUser();

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features-section");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const features = [
    {
      icon: Mic,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-100",
      badge: "Core",
      title: "Frictionless Voice Capture",
      description:
        "One click to start recording. No setup, no complexity. Just speak your mind.",
    },
    {
      icon: FileText,
      iconColor: "text-purple-500",
      bgColor: "bg-purple-100",
      badge: "AI Powered",
      title: "Instant Transcription",
      description:
        "Your voice becomes text in real-time. Perfect accuracy, every time.",
    },
    {
      icon: Mail,
      iconColor: "text-green-500",
      bgColor: "bg-green-100",
      badge: "Transform",
      title: "Email Generation",
      description:
        "Transform your rambling thoughts into professional emails instantly.",
    },
    {
      icon: List,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-100",
      badge: "Transform",
      title: "Smart Listicles",
      description:
        "Turn your ideas into organized lists and action items automatically.",
    },
    {
      icon: Timer,
      iconColor: "text-red-500",
      bgColor: "bg-red-100",
      badge: "Freemium",
      title: "Time-Based Limits",
      description:
        "Free tier: 1 minute recordings. Pro: unlimited thinking time.",
    },
    {
      icon: Tag,
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-100",
      badge: "Organization",
      title: "Smart Tagging",
      description:
        "Organize thoughts with Work, Personal, Meeting, and Idea tags.",
    },
    {
      icon: Brain,
      iconColor: "text-pink-500",
      bgColor: "bg-pink-100",
      badge: "Core",
      title: "Second Brain",
      description:
        "Build a repository of your thoughts. Search, recall, and reuse insights.",
    },
    {
      icon: TrendingUp,
      iconColor: "text-teal-500",
      bgColor: "bg-teal-100",
      badge: "Analytics",
      title: "Insight Dashboard",
      description:
        "See patterns in your thinking. Track your most productive ideas.",
    },
    {
      icon: Zap,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-400 bg-opacity-30",
      badge: "Productivity",
      title: "Async Workflows",
      description:
        "Perfect for busy professionals. Capture now, process later.",
    },
    {
      icon: Archive,
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
      icon: Mic,
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
      icon: Award,
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
      </Head>

      <main className="min-h-screen bg-white font-['Inter',sans-serif]">
        <section className="min-h-screen bg-gradient-to-br from-[#f7fef8] via-[#f0fdf4] to-[#ecfdf5] font-['Inter',sans-serif]">
          {/* Hero Section */}
          <section className="py-24 text-center">
            <h1 className="text-5xl font-bold text-gray-800">
              Speak your mind.
            </h1>
            <h1 className="text-5xl font-bold text-green-600 mb-4">
              RMBL your thoughts.
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              One click is all it takes to transform your voice into actionable
              insights. Your second brain, always listening.
            </p>
            <div className="flex justify-center space-x-4">
              <button className="bg-green-600 text-white font-semibold py-3 px-6 rounded-lg flex items-center shadow-md hover:bg-green-700 transition duration-200">
                <Mic className="mr-2 w-5 h-5" />
                Start RMBLing
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
              <button className="bg-white text-gray-800 font-semibold py-3 px-6 rounded-lg border border-gray-300 shadow-md hover:bg-gray-50 transition duration-200">
                See How It Works
              </button>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-8 rounded-lg border border-gray-200 text-center shadow-sm">
                <div className="flex justify-center items-center mb-4">
                  <Mic className="text-green-500 w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Quick Capture
                </h3>
                <p className="text-gray-600">Voice to text in seconds</p>
              </div>

              <div className="bg-white p-8 rounded-lg border border-gray-200 text-center shadow-sm">
                <div className="flex justify-center items-center mb-4">
                  <Zap className="text-green-500 w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  AI Transform
                </h3>
                <p className="text-gray-600">Emails, blogs, lists</p>
              </div>

              <div className="bg-white p-8 rounded-lg border border-gray-200 text-center shadow-sm">
                <div className="flex justify-center items-center mb-4">
                  <Brain className="text-green-500 w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Second Brain
                </h3>
                <p className="text-gray-600">Organize and recall</p>
              </div>
            </div>
          </section>

          {/* Apps Coming Soon Section */}
          <section className="py-12">
            <div className="bg-green-100 border border-green-200 rounded-lg p-8 max-w-2xl mx-auto text-center">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-center">
                <Smartphone className="mr-2 w-6 h-6" />
                Apps Coming Soon!
              </h3>
              <div className="flex justify-center space-x-4 mb-4">
                <a className="inline-block" href="#">
                  <div className="h-12 w-32 bg-black rounded-lg flex items-center justify-center text-white text-sm font-medium">
                    Google Play
                  </div>
                </a>
                <a className="inline-block" href="#">
                  <div className="h-12 w-32 bg-black rounded-lg flex items-center justify-center text-white text-sm font-medium">
                    App Store
                  </div>
                </a>
              </div>
              <p className="text-gray-600 mb-6">
                Unlimited recording on mobile devices
              </p>
              <a
                className="text-green-700 font-semibold flex items-center justify-center"
                href="#"
              >
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Grab your lifetime offer before mobile launch!
              </a>
            </div>
          </section>

          {/* Trusted By Section */}
          <section className="py-16 text-center">
            <p className="text-sm text-gray-500 mb-4">
              Trusted by busy professionals
            </p>
            <div className="flex justify-center space-x-4">
              <span className="bg-gray-200 text-gray-600 text-sm font-medium px-4 py-1 rounded-full">
                Company
              </span>
              <span className="bg-gray-200 text-gray-600 text-sm font-medium px-4 py-1 rounded-full">
                Startup
              </span>
              <span className="bg-gray-200 text-gray-600 text-sm font-medium px-4 py-1 rounded-full">
                Agency
              </span>
            </div>
          </section>
        </section>

        <section className="bg-gradient-to-b from-gray-50 to-gray-100">
          {/* Features Section */}
          <div id="features-section" className="container mx-auto px-4 py-16">
            <header className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
                Your voice, <span className="text-green-600">amplified</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                RMBL transforms the way busy professionals capture, process, and
                act on their thoughts.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-50 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`${feature.bgColor} p-2 rounded-full`}>
                        <IconComponent
                          className={`h-6 w-6 ${feature.iconColor}`}
                        />
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
                );
              })}
            </div>
          </div>

          {/* Workflow Section */}
          <div className="container mx-auto px-8 py-16 text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Perfect for every workflow
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-12">
              Whether you're starting your day, wrapping up meetings, or
              capturing late-night insights— RMBL fits seamlessly into your
              routine.
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
        </section>
        {/* Pricing Section */}
        <div className="bg-gray-50 font-['Roboto',sans-serif] min-h-screen">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            {/* Header */}
            <header className="text-center mb-8 sm:mb-12">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 leading-tight">
                One simple choice:{" "}
                <span className="text-green-500">Free or Forever</span>
              </h1>
              <p className="text-gray-600 mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg px-4 sm:px-0">
                Start free with 1-minute recordings, or get unlimited access
                forever with one payment.
              </p>
            </header>

            {/* Pricing Cards */}
            <div className="flex flex-col lg:flex-row justify-center items-stretch gap-6 lg:gap-8 max-w-6xl mx-auto">
              {/* Free Plan */}
              <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 w-full lg:w-1/2 xl:w-2/5">
                <div className="text-center mb-6">
                  <Mic className="text-gray-400 w-12 h-12 sm:w-16 sm:h-16 mx-auto" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-3 sm:mt-4">
                    Web Recording
                  </h2>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Free
                  </p>
                  <p className="text-sm text-gray-500">1-minute limit</p>
                  <p className="text-gray-600 mt-2 text-sm sm:text-base">
                    Perfect for quick thoughts on the web
                  </p>
                </div>

                <ul className="space-y-3 sm:space-y-4 text-gray-500 text-sm sm:text-base">
                  <li className="flex items-center">
                    <Check className="text-green-500 mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>1-minute recording time</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="text-green-500 mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>Basic transcription</span>
                  </li>
                  <li className="flex items-center text-gray-400">
                    <X className="mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>Web-only access</span>
                  </li>
                  <li className="flex items-center text-gray-400">
                    <X className="mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>Basic dashboard</span>
                  </li>
                  <li className="flex items-center text-gray-400">
                    <X className="mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>Unlimited recording</span>
                  </li>
                  <li className="flex items-center text-gray-400">
                    <X className="mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>AI transformations</span>
                  </li>
                  <li className="flex items-center text-gray-400">
                    <X className="mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>Mobile apps access</span>
                  </li>
                  <li className="flex items-center text-gray-400">
                    <X className="mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>

                <button className="mt-6 sm:mt-8 w-full py-3 px-6 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-100 transition duration-300 text-sm sm:text-base">
                  Start Recording
                </button>
              </div>

              {/* Lifetime Plan */}
              <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 w-full lg:w-1/2 xl:w-2/5 h-1/2 border-2 border-green-500 relative">
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-2 sm:px-3 py-1 rounded-bl-lg rounded-tr-lg transform -translate-y-0.5 translate-x-0.5">
                  $300 OFF
                </span>

                <div className="text-center mb-6">
                  <Star className="text-green-500 w-12 h-12 sm:w-16 sm:h-16 mx-auto fill-current" />
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mt-3 sm:mt-4">
                    Lifetime Access
                  </h2>
                  <p className="text-4xl sm:text-5xl font-bold text-gray-800">
                    $99
                  </p>
                  <p className="text-sm text-gray-500">one-time payment</p>
                  <p className="text-xs text-red-500 line-through">
                    ($399) 80% OFF
                  </p>
                </div>

                <div className="text-xs sm:text-sm text-yellow-600 bg-yellow-100 p-3 rounded-lg mb-4">
                  <p>
                    <span className="font-bold">LIMITED TIME:</span> Get
                    everything forever + upcoming mobile apps
                  </p>
                  <p className="text-xs mt-1">Price increases to $199 soon!</p>
                  <p className="text-xs mt-1">1,247+ users joined this week</p>
                </div>

                <ul className="space-y-3 sm:space-y-4 text-gray-600 text-sm sm:text-base">
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>Unlimited recording time</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>AI-powered transformations</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>Email & blog generation</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>Advanced archive & search</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>iOS & Android apps access</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>Lifetime updates included</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>VIP support access</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>Early beta features</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>Priority feature requests</span>
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2 w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>No monthly fees ever</span>
                  </li>
                </ul>

                <button className="mt-6 sm:mt-8 w-full py-3 px-4 sm:px-6 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition duration-300 flex items-center justify-center text-sm sm:text-base">
                  <Lock className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                  Secure Lifetime Access Now
                </button>
              </div>
            </div>

            {/* Mobile Apps Section */}
            <div className="mt-12 sm:mt-16 bg-green-50 p-6 sm:p-8 lg:p-12 rounded-lg text-center mx-4 sm:mx-0">
              <div className="flex justify-center items-center gap-4 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold">iOS</span>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <Smartphone className="text-white w-4 h-4 sm:w-6 sm:h-6" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Mobile Apps Coming Soon!
              </h3>
              <p className="text-gray-600 mt-2 max-w-2xl mx-auto text-sm sm:text-base px-4 sm:px-0">
                Get ready for unlimited recording on iOS and Android. Full
                mobile experience with all features included in your lifetime
                purchase.
              </p>
              <div className="flex justify-center items-center gap-2 sm:gap-4 text-xs text-gray-500 mt-4 flex-wrap">
                <span># iOS App</span>
                <span># Android App</span>
                <span># Unlimited Recording</span>
                <span># Sync Across Devices</span>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center mt-8 sm:mt-12 px-4 sm:px-0">
              <a
                className="text-green-600 font-semibold hover:underline inline-flex items-center text-sm sm:text-base"
                href="#"
              >
                <PlayCircle className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                Try 1-Minute Recording Now (Free)
              </a>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
