import type { Metadata } from "next";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Datenschutz",
  robots: { index: true, follow: true },
};

interface PrivacyPageProps {
  params: Promise<{ locale: string }>;
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PrivacyContent />;
}

function PrivacyContent() {
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
          {t("legal.privacy.title")}
        </h1>

        <div className="space-y-8 text-foreground/90">
          <section>
            <h2 className="mb-3 text-xl font-semibold">
              {t("legal.privacy.introTitle")}
            </h2>
            <p className="leading-relaxed">
              {t("legal.privacy.introText")}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">
              {t("legal.privacy.responsibleTitle")}
            </h2>
            <p className="mb-3 leading-relaxed">
              {t("legal.privacy.responsibleText")}
            </p>
            <p>
              {t("legal.privacy.name")}
              <br />
              {t("legal.privacy.street")}
              <br />
              {t("legal.privacy.city")}
              <br />
              E-Mail: {t("legal.privacy.email")}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">
              {t("legal.privacy.dataCollectionTitle")}
            </h2>

            <div className="space-y-6">
              <div>
                <h3 className="mb-2 text-lg font-medium">
                  {t("legal.privacy.cookiesTitle")}
                </h3>
                <p className="leading-relaxed">
                  {t("legal.privacy.cookiesText")}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">
                  {t("legal.privacy.accountTitle")}
                </h3>
                <p className="leading-relaxed">
                  {t("legal.privacy.accountText")}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">
                  {t("legal.privacy.wishlistTitle")}
                </h3>
                <p className="leading-relaxed">
                  {t("legal.privacy.wishlistText")}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">
                  {t("legal.privacy.scrapingTitle")}
                </h3>
                <p className="leading-relaxed">
                  {t("legal.privacy.scrapingText")}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">
                  {t("legal.privacy.affiliateTitle")}
                </h3>
                <p className="leading-relaxed">
                  {t("legal.privacy.affiliateText")}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">
                  {t("legal.privacy.botProtectionTitle")}
                </h3>
                <p className="leading-relaxed">
                  {t("legal.privacy.botProtectionText")}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">
              {t("legal.privacy.hostingTitle")}
            </h2>
            <p className="leading-relaxed">
              {t("legal.privacy.hostingText")}
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold">
              {t("legal.privacy.rightsTitle")}
            </h2>
            <p className="mb-4 leading-relaxed">
              {t("legal.privacy.rightsText")}
            </p>
            <ul className="list-inside list-disc space-y-1 text-foreground/80">
              <li>{t("legal.privacy.rightsListAuskunft")}</li>
              <li>{t("legal.privacy.rightsListBerichtigung")}</li>
              <li>{t("legal.privacy.rightsListLoeschung")}</li>
              <li>{t("legal.privacy.rightsListEinschraenkung")}</li>
              <li>{t("legal.privacy.rightsListWiderspruch")}</li>
              <li>{t("legal.privacy.rightsListPortabilitaet")}</li>
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
