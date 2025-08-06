// app/api/subscription/usage/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find user by Clerk userId
    const user = await prisma.user.findUnique({
      where: { id: userId }, // Assuming you store Clerk ID as clerkId
      select: {
        id: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionBillingCycle: true,
        subscriptionEndDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get today's date for usage calculation
    const today = new Date().toISOString().split("T")[0];

    // Get daily usage for today
    const todayUsage = await prisma.dailyUsage.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: today,
        },
      },
    });

    // Get subscription limits based on plan
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    const userPlan = user.subscriptionPlan || "free";
    const recordingLimit = subscription?.recordingLimit || 60; // Default 60 seconds for free
    const usedSeconds = todayUsage?.usedSeconds || 0;
    const remainingSeconds = Math.max(0, recordingLimit - usedSeconds);

    // Calculate subscription status
    let subscriptionActive = false;
    let daysUntilExpiry = null;

    if (user.subscriptionEndDate) {
      const expiryDate = new Date(user.subscriptionEndDate);
      const currentDate = new Date();
      subscriptionActive = expiryDate > currentDate;

      if (subscriptionActive) {
        const timeDiff = expiryDate.getTime() - currentDate.getTime();
        daysUntilExpiry = Math.ceil(timeDiff / (1000 * 3600 * 24));
      }
    } else if (userPlan === "lifetime") {
      subscriptionActive = true;
    }

    // Get recent usage history (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsage = await prisma.dailyUsage.findMany({
      where: {
        userId: user.id,
        date: {
          gte: sevenDaysAgo.toISOString().split("T")[0],
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      usage: {
        plan: userPlan,
        status: user.subscriptionStatus || "inactive",
        active: subscriptionActive,
        dailyLimit: recordingLimit,
        usedToday: usedSeconds,
        remainingToday: remainingSeconds,
        daysUntilExpiry,
        expiryDate: user.subscriptionEndDate,
        recentUsage: recentUsage.map((usage: any) => ({
          date: usage.date,
          usedSeconds: usage.usedSeconds,
        })),
      },
    });
  } catch (error) {
    console.error("Failed to fetch subscription usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
