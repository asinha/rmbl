import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Raleway } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/client";
import { TogetherApiKeyProvider } from "@/components/TogetherApiKeyProvider";
import PlausibleProvider from "next-plausible";

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RMBL App - Capture Your Thoughts By Voice",
  description: "Convert your thoughts into text by voice with RMBL.",
  openGraph: {
    images: "https://usewhisper.io/og.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Use client-side navigation for login/signup
  // This must be a Client Component to use useRouter, so we can use a workaround:
  // Place a ClientHeader component below
  return (
    <ClerkProvider>
      <TogetherApiKeyProvider>
        <TRPCReactProvider>
          <html lang="en">
            <head>
              <PlausibleProvider domain="usewhisper.io" />
            </head>
            <body className={`${raleway.variable} antialiased`}>
              <div className="min-h-screen bg-white flex flex-col">
                {children}
                <Toaster richColors />
              </div>
            </body>
          </html>
        </TRPCReactProvider>
      </TogetherApiKeyProvider>
    </ClerkProvider>
  );
}
