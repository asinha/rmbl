// app/api/coupons/validate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

// Helper function to get client IP address
function getClientIP(request: NextRequest): string {
  // Check various headers for the client IP
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback - though this might not be available in all deployment environments
  return "unknown";
}

// Define server-side coupon configurations (should match database)
const COUPON_CONFIGS: Record<
  string,
  {
    type: "percentage" | "fixed";
    value: number;
    description: string;
    validFor: string[];
    active: boolean;
    expiresAt?: Date;
    maxUses?: number;
  }
> = {
  SAVE20: {
    type: "percentage",
    value: 20,
    description: "20% off",
    validFor: ["annual", "lifetime"],
    active: true,
  },
  EARLY50: {
    type: "percentage",
    value: 50,
    description: "50% off early bird special",
    validFor: ["lifetime"],
    active: true,
    expiresAt: new Date("2024-12-31"), // Example expiry
  },
  DISCOUNT25: {
    type: "fixed",
    value: 25,
    description: "$25 off",
    validFor: ["annual", "lifetime"],
    active: true,
    maxUses: 100, // Example usage limit
  },
};

// Plan price validation
const PLAN_PRICES: Record<string, number> = {
  monthly: 0.99,
  annual: 19.99,
  lifetime: 99,
};

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { couponCode, planType, originalPrice } = await request.json();

    // Input validation
    if (!couponCode || typeof couponCode !== "string") {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 400 }
      );
    }

    if (!planType || !PLAN_PRICES[planType]) {
      return NextResponse.json({ error: "Invalid plan type" }, { status: 400 });
    }

    // Validate original price matches server-side configuration
    if (originalPrice !== PLAN_PRICES[planType]) {
      return NextResponse.json({ error: "Price mismatch" }, { status: 400 });
    }

    // Sanitize coupon code
    const sanitizedCouponCode = couponCode
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "");

    if (sanitizedCouponCode.length > 20) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 400 }
      );
    }

    // Check if coupon exists in configuration
    const couponConfig = COUPON_CONFIGS[sanitizedCouponCode];
    if (!couponConfig) {
      return NextResponse.json(
        { error: "Invalid coupon code" },
        { status: 400 }
      );
    }

    // Check if coupon is active
    if (!couponConfig.active) {
      return NextResponse.json(
        { error: "This coupon is no longer active" },
        { status: 400 }
      );
    }

    // Check if coupon is expired
    if (couponConfig.expiresAt && new Date() > couponConfig.expiresAt) {
      return NextResponse.json(
        { error: "This coupon has expired" },
        { status: 400 }
      );
    }

    // Check if coupon is valid for this plan
    if (!couponConfig.validFor.includes(planType)) {
      return NextResponse.json(
        {
          error: `This coupon is not valid for the selected plan`,
        },
        { status: 400 }
      );
    }

    // Check usage limits (if applicable)
    if (couponConfig.maxUses) {
      const usageCount = await prisma.couponUsage.count({
        where: { couponCode: sanitizedCouponCode },
      });

      if (usageCount >= couponConfig.maxUses) {
        return NextResponse.json(
          {
            error: "This coupon has reached its usage limit",
          },
          { status: 400 }
        );
      }
    }

    // Check if user has already used this coupon
    const existingUsage = await prisma.couponUsage.findFirst({
      where: {
        userId,
        couponCode: sanitizedCouponCode,
      },
    });

    if (existingUsage) {
      return NextResponse.json(
        {
          error: "You have already used this coupon",
        },
        { status: 400 }
      );
    }

    // Calculate discounted price
    let discountedPrice = originalPrice;
    if (couponConfig.type === "percentage") {
      discountedPrice = originalPrice * (1 - couponConfig.value / 100);
    } else if (couponConfig.type === "fixed") {
      discountedPrice = Math.max(0, originalPrice - couponConfig.value);
    }

    // Round to 2 decimal places
    discountedPrice = Math.round(discountedPrice * 100) / 100;

    // Get client IP address
    const clientIP = getClientIP(request);

    // Log the validation attempt (for analytics/security)
    await prisma.couponValidation.create({
      data: {
        userId,
        couponCode: sanitizedCouponCode,
        planType,
        originalPrice,
        discountedPrice,
        successful: true,
        ipAddress: clientIP,
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      couponCode: sanitizedCouponCode,
      discountedPrice,
      discount: {
        type: couponConfig.type,
        value: couponConfig.value,
        amount: originalPrice - discountedPrice,
        description: couponConfig.description,
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error);

    // Log failed validation attempt
    try {
      const { userId } = await auth();
      const body = await request.json().catch(() => ({}));
      const clientIP = getClientIP(request);

      await prisma.couponValidation.create({
        data: {
          userId: userId || "anonymous",
          couponCode: body.couponCode || "unknown",
          planType: body.planType || "unknown",
          originalPrice: body.originalPrice || 0,
          discountedPrice: 0,
          successful: false,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
          ipAddress: clientIP,
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      });
    } catch (logError) {
      console.error("Failed to log validation attempt:", logError);
    }

    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
