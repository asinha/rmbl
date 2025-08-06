// app/api/user/me/route.ts
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

    // Try to find the user in DB
    let user = await prisma.user.findUnique({
      where: { id: userId }, // Change to clerkId if that's your DB column
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        subscriptionPlan: true,
        subscriptionStatus: true,
        subscriptionBillingCycle: true,
        subscriptionAmount: true,
        subscriptionStartDate: true,
        subscriptionEndDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // If no user, create one
    if (!user) {
      // You may want to fetch Clerk user details
      const clerkUser = await fetch(
        `https://api.clerk.dev/v1/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
          },
        }
      ).then((res) => res.json());

      user = await prisma.user.create({
        data: {
          id: userId, // or clerkId if you have a separate column
          email: clerkUser.email_addresses[0]?.email_address || "",
          firstName: clerkUser.first_name || "",
          lastName: clerkUser.last_name || "",
          subscriptionPlan: "free", // default plan
          subscriptionStatus: "active", // default status
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          subscriptionPlan: true,
          subscriptionStatus: true,
          subscriptionBillingCycle: true,
          subscriptionAmount: true,
          subscriptionStartDate: true,
          subscriptionEndDate: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Failed to fetch/create user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
