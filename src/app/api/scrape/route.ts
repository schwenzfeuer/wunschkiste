import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { extractProductData } from "@/lib/scraper";
import { ajScrape } from "@/lib/security/arcjet";

const scrapeSchema = z.object({
  url: z.string().url(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (ajScrape) {
    const decision = await ajScrape.protect(request, { requested: 1 });
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }
  }

  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = scrapeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const productData = await extractProductData(parsed.data.url);

  return NextResponse.json(productData);
}
