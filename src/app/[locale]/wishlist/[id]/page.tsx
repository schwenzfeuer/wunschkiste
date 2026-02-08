import type { Metadata } from "next";
import WishlistEditor from "./wishlist-editor";

export const metadata: Metadata = {
  title: "Wunschkiste bearbeiten",
  robots: { index: false, follow: false },
};

interface WishlistPageProps {
  params: Promise<{ id: string }>;
}

export default async function WishlistPage({ params }: WishlistPageProps) {
  const { id } = await params;
  return <WishlistEditor id={id} />;
}
