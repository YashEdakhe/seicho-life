import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth/auth-panel";
import { getSession, safeReturnPath } from "@/lib/session";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false },
};

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const returnTo = safeReturnPath((await searchParams).next);
  if (await getSession()) redirect(returnTo);

  const signUpHref =
    returnTo === "/account" ? "/sign-up" : `/sign-up?next=${encodeURIComponent(returnTo)}`;

  return (
    <AuthPanel
      eyebrow="Welcome back"
      title="Sign in"
      description="Sign in to see your account."
      footer={
        <>
          New to Seicho Life?{" "}
          <Link href={signUpHref} className="link">
            Create an account
          </Link>
        </>
      }
    >
      <SignInForm returnTo={returnTo} />
    </AuthPanel>
  );
}
