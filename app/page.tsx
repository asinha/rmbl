"use client";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LandingPage } from "@/components/landing-page";

export interface Transcription {
  id: string;
  title: string;
  content: string;
  preview: string;
  timestamp: string;
  duration?: string;
}

export default function Home() {
  return (
    <>
      <Header />
      <LandingPage />
      <Footer />
    </>
  );
}
