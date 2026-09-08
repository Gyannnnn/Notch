-- CreateEnum
CREATE TYPE "Region" AS ENUM ('IN', 'US', 'OTHER');

-- CreateEnum
CREATE TYPE "Goal" AS ENUM ('CUT', 'BULK', 'MAINTAIN');

-- CreateEnum
CREATE TYPE "ActivityLevel" AS ENUM ('SEDENTARY', 'LIGHT', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE');

-- CreateEnum
CREATE TYPE "PhotoAngle" AS ENUM ('FRONT', 'SIDE', 'BACK');

-- CreateEnum
CREATE TYPE "FoodSource" AS ENUM ('BARCODE', 'PRESET', 'MANUAL', 'AI_ASSIST');

-- CreateEnum
CREATE TYPE "MealSlot" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK');

-- CreateEnum
CREATE TYPE "LoggedVia" AS ENUM ('BARCODE_SCAN', 'PRESET_TAP', 'MANUAL_ENTRY', 'AI_ASSIST', 'USUAL_REPEAT');

-- CreateEnum
CREATE TYPE "SubscriptionTier" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'GRACE_PERIOD', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Store" AS ENUM ('APP_STORE', 'PLAY_STORE');

-- CreateEnum
CREATE TYPE "PaymentEventType" AS ENUM ('INITIAL_PURCHASE', 'RENEWAL', 'CANCELLATION', 'REFUND', 'BILLING_ISSUE');

-- CreateEnum
CREATE TYPE "DevicePlatform" AS ENUM ('IOS', 'ANDROID');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "clerk_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "display_name" TEXT,
    "region" "Region" NOT NULL DEFAULT 'OTHER',
    "timezone" TEXT NOT NULL,
    "goal" "Goal" NOT NULL,
    "heightCm" DOUBLE PRECISION NOT NULL,
    "starting_weight_kg" DOUBLE PRECISION NOT NULL,
    "target_weight_kg" DOUBLE PRECISION,
    "activity_level" "ActivityLevel" NOT NULL,
    "current_weight_kg" DOUBLE PRECISION,
    "current_weight_updated_at" TIMESTAMP(3),
    "daily_calorie_target" INTEGER,
    "daily_protein_target_g" INTEGER,
    "daily_carbs_target_g" INTEGER,
    "daily_fat_target_g" INTEGER,
    "onboarding_completed_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "weight_kg" DOUBLE PRECISION NOT NULL,
    "logged_at" TIMESTAMP(3) NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weight_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress_photos" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "angle" "PhotoAngle" NOT NULL,
    "weight_kg_at_capture" DOUBLE PRECISION,
    "is_private" BOOLEAN NOT NULL DEFAULT true,
    "captured_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo_comparisons" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "from_photo_id" TEXT NOT NULL,
    "to_photo_id" TEXT NOT NULL,
    "was_shared" BOOLEAN NOT NULL DEFAULT false,
    "shared_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "photo_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_items" (
    "id" TEXT NOT NULL,
    "source" "FoodSource" NOT NULL,
    "name" TEXT NOT NULL,
    "brand_name" TEXT,
    "barcode_upc" TEXT,
    "preset_slug" TEXT,
    "preset_region" "Region",
    "calories_per_100g" DOUBLE PRECISION NOT NULL,
    "protein_per_100g" DOUBLE PRECISION NOT NULL,
    "carbs_per_100g" DOUBLE PRECISION NOT NULL,
    "fat_per_100g" DOUBLE PRECISION NOT NULL,
    "serving_size_g" DOUBLE PRECISION,
    "verified_source" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "food_item_id" TEXT,
    "portion_grams" DOUBLE PRECISION NOT NULL,
    "calories_logged" DOUBLE PRECISION NOT NULL,
    "protein_logged_g" DOUBLE PRECISION NOT NULL,
    "carbs_logged_g" DOUBLE PRECISION NOT NULL,
    "fat_logged_g" DOUBLE PRECISION NOT NULL,
    "meal_slot" "MealSlot" NOT NULL,
    "logged_via" "LoggedVia" NOT NULL,
    "logged_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_food_favorites" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "food_item_id" TEXT NOT NULL,
    "custom_portion_grams" DOUBLE PRECISION,
    "times_logged" INTEGER NOT NULL DEFAULT 1,
    "last_logged_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_food_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_assist_usage" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result_accepted" BOOLEAN,

    CONSTRAINT "ai_assist_usage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streak_states" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "freezes_remaining" INTEGER NOT NULL DEFAULT 2,
    "freezes_reset_at" TIMESTAMP(3) NOT NULL,
    "last_active_local_date" DATE NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "streak_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "streak_milestones" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "streak_length" INTEGER NOT NULL,
    "achieved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comparison_generated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "streak_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "revenuecat_customer_id" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL DEFAULT 'FREE',
    "store" "Store",
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "current_period_end" TIMESTAMP(3),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "revenuecat_event_id" TEXT NOT NULL,
    "event_type" "PaymentEventType" NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "currency" CHAR(3) NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "raw_payload" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exercise_name" TEXT NOT NULL,
    "sets" JSONB NOT NULL,
    "logged_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expo_push_token" TEXT NOT NULL,
    "platform" "DevicePlatform" NOT NULL,
    "last_used_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_id_key" ON "users"("clerk_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "weight_entries_user_id_logged_at_idx" ON "weight_entries"("user_id", "logged_at");

-- CreateIndex
CREATE UNIQUE INDEX "progress_photos_storage_key_key" ON "progress_photos"("storage_key");

-- CreateIndex
CREATE INDEX "progress_photos_user_id_angle_captured_at_idx" ON "progress_photos"("user_id", "angle", "captured_at");

-- CreateIndex
CREATE INDEX "photo_comparisons_user_id_created_at_idx" ON "photo_comparisons"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "food_items_barcode_upc_key" ON "food_items"("barcode_upc");

-- CreateIndex
CREATE UNIQUE INDEX "food_items_preset_slug_key" ON "food_items"("preset_slug");

-- CreateIndex
CREATE INDEX "food_items_source_idx" ON "food_items"("source");

-- CreateIndex
CREATE INDEX "food_logs_user_id_logged_at_idx" ON "food_logs"("user_id", "logged_at");

-- CreateIndex
CREATE INDEX "user_food_favorites_user_id_times_logged_idx" ON "user_food_favorites"("user_id", "times_logged");

-- CreateIndex
CREATE UNIQUE INDEX "user_food_favorites_user_id_food_item_id_key" ON "user_food_favorites"("user_id", "food_item_id");

-- CreateIndex
CREATE INDEX "ai_assist_usage_user_id_used_at_idx" ON "ai_assist_usage"("user_id", "used_at");

-- CreateIndex
CREATE UNIQUE INDEX "streak_states_user_id_key" ON "streak_states"("user_id");

-- CreateIndex
CREATE INDEX "streak_milestones_user_id_achieved_at_idx" ON "streak_milestones"("user_id", "achieved_at");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_id_key" ON "subscriptions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_revenuecat_customer_id_key" ON "subscriptions"("revenuecat_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_revenuecat_event_id_key" ON "payment_transactions"("revenuecat_event_id");

-- CreateIndex
CREATE INDEX "payment_transactions_user_id_occurred_at_idx" ON "payment_transactions"("user_id", "occurred_at");

-- CreateIndex
CREATE INDEX "workout_logs_user_id_logged_at_idx" ON "workout_logs"("user_id", "logged_at");

-- CreateIndex
CREATE UNIQUE INDEX "device_tokens_expo_push_token_key" ON "device_tokens"("expo_push_token");

-- AddForeignKey
ALTER TABLE "weight_entries" ADD CONSTRAINT "weight_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress_photos" ADD CONSTRAINT "progress_photos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_comparisons" ADD CONSTRAINT "photo_comparisons_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_comparisons" ADD CONSTRAINT "photo_comparisons_from_photo_id_fkey" FOREIGN KEY ("from_photo_id") REFERENCES "progress_photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo_comparisons" ADD CONSTRAINT "photo_comparisons_to_photo_id_fkey" FOREIGN KEY ("to_photo_id") REFERENCES "progress_photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_logs" ADD CONSTRAINT "food_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_logs" ADD CONSTRAINT "food_logs_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "food_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_food_favorites" ADD CONSTRAINT "user_food_favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_food_favorites" ADD CONSTRAINT "user_food_favorites_food_item_id_fkey" FOREIGN KEY ("food_item_id") REFERENCES "food_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_assist_usage" ADD CONSTRAINT "ai_assist_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streak_states" ADD CONSTRAINT "streak_states_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "streak_milestones" ADD CONSTRAINT "streak_milestones_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
