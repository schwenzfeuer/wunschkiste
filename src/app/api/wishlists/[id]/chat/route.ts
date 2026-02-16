import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { eq, and, lt, desc, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, chatMessages } from "@/lib/db";
import { verifyChatAccess } from "@/lib/chat-access";
import { notifyWishlistChat, notifyWishlistRoom } from "@/lib/realtime/notify";

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000).trim(),
});

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await verifyChatAccess(id, session.user.id);
  if (!access.canChat) {
    return NextResponse.json({ error: "No chat access" }, { status: 403 });
  }

  const before = request.nextUrl.searchParams.get("before");
  const limit = 50;

  const conditions = [eq(chatMessages.wishlistId, id)];
  if (before) {
    conditions.push(lt(chatMessages.createdAt, new Date(before)));
  }

  const messages = await db
    .select()
    .from(chatMessages)
    .where(and(...conditions))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit + 1);

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();

  messages.reverse();

  return NextResponse.json({ messages, hasMore });
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await verifyChatAccess(id, session.user.id);
  if (!access.canChat) {
    return NextResponse.json({ error: "No chat access" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = sendMessageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const [message] = await db
    .insert(chatMessages)
    .values({
      wishlistId: id,
      userId: session.user.id,
      userName: session.user.name || "Anonym",
      userImage: session.user.image || null,
      content: parsed.data.content,
    })
    .returning();

  await notifyWishlistChat(id, message);

  return NextResponse.json(message, { status: 201 });
}
