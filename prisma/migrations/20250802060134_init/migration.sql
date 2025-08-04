-- CreateTable
CREATE TABLE "public"."Whisper" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fullTranscription" TEXT NOT NULL,

    CONSTRAINT "Whisper_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Transformation" (
    "id" TEXT NOT NULL,
    "whisperId" TEXT NOT NULL,
    "isGenerating" BOOLEAN NOT NULL DEFAULT true,
    "typeName" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transformation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AudioTrack" (
    "id" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "partialTranscription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "whisperId" TEXT NOT NULL,
    "language" TEXT,

    CONSTRAINT "AudioTrack_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Transformation" ADD CONSTRAINT "Transformation_whisperId_fkey" FOREIGN KEY ("whisperId") REFERENCES "public"."Whisper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AudioTrack" ADD CONSTRAINT "AudioTrack_whisperId_fkey" FOREIGN KEY ("whisperId") REFERENCES "public"."Whisper"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Transaction and User Subscription Tables
-- Add this to your Prisma schema or run as SQL migrations

-- Users table updates (add subscription fields)
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'free';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'inactive';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_billing_cycle VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_amount DECIMAL(10,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255),
    
    -- Payment details
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'usd',
    status VARCHAR(20) NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
    
    -- Plan details
    plan_type VARCHAR(50) NOT NULL, -- 'monthly', 'annual', 'lifetime'
    billing_cycle VARCHAR(20) NOT NULL, -- 'monthly', 'yearly', 'once'
    original_price DECIMAL(10,2),
    final_price DECIMAL(10,2) NOT NULL,
    
    -- Coupon information
    coupon_code VARCHAR(50),
    discount_amount DECIMAL(10,2) DEFAULT 0,
    discount_type VARCHAR(20), -- 'percentage', 'fixed'
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_date TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_payment_intent ON transactions(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

-- Subscription history table (optional - for tracking subscription changes)
CREATE TABLE IF NOT EXISTS subscription_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES transactions(id),
    
    -- Subscription details
    plan_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'active', 'cancelled', 'expired', 'paused'
    billing_cycle VARCHAR(20),
    amount DECIMAL(10,2),
    
    -- Dates
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_status ON subscription_history(status);