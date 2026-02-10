import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { ajAuth } from "@/lib/security/arcjet";

const handler = toNextJsHandler(auth);

export const GET = handler.GET;

export async function POST(request: NextRequest): Promise<Response> {
  if (ajAuth) {
    const decision = await ajAuth.protect(request, { requested: 1 });
    if (decision.isDenied()) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }
  }

  return handler.POST(request);
}
