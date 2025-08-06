// app/api/usage/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// GET daily usage for a user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in DB
    let user = await prisma.user.findUnique({ where: { id: userId } });
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
      });
    }

    // Ensure subscription exists
    let subscription = await prisma.subscription.findUnique({
      where: { userId },
    });
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId,
          plan: "free",
          recordingLimit: 60, // default
        },
      });
    }

    // Get date from query param or default to today
    const { searchParams } = new URL(request.url);
    const date =
      searchParams.get("date") || new Date().toISOString().split("T")[0];

    // Get today's usage
    const todayUsage = await prisma.dailyUsage.findUnique({
      where: {
        userId_date: { userId, date },
      },
    });

    const usedSeconds = todayUsage?.usedSeconds || 0;
    const remainingSeconds = Math.max(
      0,
      subscription.recordingLimit - usedSeconds
    );

    return NextResponse.json({
      date,
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

// POST to update usage
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { durationSeconds, date } = await request.json();
    if (!durationSeconds || !date) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    // Ensure user exists
    let user = await prisma.user.findUnique({ where: { id: userId } });
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
      });
    }

    // Update or create usage record
    const updatedUsage = await prisma.dailyUsage.upsert({
      where: { userId_date: { userId, date } },
      update: { usedSeconds: { increment: durationSeconds } },
      create: {
        userId,
        date,
        usedSeconds: durationSeconds,
      },
    });

    return NextResponse.json(updatedUsage);
  } catch (error) {
    console.error("Failed to update usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
