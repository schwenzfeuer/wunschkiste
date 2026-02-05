import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Wunschkiste
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Erstelle und teile Wunschlisten mit deinen Liebsten
          </p>
          <div className="mt-8 flex gap-4">
            <Button size="lg" className="rounded-full px-8">
              {t("wishlist.create")}
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-2 px-8"
            >
              {t("auth.login")}
            </Button>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle>Einfach erstellen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Erstelle in Sekunden eine Wunschliste und füge Produkte per Link hinzu.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle>Link teilen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Teile deine Wunschliste mit Familie und Freunden - kein Account nötig.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-md">
            <CardHeader>
              <CardTitle>Reservieren</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Gäste können Wünsche reservieren - keine doppelten Geschenke mehr.
              </p>
            </CardContent>
          </Card>
        </div>

        <footer className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>{t("footer.affiliateDisclosure")}</p>
          <div className="mt-4 flex justify-center gap-4">
            <a href="/impressum" className="hover:underline">
              {t("footer.imprint")}
            </a>
            <a href="/datenschutz" className="hover:underline">
              {t("footer.privacy")}
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
