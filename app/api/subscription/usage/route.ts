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

    // Ensure user exists
    let user = await prisma.user.findUnique({
      where: { id: userId },
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

    // Ensure subscription exists
    let subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    });
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: "free",
          recordingLimit: 60, // seconds
        },
      });
    }

    // Today's usage (auto-create if missing)
    const today = new Date().toISOString().split("T")[0];
    let todayUsage = await prisma.dailyUsage.findUnique({
      where: { userId_date: { userId: user.id, date: today } },
    });

    if (!todayUsage) {
      todayUsage = await prisma.dailyUsage.create({
        data: { userId: user.id, date: today, usedSeconds: 0 },
      });
    }

    // Usage calculations
    const userPlan = user.subscriptionPlan || "free";
    const recordingLimit = subscription.recordingLimit || 60;
    const usedSeconds = todayUsage.usedSeconds;
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

    // Last 7 days usage
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsage = await prisma.dailyUsage.findMany({
      where: {
        userId: user.id,
        date: { gte: sevenDaysAgo.toISOString().split("T")[0] },
      },
      orderBy: { date: "desc" },
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
        recentUsage: recentUsage.map((u) => ({
          date: u.date,
          usedSeconds: u.usedSeconds,
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

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { durationSeconds } = await req.json();
    if (!durationSeconds || durationSeconds <= 0) {
      return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
    }

    const today = new Date().toISOString().split("T")[0];

    // Update or create usage
    await prisma.dailyUsage.upsert({
      where: { userId_date: { userId, date: today } },
      update: { usedSeconds: { increment: durationSeconds } },
      create: { userId, date: today, usedSeconds: durationSeconds },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
