import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { SiteFooter } from "@/components/site-footer";
import "../globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans-value",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif-value",
});

const baseUrl = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = locale === routing.defaultLocale ? "" : `/${locale}`;
  const description =
    locale === "de"
      ? "Erstelle und teile Wunschlisten mit deinen Liebsten. Einfach Produkte hinzufuegen, Link teilen, Doppelkauf vermeiden."
      : "Create and share wishlists with your loved ones. Add products, share the link, avoid duplicate gifts.";

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: "Wunschkiste -- Wunschlisten erstellen und teilen",
      template: "%s - Wunschkiste",
    },
    description,
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
    openGraph: {
      type: "website",
      siteName: "Wunschkiste",
      locale: locale === "de" ? "de_DE" : "en_US",
      title: "Wunschkiste -- Wunschlisten erstellen und teilen",
      description,
      url: `${baseUrl}${path}`,
    },
    twitter: {
      card: "summary_large_image",
      title: "Wunschkiste -- Wunschlisten erstellen und teilen",
      description,
    },
    alternates: {
      canonical: `${baseUrl}${path}`,
      languages: {
        de: `${baseUrl}/`,
        en: `${baseUrl}/en`,
        "x-default": `${baseUrl}/`,
      },
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${dmSans.variable} ${playfair.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider messages={messages}>
            <QueryProvider>
              {children}
              <SiteFooter />
            </QueryProvider>
            <Toaster />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
