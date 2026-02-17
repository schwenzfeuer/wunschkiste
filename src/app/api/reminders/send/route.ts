import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte, lte, inArray } from "drizzle-orm";
import { db, wishlists, savedWishlists, reservations, products, users, sentReminders } from "@/lib/db";
import { sendReminderEmail } from "@/lib/email";
import type { ReminderType } from "@/lib/db";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronKey = process.env.CRON_API_KEY;

  if (!cronKey || !authHeader || authHeader !== `Bearer ${cronKey}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const results: { sent: number; skipped: number; errors: number } = {
    sent: 0,
    skipped: 0,
    errors: 0,
  };

  const windows: { days: number; reminderType: ReminderType }[] = [
    { days: 7, reminderType: "7_days" },
    { days: 3, reminderType: "3_days" },
  ];

  for (const { days, reminderType } of windows) {
    const targetDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const toleranceMs = 12 * 60 * 60 * 1000;
    const windowStart = new Date(targetDate.getTime() - toleranceMs);
    const windowEnd = new Date(targetDate.getTime() + toleranceMs);

    const matchingWishlists = await db
      .select({
        id: wishlists.id,
        title: wishlists.title,
        eventDate: wishlists.eventDate,
        shareToken: wishlists.shareToken,
        ownerId: wishlists.userId,
      })
      .from(wishlists)
      .where(
        and(
          eq(wishlists.isPublic, true),
          gte(wishlists.eventDate, windowStart),
          lte(wishlists.eventDate, windowEnd)
        )
      );

    for (const wishlist of matchingWishlists) {
      const joinedBefore = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const participants = await db
        .select({
          userId: savedWishlists.userId,
          email: users.email,
        })
        .from(savedWishlists)
        .innerJoin(users, eq(users.id, savedWishlists.userId))
        .where(
          and(
            eq(savedWishlists.wishlistId, wishlist.id),
            lte(savedWishlists.createdAt, joinedBefore)
          )
        );

      const nonOwnerParticipants = participants.filter(
        (p) => p.userId !== wishlist.ownerId
      );

      if (nonOwnerParticipants.length === 0) continue;

      const wishlistProducts = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.wishlistId, wishlist.id));

      const productIds = wishlistProducts.map((p) => p.id);

      const boughtByUser: Set<string> = new Set();
      if (productIds.length > 0) {
        const boughtReservations = await db
          .select({ userId: reservations.userId })
          .from(reservations)
          .where(
            and(
              inArray(reservations.productId, productIds),
              eq(reservations.status, "bought")
            )
          );
        for (const r of boughtReservations) {
          boughtByUser.add(r.userId);
        }
      }

      const allReservationProductIds: Set<string> = new Set();
      if (productIds.length > 0) {
        const allReservations = await db
          .select({ productId: reservations.productId })
          .from(reservations)
          .where(inArray(reservations.productId, productIds));
        for (const r of allReservations) {
          allReservationProductIds.add(r.productId);
        }
      }
      const openWishesCount = productIds.length - allReservationProductIds.size;

      const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";
      const shareUrl = `${baseUrl}/teilen/${wishlist.shareToken}`;

      const actualDaysLeft = Math.ceil(
        (wishlist.eventDate!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
      );

      for (const participant of nonOwnerParticipants) {
        if (boughtByUser.has(participant.userId)) {
          results.skipped++;
          continue;
        }

        const inserted = await db
          .insert(sentReminders)
          .values({
            userId: participant.userId,
            wishlistId: wishlist.id,
            reminderType,
          })
          .onConflictDoNothing()
          .returning({ id: sentReminders.id });

        if (inserted.length === 0) {
          results.skipped++;
          continue;
        }

        try {
          await sendReminderEmail({
            to: participant.email,
            wishlistTitle: wishlist.title,
            eventDate: wishlist.eventDate!,
            daysLeft: actualDaysLeft,
            openWishesCount,
            shareUrl,
          });
          results.sent++;
        } catch {
          results.errors++;
        }
      }
    }
  }

  return NextResponse.json(results);
}
