// app/api/subscription/usage/route.ts
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try to find user in DB
    let user = await prisma.user.findUnique({
      where: { id: userId }, // Or clerkId if you store it separately
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionBillingCycle: true,
        subscriptionEndDate: true,
      },
    });

    // If no user exists, create one from Clerk data
    if (!user) {
      const clerkData = await currentUser();

      user = await prisma.user.create({
        data: {
          id: userId,
          firstName: clerkData?.firstName || "",
          lastName: clerkData?.lastName || "",
          email: clerkData?.emailAddresses[0]?.emailAddress || "",
          subscriptionPlan: "free",
          subscriptionStatus: "active",
          subscriptionBillingCycle: "none",
          subscriptionEndDate: null,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          subscriptionBillingCycle: true,
          subscriptionEndDate: true,
        },
      });
    }

    // Ensure subscription exists for this user
    let subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: "free",
          recordingLimit: 60, // Default limit
        },
      });
    }

    // Today's date for usage lookup
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

    // Usage calculations
    const userPlan = user.subscriptionPlan || "free";
    const recordingLimit = subscription?.recordingLimit || 60;
    const usedSeconds = todayUsage?.usedSeconds || 0;
    const remainingSeconds = Math.max(0, recordingLimit - usedSeconds);

    // Subscription status
    let subscriptionActive = false;
    let daysUntilExpiry: number | null = null;

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

    // Get recent usage (last 7 days)
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
        recentUsage: recentUsage.map((usage) => ({
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
