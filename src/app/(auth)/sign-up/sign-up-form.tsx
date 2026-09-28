"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  AuthField,
  callAuth,
  FormAlert,
  PasswordField,
  SubmitButton,
  useFieldValidation,
} from "@/components/auth/auth-form";
import { authClient } from "@/lib/auth-client";
import {
  PASSWORD_MIN_LENGTH,
  validateEmail,
  validateName,
  validateNewPassword,
} from "@/lib/auth-validation";

/** Name, email and password sign-up; signs the customer in on success. */
export function SignUpForm({ returnTo, signInHref }: { returnTo: string; signInHref: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<React.ReactNode>(null);
  const { fieldProps, validateAll, setFieldError } = useFieldValidation({
    name: validateName,
    email: validateEmail,
    password: validateNewPassword,
  });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const values = validateAll(event.currentTarget);
    if (!values) return;

    setPending(true);
    const { error } = await callAuth(() =>
      authClient.signUp.email({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      }),
    );

    if (error) {
      setPending(false);
      const code = error.code ?? "";
      if (code.startsWith("USER_ALREADY_EXISTS")) {
        setFieldError("email", "An account with this email already exists.", formRef.current);
        setFormError(
          <>
            You already have an account.{" "}
            <Link href={signInHref} className="link text-danger">
              Sign in instead
            </Link>
          </>,
        );
      } else if (code === "PASSWORD_TOO_SHORT" || code === "PASSWORD_TOO_LONG") {
        setFieldError("password", validateNewPassword(values.password) ?? "Choose a different password.", formRef.current);
      } else if (code === "INVALID_EMAIL") {
        setFieldError("email", "Enter a valid email address, like name@example.com.", formRef.current);
      } else if (error.status === 429) {
        setFormError("Too many attempts. Please wait a minute and try again.");
      } else if (error.status === 0) {
        setFormError("We couldn't reach the server. Check your connection and try again.");
      } else {
        setFormError("We couldn't create your account. Please try again.");
      }
      return;
    }
    // Stay in the loading state while the next page loads.
    router.replace(returnTo);
    router.refresh();
  }

  return (
    // POST + noValidate: our own messages replace the browser's, and a submit before
    // hydration never puts personal details in the URL (CWE-598).
    <form ref={formRef} method="post" noValidate onSubmit={onSubmit} aria-busy={pending}>
      <fieldset disabled={pending} className="flex flex-col gap-5">
        <FormAlert>{formError}</FormAlert>
        <AuthField
          id="name"
          type="text"
          label="Name"
          autoComplete="name"
          autoFocus
          required
          {...fieldProps("name")}
        />
        <AuthField
          id="email"
          type="email"
          label="Email"
          autoComplete="email"
          inputMode="email"
          required
          {...fieldProps("email")}
        />
        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
          required
          {...fieldProps("password")}
        />
        <SubmitButton pending={pending} label="Create account" pendingLabel="Creating your account…" />
      </fieldset>
    </form>
  );
}
