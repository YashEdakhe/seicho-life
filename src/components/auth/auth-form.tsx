"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Validators = Record<string, (value: string) => string | undefined>;

/**
 * Per-field validation for the auth forms: checks a field when it loses focus (once it
 * has a value), re-checks it while the user fixes an error, and checks everything on
 * submit, moving focus to the first invalid field.
 */
export function useFieldValidation(validators: Validators) {
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  function check(name: string, value: string) {
    const error = validators[name]?.(value);
    setErrors((prev) => ({ ...prev, [name]: error }));
    return error;
  }

  function fieldProps(name: string) {
    return {
      name,
      error: errors[name],
      onBlur: (event: React.FocusEvent<HTMLInputElement>) => {
        if (event.currentTarget.value) check(name, event.currentTarget.value);
      },
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
        if (errors[name]) check(name, event.currentTarget.value);
      },
    };
  }

  /** Validates every field; returns the values if all pass, otherwise null. */
  function validateAll(form: HTMLFormElement) {
    const data = new FormData(form);
    const values: Record<string, string> = {};
    const next: Record<string, string | undefined> = {};
    for (const name of Object.keys(validators)) {
      values[name] = String(data.get(name) ?? "");
      next[name] = validators[name](values[name]);
    }
    setErrors(next);
    const firstInvalid = Object.keys(validators).find((name) => next[name]);
    if (firstInvalid) {
      (form.elements.namedItem(firstInvalid) as HTMLInputElement | null)?.focus();
      return null;
    }
    return values;
  }

  /** Shows a server-side error on one field and focuses it once the form is re-enabled. */
  function setFieldError(name: string, error: string, form?: HTMLFormElement | null) {
    setErrors((prev) => ({ ...prev, [name]: error }));
    pendingFocus.current = (form?.elements.namedItem(name) as HTMLInputElement | null) ?? null;
  }

  // The form's fieldset is disabled while a request runs, and disabled inputs can't take
  // focus, so focus after the render that re-enables it.
  const pendingFocus = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    const input = pendingFocus.current;
    if (input && !input.matches(":disabled")) {
      input.focus();
      pendingFocus.current = null;
    }
  });

  return { fieldProps, validateAll, setFieldError };
}

type AuthFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
} & Omit<React.ComponentPropsWithoutRef<"input">, "id">;

/** Label, input, hint and inline error, wired together for screen readers. */
export function AuthField({ id, label, hint, error, children, ...props }: AuthFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-label text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          className="field"
          aria-invalid={error ? true : undefined}
          aria-describedby={[errorId, hintId].filter(Boolean).join(" ") || undefined}
          {...props}
        />
        {children}
      </div>
      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-meta">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Password input with a show/hide toggle so people can check what they typed. */
export function PasswordField(props: Omit<AuthFieldProps, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <AuthField {...props} type={visible ? "text" : "password"} className="field pr-16">
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="text-label absolute inset-y-0 right-0 px-3.5 text-muted hover:text-ink disabled:opacity-50"
        aria-controls={props.id}
        aria-pressed={visible}
        disabled={props.disabled}
      >
        {visible ? "Hide" : "Show"}
        <span className="sr-only"> password</span>
      </button>
    </AuthField>
  );
}

/** Form-level error (server or network problems), announced when it appears. */
export function FormAlert({ children }: { children?: React.ReactNode }) {
  return (
    <div role="alert" aria-live="assertive">
      {children && (
        <div className="border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger">{children}</div>
      )}
    </div>
  );
}

/** Full-width submit button with a spinner while the request is in flight. */
export function SubmitButton({ pending, label, pendingLabel }: { pending: boolean; label: string; pendingLabel: string }) {
  return (
    <Button type="submit" size="lg" fullWidth disabled={pending} aria-disabled={pending}>
      {pending && (
        <span
          aria-hidden="true"
          className="mr-2.5 size-3.5 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
        />
      )}
      {pending ? pendingLabel : label}
    </Button>
  );
}

/** Calls an authClient method, turning a thrown network failure into an error result. */
export async function callAuth<T extends { error: unknown }>(request: () => Promise<T>) {
  try {
    return await request();
  } catch {
    return { data: null, error: { status: 0, code: "NETWORK_ERROR", message: undefined } } as const;
  }
}
