import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Impressum",
  robots: { index: true, follow: true },
};

interface ImprintPageProps {
  params: Promise<{ locale: string }>;
}

export default async function ImprintPage({ params }: ImprintPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ImprintContent />;
}

function ImprintContent() {
  const t = useTranslations();

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-3xl px-4 py-12 md:py-20">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("legal.backToHome")}
        </Link>

        <h1 className="mb-10 text-4xl font-bold tracking-tight">
          {t("legal.imprint.title")}
        </h1>

        <div className="space-y-8 text-foreground/90">
          <section>
            <h2 className="mb-3 text-xl font-semibold">
              {t("legal.imprint.responsibleTitle")}
            </h2>
            <p>
              {t("legal.imprint.name")}
              <br />
              {t("legal.imprint.street")}
              <br />
              {t("legal.imprint.city")}
              <br />
              {t("legal.imprint.country")}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">
              {t("legal.imprint.contactTitle")}
            </h2>
            <p>
              E-Mail: {t("legal.imprint.email")}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">
              {t("legal.imprint.disputeTitle")}
            </h2>
            <p className="leading-relaxed">
              {t("legal.imprint.disputeText")}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">
              {t("legal.imprint.liabilityTitle")}
            </h2>
            <p className="leading-relaxed">
              {t("legal.imprint.liabilityText")}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">
              {t("legal.imprint.liabilityLinksTitle")}
            </h2>
            <p className="leading-relaxed">
              {t("legal.imprint.liabilityLinksText")}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
