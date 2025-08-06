// app/api/user/daily-usage/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().split("T")[0];

    // Get user's subscription to know their limit
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const recordingLimit = subscription?.recordingLimit || 60; // Default free limit

    // Get today's usage
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

    return NextResponse.json({
      date: today,
      usedSeconds,
      remainingSeconds,
    });
  } catch (error) {
    console.error("Failed to fetch daily usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
