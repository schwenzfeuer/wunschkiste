CREATE TYPE "public"."owner_visibility" AS ENUM('full', 'partial', 'surprise');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('reserved', 'bought');--> statement-breakpoint
ALTER TABLE "wishlists" ADD COLUMN "event_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "wishlists" ADD COLUMN "owner_visibility" "owner_visibility" DEFAULT 'partial' NOT NULL;--> statement-breakpoint
DELETE FROM "reservations";--> statement-breakpoint
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_reserved_by_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "reservations" DROP COLUMN "reserved_by_user_id";--> statement-breakpoint
ALTER TABLE "reservations" DROP COLUMN "reserved_by_name";--> statement-breakpoint
ALTER TABLE "reservations" DROP COLUMN "reserved_at";--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "user_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "status" "reservation_status" DEFAULT 'reserved' NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
