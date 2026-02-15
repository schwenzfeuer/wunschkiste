import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { LandingNav } from "@/components/landing-nav";
import { HeroCta } from "@/components/hero-cta";
import { ArrowDown } from "lucide-react";
import { WunschkisteLogo } from "@/components/wunschkiste-logo";
import { PhonePair } from "@/components/phone-mockup";
import { ConnectedParticipants } from "@/components/connected-participants";

const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "Wunschkiste",
        url: baseUrl,
        description: "Wunschlisten erstellen und teilen",
      },
      {
        "@type": "Organization",
        name: "Wunschkiste",
        url: baseUrl,
        logo: `${baseUrl}/favicon.svg`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeContent />
    </>
  );
}

const features = [
  {
    key: "collect" as const,
    frontSrc: "/screenshots/collect-front.webp",
    backSrc: "/screenshots/collect-back.webp",
    frontAlt: "Wunsch hinzufuegen Dialog",
    backAlt: "Wunschliste mit Produkten",
  },
];

function HomeContent() {
  const t = useTranslations();

  return (
    <main className="min-h-screen">
      {/* Nav */}
      <LandingNav />

      {/* Hero */}
      <section className="flex min-h-[85vh] flex-col items-center justify-center px-4 pt-20 sm:min-h-screen sm:px-6 sm:pt-16">
        <div className="mx-auto max-w-3xl text-center">
          <WunschkisteLogo className="mx-auto mb-6 size-32 text-primary sm:hidden" />
          <h1 className="font-serif text-4xl leading-tight tracking-tight md:text-7xl md:leading-tight">
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
      <section id="problem" className="px-4 py-16 sm:px-6 sm:py-24 md:py-32">
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
            <div className="mt-8 flex justify-center md:hidden">
              <a href="#solution">
                <Button variant="outline" size="lg">
                  <ArrowDown className="size-4" />
                  {t("landing.nextShare")}
                </Button>
              </a>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Solution + Share (merged) */}
      <section id="solution" className="px-4 py-16 sm:px-6 sm:py-24 md:py-32">
        <AnimateOnScroll>
          <div className="mx-auto grid max-w-5xl items-center gap-12 md:grid-cols-2 md:gap-12">
            <div className="md:order-1">
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
            <div className="md:order-2">
              <ConnectedParticipants />
            </div>
          </div>
          <div className="mt-10 flex justify-center md:hidden">
            <a href="#collect">
              <Button variant="outline" size="lg">
                <ArrowDown className="size-4" />
                {t("landing.nextCollect")}
              </Button>
            </a>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Features with images */}
      {features.map((feature, index) => {
        const textFirst = index % 2 === 0;

        return (
          <section
            key={feature.key}
            id={feature.key}
            className="px-4 py-16 sm:px-6 sm:py-24 md:py-32"
          >
            <AnimateOnScroll>
              <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2 md:gap-12">
                {/* Text */}
                <div className={textFirst ? "md:order-1" : "md:order-2"}>
                  <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                    {t(`landing.features.${feature.key}.label`)}
                  </span>
                  <h2 className="mt-4 font-serif text-3xl leading-snug md:text-4xl md:leading-snug">
                    {t(`landing.features.${feature.key}.title`)}
                  </h2>
                  <p className="mt-6 text-lg leading-relaxed text-foreground/60">
                    {t(`landing.features.${feature.key}.text`)}
                  </p>
                </div>

                {/* Phone Pair */}
                <div className={textFirst ? "md:order-2" : "md:order-1"}>
                  <PhonePair
                    frontSrc={feature.frontSrc}
                    backSrc={feature.backSrc}
                    frontAlt={feature.frontAlt}
                    backAlt={feature.backAlt}
                  />
                </div>
              </div>
              <div className="mt-10 flex justify-center md:hidden">
                <a href="#manage">
                  <Button variant="outline" size="lg">
                    <ArrowDown className="size-4" />
                    {t("landing.nextManage")}
                  </Button>
                </a>
              </div>
            </AnimateOnScroll>
          </section>
        );
      })}

      {/* Manage (text-only) */}
      <section id="manage" className="px-4 py-16 sm:px-6 sm:py-24 md:py-32">
        <AnimateOnScroll>
          <div className="mx-auto max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent">
              {t("landing.features.manage.label")}
            </span>
            <h2 className="mt-4 font-serif text-3xl leading-snug md:text-5xl md:leading-snug">
              {t("landing.features.manage.title")}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-foreground/60">
              {t("landing.features.manage.text")}
            </p>
          </div>
        </AnimateOnScroll>
      </section>

      {/* CTA */}
      <section className="px-4 py-16 sm:px-6 sm:py-24 md:py-32">
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
