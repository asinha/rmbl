// app/api/recordings/complete/route.ts
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

    const { duration, transcriptionData } = await request.json();

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const userPlan = subscription?.plan || "free";
    const recordingLimit = subscription?.recordingLimit || 60;

    // For free users, validate against daily limit
    if (userPlan === "free") {
      const today = new Date().toISOString().split("T")[0];

      // Get current usage
      const todayUsage = await prisma.dailyUsage.findUnique({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
      });

      const currentUsed = todayUsage?.usedSeconds || 0;
      const newTotal = currentUsed + duration;

      // Check if this would exceed the limit
      if (newTotal > recordingLimit) {
        return NextResponse.json(
          { error: "Recording would exceed daily limit" },
          { status: 403 }
        );
      }

      // Update usage in database
      await prisma.dailyUsage.upsert({
        where: {
          userId_date: {
            userId,
            date: today,
          },
        },
        update: {
          usedSeconds: newTotal,
        },
        create: {
          userId,
          date: today,
          usedSeconds: duration,
        },
      });
    }

    // Save the transcription (if provided)
    if (transcriptionData) {
      await prisma.transcription.create({
        data: {
          ...transcriptionData,
          userId,
        },
      });
    }

    // Log the recording for analytics/billing
    await prisma.recordingLog.create({
      data: {
        userId,
        duration,
        plan: userPlan,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to complete recording:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
