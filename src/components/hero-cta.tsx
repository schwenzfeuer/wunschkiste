import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { HeroCtaUpgrade } from "@/components/hero-cta-upgrade";

interface HeroCtaProps {
  ctaNew: string;
  ctaExisting: string;
}

export function HeroCta({ ctaNew, ctaExisting }: HeroCtaProps) {
  return (
    <HeroCtaUpgrade ctaExisting={ctaExisting}>
      <Link href="/register">
        <Button variant="accent" size="xl">
          {ctaNew}
        </Button>
      </Link>
    </HeroCtaUpgrade>
  );
}
