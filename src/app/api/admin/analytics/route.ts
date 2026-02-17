import { NextRequest, NextResponse } from "next/server";
import { sql, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, analyticsEvents, users, wishlists, products } from "@/lib/db";

function isAdmin(email: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  return !!adminEmail && email === adminEmail;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const period = request.nextUrl.searchParams.get("period") || "30d";
  const daysMap: Record<string, number | null> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "all": null,
  };
  const days = daysMap[period] ?? 30;

  const dateFilter = days
    ? sql`${analyticsEvents.createdAt} >= now() - interval '1 day' * ${days}`
    : sql`true`;

  const [totalUsersResult] = await db.select({ count: count() }).from(users);
  const [totalWishlistsResult] = await db.select({ count: count() }).from(wishlists);
  const [totalProductsResult] = await db.select({ count: count() }).from(products);

  const [totalAffiliateClicksResult] = await db
    .select({ count: count() })
    .from(analyticsEvents)
    .where(sql`${analyticsEvents.eventType} = 'affiliate_click' AND ${dateFilter}`);

  const [totalShareViewsResult] = await db
    .select({ count: count() })
    .from(analyticsEvents)
    .where(sql`${analyticsEvents.eventType} = 'page_view' AND ${dateFilter}`);

  const dailyEvents = await db.execute(sql`
    SELECT
      to_char(${analyticsEvents.createdAt}::date, 'YYYY-MM-DD') as date,
      ${analyticsEvents.eventType} as event_type,
      cast(count(*) as int) as count
    FROM ${analyticsEvents}
    WHERE ${dateFilter}
    GROUP BY ${analyticsEvents.createdAt}::date, ${analyticsEvents.eventType}
    ORDER BY date
  `);

  const dailyMap = new Map<string, Record<string, number>>();
  for (const row of dailyEvents.rows as { date: string; event_type: string; count: number }[]) {
    if (!dailyMap.has(row.date)) {
      dailyMap.set(row.date, { date: row.date } as unknown as Record<string, number>);
    }
    dailyMap.get(row.date)![row.event_type] = row.count;
  }

  const topShops = await db.execute(sql`
    SELECT
      metadata->>'shop' as shop,
      cast(count(*) as int) as clicks
    FROM ${analyticsEvents}
    WHERE ${analyticsEvents.eventType} = 'affiliate_click'
      AND metadata->>'shop' IS NOT NULL
      AND ${dateFilter}
    GROUP BY metadata->>'shop'
    ORDER BY clicks DESC
    LIMIT 10
  `);

  const countries = await db.execute(sql`
    SELECT
      ${analyticsEvents.country} as country,
      cast(count(*) as int) as count
    FROM ${analyticsEvents}
    WHERE ${analyticsEvents.country} IS NOT NULL
      AND ${dateFilter}
    GROUP BY ${analyticsEvents.country}
    ORDER BY count DESC
    LIMIT 20
  `);

  return NextResponse.json({
    summary: {
      totalUsers: totalUsersResult.count,
      totalWishlists: totalWishlistsResult.count,
      totalProducts: totalProductsResult.count,
      totalAffiliateClicks: totalAffiliateClicksResult.count,
      totalShareViews: totalShareViewsResult.count,
    },
    dailyEvents: Array.from(dailyMap.values()),
    topShops: topShops.rows,
    countries: countries.rows,
  });
}
