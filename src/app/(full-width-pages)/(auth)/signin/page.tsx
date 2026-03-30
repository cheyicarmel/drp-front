import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | DrP — Driven Projects",
  description: "Connectez-vous à votre espace DrP.",
};

export default function SignIn() {
  return <SignInForm />;
}