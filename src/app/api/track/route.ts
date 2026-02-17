import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db, analyticsEvents } from "@/lib/db";
import { ajTrack } from "@/lib/security/arcjet";

const trackSchema = z.object({
  eventType: z.string().min(1).max(50),
  metadata: z.record(z.string(), z.string()).optional(),
  pagePath: z.string().max(500).optional(),
  referrer: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (ajTrack) {
    const decision = await ajTrack.protect(request, { requested: 1 });
    if (decision.isDenied()) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const country = request.headers.get("CF-IPCountry") || undefined;

  await db.insert(analyticsEvents).values({
    eventType: parsed.data.eventType,
    metadata: parsed.data.metadata,
    pagePath: parsed.data.pagePath,
    referrer: parsed.data.referrer,
    country,
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
