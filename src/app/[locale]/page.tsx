import Link from "next/link";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Share2, CheckCircle, Sparkles } from "lucide-react";

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
    { emoji: "🎂", label: "Geburtstag", theme: "birthday" },
    { emoji: "🎄", label: "Weihnachten", theme: "christmas" },
    { emoji: "💒", label: "Hochzeit", theme: "wedding" },
    { emoji: "👶", label: "Baby", theme: "baby" },
  ];

  const features = [
    {
      icon: Gift,
      title: "Einfach erstellen",
      description: "Link einfügen - fertig! Produktdaten werden automatisch geladen.",
    },
    {
      icon: Share2,
      title: "Link teilen",
      description: "Teile deine Liste mit Familie und Freunden - ohne Account.",
    },
    {
      icon: CheckCircle,
      title: "Reservieren",
      description: "Gäste reservieren Wünsche - keine doppelten Geschenke mehr.",
    },
  ];

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/10" />
        <div className="container relative mx-auto px-4 py-20 md:py-32">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 text-7xl md:text-8xl">🎁</div>
            <h1 className="text-5xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Wunschkiste
            </h1>
            <p className="mt-6 max-w-2xl text-xl text-muted-foreground md:text-2xl">
              Erstelle Wunschlisten für jeden Anlass und teile sie mit deinen Liebsten
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link href="/register">
                <Button size="lg" className="h-14 rounded-full px-10 text-lg shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Kostenlos starten
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="h-14 rounded-full border-2 px-10 text-lg"
                >
                  {t("auth.login")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Occasions */}
      <section className="border-y bg-muted/30 py-12">
        <div className="container mx-auto px-4">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Für jeden Anlass das passende Theme
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {occasions.map((occasion) => (
              <div
                key={occasion.theme}
                className="flex items-center gap-2 rounded-full bg-background px-5 py-3 shadow-sm transition-transform hover:scale-105"
              >
                <span className="text-2xl">{occasion.emoji}</span>
                <span className="font-medium">{occasion.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-4 text-center text-3xl font-bold md:text-4xl">
            So einfach geht&apos;s
          </h2>
          <p className="mx-auto mb-12 max-w-xl text-center text-lg text-muted-foreground">
            In drei Schritten zur perfekten Wunschliste
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-background to-muted/50 shadow-lg transition-all hover:shadow-xl">
                <CardContent className="p-8">
                  <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <feature.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-gradient-to-br from-primary/5 to-secondary/10 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Bereit für deine erste Wunschliste?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-muted-foreground">
            Kostenlos, ohne Werbung, für immer.
          </p>
          <Link href="/register">
            <Button size="lg" className="h-14 rounded-full px-10 text-lg shadow-lg">
              Jetzt loslegen
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <p className="mb-4 text-center text-sm text-muted-foreground">
            {t("footer.affiliateDisclosure")}
          </p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="/impressum" className="text-muted-foreground hover:text-foreground hover:underline">
              {t("footer.imprint")}
            </Link>
            <Link href="/datenschutz" className="text-muted-foreground hover:text-foreground hover:underline">
              {t("footer.privacy")}
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
