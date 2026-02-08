import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { MainNav } from "@/components/main-nav";
import { HeroCta } from "@/components/hero-cta";
import { Link2, Users, Palette, ArrowDown } from "lucide-react";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <HomeContent />;
}

function HomeContent() {
  const t = useTranslations();

  const occasions = [
    { emoji: "🎂", label: t("wishlist.themes.birthday"), theme: "birthday" },
    { emoji: "🎄", label: t("wishlist.themes.christmas"), theme: "christmas" },
  ];

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <MainNav />

      {/* Hero */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-serif text-5xl leading-tight tracking-tight md:text-7xl md:leading-tight">
            {t("landing.hero.title")}
            <br />
            <span className="text-accent">{t("landing.hero.titleAccent")}</span>
          </h1>
          <p className="mx-auto mt-8 max-w-lg text-lg text-foreground/60">
            {t("landing.hero.subtitle")}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <HeroCta
              ctaNew={t("landing.hero.cta")}
              ctaExisting={t("nav.myWishlists")}
            />
            <a href="#problem">
              <Button variant="outline" size="lg">
                <ArrowDown className="size-4" />
                {t("landing.hero.ctaSecondary")}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="px-6 py-24 md:py-32">
        <AnimateOnScroll>
          <div className="mx-auto max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              {t("landing.problem.label")}
            </span>
            <h2 className="mt-4 font-serif text-3xl leading-snug md:text-5xl md:leading-snug">
              {t("landing.problem.title")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-foreground/60">
              {t("landing.problem.text")}
            </p>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Solution */}
      <section className="px-6 py-24 md:py-32">
        <AnimateOnScroll>
          <div className="mx-auto max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              {t("landing.solution.label")}
            </span>
            <h2 className="mt-4 font-serif text-3xl leading-snug md:text-5xl md:leading-snug">
              {t("landing.solution.title")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-foreground/60">
              {t("landing.solution.text")}
            </p>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Feature: Auto-Erkennung */}
      <section className="px-6 py-24 md:py-32">
        <AnimateOnScroll>
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Link2 className="size-7 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              {t("landing.features.scraper.label")}
            </span>
            <h2 className="mt-4 font-serif text-3xl leading-snug md:text-4xl md:leading-snug">
              {t("landing.features.scraper.title")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-foreground/60">
              {t("landing.features.scraper.text")}
            </p>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Feature: Teilen & Reservieren */}
      <section className="px-6 py-24 md:py-32">
        <AnimateOnScroll>
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Users className="size-7 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              {t("landing.features.share.label")}
            </span>
            <h2 className="mt-4 font-serif text-3xl leading-snug md:text-4xl md:leading-snug">
              {t("landing.features.share.title")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-foreground/60">
              {t("landing.features.share.text")}
            </p>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Feature: Anlässe/Themes */}
      <section className="px-6 py-24 md:py-32">
        <AnimateOnScroll>
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <Palette className="size-7 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              {t("landing.features.themes.label")}
            </span>
            <h2 className="mt-4 font-serif text-3xl leading-snug md:text-4xl md:leading-snug">
              {t("landing.features.themes.title")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-foreground/60">
              {t("landing.features.themes.text")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {occasions.map((occasion) => (
                <span
                  key={occasion.theme}
                  className="inline-flex items-center gap-2 rounded-full border-2 border-border bg-card px-5 py-2.5 text-sm font-medium"
                >
                  <span className="text-lg">{occasion.emoji}</span>
                  {occasion.label}
                </span>
              ))}
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* CTA */}
      <section className="px-6 py-24 md:py-32">
        <AnimateOnScroll>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl leading-snug md:text-5xl md:leading-snug">
              {t("landing.cta.title")}
            </h2>
            <p className="mt-6 text-lg text-foreground/60">
              {t("landing.cta.text")}
            </p>
            <div className="mt-10">
              <HeroCta
                ctaNew={t("landing.cta.button")}
                ctaExisting={t("nav.myWishlists")}
              />
            </div>
          </div>
        </AnimateOnScroll>
      </section>

    </main>
  );
}
