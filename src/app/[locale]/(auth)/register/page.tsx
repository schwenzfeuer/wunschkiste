import type { Metadata } from "next";
import RegisterForm from "./register-form";

export const metadata: Metadata = {
  title: "Registrieren",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return <RegisterForm />;
}
