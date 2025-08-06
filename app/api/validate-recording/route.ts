// app/api/user/validate-recording/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { estimatedDuration } = await request.json();

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const userPlan = subscription?.plan || "free";
    const recordingLimit = subscription?.recordingLimit || 60;

    // Paid users have unlimited recording
    if (userPlan !== "free") {
      return NextResponse.json({ allowed: true });
    }

    // Check today's usage for free users
    const today = new Date().toISOString().split("T")[0];
    const todayUsage = await prisma.dailyUsage.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    const usedSeconds = todayUsage?.usedSeconds || 0;
    const remainingSeconds = Math.max(0, recordingLimit - usedSeconds);

    if (remainingSeconds <= 0) {
      return NextResponse.json(
        { error: "Daily recording limit exceeded" },
        { status: 403 }
      );
    }

    if (estimatedDuration > remainingSeconds) {
      return NextResponse.json(
        { error: "Estimated duration exceeds remaining limit" },
        { status: 403 }
      );
    }

    return NextResponse.json({ allowed: true, remainingSeconds });
  } catch (error) {
    console.error("Failed to validate recording:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
