import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Raleway } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/client";
import { TogetherApiKeyProvider } from "@/components/TogetherApiKeyProvider";
import PlausibleProvider from "next-plausible";
import { ReduxProvider } from "@/components/providers/ReduxProvider";

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
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#16a34a", // green-600 if you want to match your theme
        },
        elements: {
          socialButtonsProviderIcon__google: {
            filter: "none", // removes the gray filter on Google icon
          },
          socialButtonsBlockButton: {
            backgroundColor: "#f8fafc", // slate-50
            "&:hover": {
              backgroundColor: "#f1f5f9", // slate-100
            },
          },
        },
        layout: {
          logoImageUrl: "/LOGO RMBL-ICON.svg", // your logo
          logoPlacement: "inside", // or 'outside'
          socialButtonsPlacement: "bottom", // or 'top'
          socialButtonsVariant: "blockButton", // or 'iconButton'
        },
        signIn: {
          variables: {
            colorPrimary: "#16a34a", // green-600
          },
          elements: {
            headerTitle: {
              display: "none", // hide default header if needed
            },
            card: {
              boxShadow: "none",
              border: "1px solid #e2e8f0", // slate-200
            },
          },
        },
      }}
    >
      <TogetherApiKeyProvider>
        <TRPCReactProvider>
          <html lang="en">
            <head>
              <PlausibleProvider domain="usewhisper.io" />
            </head>
            <ReduxProvider>
              <body className={`${raleway.variable} antialiased`}>
                <div className="min-h-screen bg-white flex flex-col">
                  {children}
                  <Toaster richColors />
                </div>
              </body>
            </ReduxProvider>
          </html>
        </TRPCReactProvider>
      </TogetherApiKeyProvider>
    </ClerkProvider>
  );
}
