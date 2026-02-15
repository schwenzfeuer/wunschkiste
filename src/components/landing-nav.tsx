import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { BrandLogo } from "@/components/brand-logo";
import { NavAuthSection } from "@/components/nav-auth-section";

export function LandingNav() {
  const t = useTranslations("nav");

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="flex items-center">
          <BrandLogo size="sm" hideIcon className="sm:hidden" />
          <BrandLogo size="sm" className="hidden sm:flex" />
        </Link>
        <NavAuthSection
          loginLabel={t("login")}
          getStartedLabel={t("getStarted")}
          myWishlistsLabel={t("myWishlists")}
        />
      </div>
    </nav>
  );
}
