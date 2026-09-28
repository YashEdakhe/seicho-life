"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  AuthField,
  callAuth,
  FormAlert,
  PasswordField,
  SubmitButton,
  useFieldValidation,
} from "@/components/auth/auth-form";
import { authClient } from "@/lib/auth-client";
import { validateEmail, validatePasswordPresent } from "@/lib/auth-validation";

/** Email + password sign-in. `returnTo` is already validated server-side. */
export function SignInForm({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { fieldProps, validateAll } = useFieldValidation({
    email: validateEmail,
    password: validatePasswordPresent,
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const values = validateAll(event.currentTarget);
    if (!values) return;

    setPending(true);
    const { error } = await callAuth(() =>
      authClient.signIn.email({ email: values.email.trim(), password: values.password }),
    );

    if (error) {
      setPending(false);
      setFormError(
        error.status === 429
          ? "Too many sign-in attempts. Please wait a minute and try again."
          : error.status === 0
            ? "We couldn't reach the server. Check your connection and try again."
            : // One message for unknown email and wrong password, so accounts can't be probed.
              "That email and password don't match. Check them and try again.",
      );
      return;
    }
    // Stay in the loading state while the next page loads.
    router.replace(returnTo);
    router.refresh();
  }

  return (
    // POST + noValidate: our own messages replace the browser's, and a submit before
    // hydration never puts credentials in the URL (CWE-598).
    <form method="post" noValidate onSubmit={onSubmit} aria-busy={pending}>
      <fieldset disabled={pending} className="flex flex-col gap-5">
        <FormAlert>{formError}</FormAlert>
        <AuthField
          id="email"
          type="email"
          label="Email"
          autoComplete="email"
          inputMode="email"
          autoFocus
          required
          {...fieldProps("email")}
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="current-password"
          required
          {...fieldProps("password")}
        />
        <SubmitButton pending={pending} label="Sign in" pendingLabel="Signing in…" />
      </fieldset>
    </form>
  );
}
