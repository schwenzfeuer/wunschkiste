import { Resend } from "resend";

const FROM = "Wunschkiste <noreply@wunschkiste.app>";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return new Resend(key);
}

export async function sendPasswordResetEmail(to: string, url: string) {
  await getResend().emails.send({
    from: FROM,
    to,
    subject: "Passwort zurücksetzen",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h1 style="font-size: 24px; color: #0042AF;">Passwort zurücksetzen</h1>
        <p style="color: #555; line-height: 1.6;">
          Du hast angefordert, dein Passwort zurückzusetzen. Klicke auf den Button um ein neues Passwort zu vergeben.
        </p>
        <a href="${url}" style="display: inline-block; background: #0042AF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 20px 0;">
          Neues Passwort vergeben
        </a>
        <p style="color: #999; font-size: 13px; line-height: 1.5;">
          Falls du kein neues Passwort angefordert hast, kannst du diese E-Mail ignorieren.
          Der Link ist 1 Stunde gültig.
        </p>
      </div>
    `,
  });
}
