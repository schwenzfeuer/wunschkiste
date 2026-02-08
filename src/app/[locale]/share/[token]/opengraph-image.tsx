import { ImageResponse } from "next/og";
import { eq, count } from "drizzle-orm";
import { db, wishlists, products, users } from "@/lib/db";

export const runtime = "nodejs";
export const alt = "Wunschkiste";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [wishlist] = await db
    .select({
      title: wishlists.title,
      ownerName: users.name,
    })
    .from(wishlists)
    .innerJoin(users, eq(users.id, wishlists.userId))
    .where(eq(wishlists.shareToken, token));

  const [productCount] = await db
    .select({ count: count() })
    .from(products)
    .innerJoin(wishlists, eq(wishlists.id, products.wishlistId))
    .where(eq(wishlists.shareToken, token));

  const title = wishlist?.title || "Wunschliste";
  const ownerName = wishlist?.ownerName || "";
  const wishCount = productCount?.count ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FEF1D0",
          fontFamily: "serif",
          padding: "60px",
        }}
      >
        <div
          style={{
            fontSize: "24px",
            color: "#0042AF",
            opacity: 0.5,
            marginBottom: "16px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Wunschkiste
        </div>
        <div
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#0042AF",
            textAlign: "center",
            lineHeight: 1.2,
            marginBottom: "24px",
            maxWidth: "900px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </div>
        {ownerName && (
          <div
            style={{
              fontSize: "28px",
              color: "#0042AF",
              opacity: 0.6,
              marginBottom: "12px",
            }}
          >
            von {ownerName}
          </div>
        )}
        {wishCount > 0 && (
          <div
            style={{
              fontSize: "22px",
              color: "#FF8C42",
              fontWeight: 600,
            }}
          >
            {wishCount} {wishCount === 1 ? "Wunsch" : "Wuensche"}
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
