import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthPanel } from "@/components/auth/auth-panel";
import { getSession, safeReturnPath } from "@/lib/session";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false },
};

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const returnTo = safeReturnPath((await searchParams).next);
  if (await getSession()) redirect(returnTo);

  const signInHref =
    returnTo === "/account" ? "/sign-in" : `/sign-in?next=${encodeURIComponent(returnTo)}`;

  return (
    <AuthPanel
      eyebrow="Join Seicho Life"
      title="Create an account"
      description="Save your details for a faster checkout next time."
      footer={
        <>
          Already have an account?{" "}
          <Link href={signInHref} className="link">
            Sign in
          </Link>
        </>
      }
    >
      <SignUpForm returnTo={returnTo} signInHref={signInHref} />
    </AuthPanel>
  );
}
