import type { Metadata } from "next";
import NewWishlistForm from "./new-wishlist-form";

export const metadata: Metadata = {
  title: "Neue Wunschkiste",
  robots: { index: false, follow: false },
};

export default function NewWishlistPage() {
  return <NewWishlistForm />;
}
