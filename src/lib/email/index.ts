import { Resend } from "resend";

const FROM = "Wunschkiste <noreply@wunschkiste.app>";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

function getBaseUrl() {
  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
}

const LOGO_URL_LIGHT = "https://wunschkiste.app/wunschkiste-logo.svg";
const LOGO_URL_DARK = "https://wunschkiste.app/wunschkiste-logo-dark.svg";
const WORDMARK_URL = "https://wunschkiste.app/wunschkiste-wordmark.svg";

function emailLayout(content: string, footerText: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet"></head>
<body style="margin: 0; padding: 0; background-color: #FEF1D0; font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 480px; margin: 0 auto; padding: 40px 20px;">
    <div style="text-align: center; margin-bottom: 32px;">
      <a href="${getBaseUrl()}" style="text-decoration: none;">
        <img src="${LOGO_URL_LIGHT}" alt="Wunschkiste" width="64" height="64" style="display: inline-block; vertical-align: middle;" />
        <img src="${WORDMARK_URL}" alt="Wunschkiste" height="28" style="display: inline-block; vertical-align: middle; margin-left: 8px;" />
      </a>
    </div>
    <div style="background: #FFFFFF; border-radius: 16px; border: 2px solid #E8DFC0; padding: 32px; margin-bottom: 24px;">
      ${content}
    </div>
    <p style="color: #6B7A99; font-size: 12px; line-height: 1.5; text-align: center; margin: 0;">
      ${footerText}
    </p>
  </div>
</body>
</html>`;
}

function ctaButton(href: string, label: string, variant: "primary" | "accent" = "primary") {
  const bg = variant === "accent" ? "#FF8C42" : "#0042AF";
  return `
    <div style="text-align: center; margin: 24px 0 8px;">
      <a href="${href}" style="display: inline-block; background: ${bg}; color: #FFFFFF; padding: 14px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 15px; border: 2px solid #000000; box-shadow: 0 4px 0 0 #000000; mso-padding-alt: 0;">
        ${label}
      </a>
    </div>`;
}

export async function sendReminderEmail(opts: {
  to: string;
  wishlistTitle: string;
  eventDate: Date;
  daysLeft: number;
  openWishesCount: number;
  shareUrl: string;
}) {
  const { to, wishlistTitle, eventDate, daysLeft, openWishesCount, shareUrl } = opts;

  const formattedDate = eventDate.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const subject = daysLeft <= 3
    ? `Nur noch ${daysLeft} Tage: ${wishlistTitle}`
    : `Erinnerung: ${wishlistTitle} in ${daysLeft} Tagen`;

  const urgencyColor = daysLeft <= 3 ? "#DC2626" : "#FF8C42";

  const content = `
    <h1 style="font-size: 22px; color: #0042AF; margin: 0 0 8px; font-family: 'Playfair Display', Georgia, serif;">${wishlistTitle}</h1>
    <p style="display: inline-block; background: ${urgencyColor}; color: #FFFFFF; font-size: 13px; font-weight: 600; padding: 4px 12px; border-radius: 50px; margin: 0 0 20px;">
      Noch ${daysLeft} Tage -- ${formattedDate}
    </p>
    <p style="color: #555; line-height: 1.6; margin: 0 0 8px;">
      Es gibt noch <strong>${openWishesCount}</strong> offene ${openWishesCount === 1 ? "Wunsch" : "Wuensche"} auf der Wunschkiste.
    </p>
    <p style="color: #555; line-height: 1.6; margin: 0;">
      Schau vorbei und sichere dir einen Wunsch, bevor es zu spaet ist!
    </p>
    ${ctaButton(shareUrl, "Wunschkiste ansehen", "accent")}`;

  const footer = "Du erhaeltst diese E-Mail, weil du an einer geteilten Wunschkiste teilnimmst.";

  await getResend().emails.send({
    from: FROM,
    to,
    subject,
    html: emailLayout(content, footer),
  });
}

export async function sendWelcomeEmail(to: string, name: string) {
  const firstName = name.split(" ")[0] || name;
  const dashboardUrl = `${getBaseUrl()}/dashboard`;

  const content = `
    <h1 style="font-size: 22px; color: #0042AF; margin: 0 0 16px; font-family: 'Playfair Display', Georgia, serif;">Willkommen, ${firstName}!</h1>
    <p style="color: #555; line-height: 1.6; margin: 0 0 4px;">
      Schoen, dass du dabei bist! Mit Wunschkiste kannst du Wunschlisten erstellen und mit Familie und Freunden teilen.
    </p>
    ${ctaButton(dashboardUrl, "Erste Wunschkiste erstellen", "accent")}`;

  const footer = "Du erhaeltst diese E-Mail, weil du dich bei Wunschkiste registriert hast.";

  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Willkommen bei Wunschkiste",
    html: emailLayout(content, footer),
  });
}

export async function sendPasswordResetEmail(to: string, url: string) {
  const content = `
    <h1 style="font-size: 22px; color: #0042AF; margin: 0 0 16px; font-family: 'Playfair Display', Georgia, serif;">Passwort zuruecksetzen</h1>
    <p style="color: #555; line-height: 1.6; margin: 0 0 4px;">
      Du hast angefordert, dein Passwort zurueckzusetzen. Klicke auf den Button um ein neues Passwort zu vergeben.
    </p>
    ${ctaButton(url, "Neues Passwort vergeben")}
    <p style="color: #6B7A99; font-size: 13px; line-height: 1.5; margin: 8px 0 0;">
      Der Link ist 1 Stunde gueltig.
    </p>`;

  const footer = "Falls du kein neues Passwort angefordert hast, kannst du diese E-Mail ignorieren.";

  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Passwort zuruecksetzen",
    html: emailLayout(content, footer),
  });
}
