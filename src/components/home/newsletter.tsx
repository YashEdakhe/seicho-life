"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/ui/container";

/** Email sign-up. Not yet wired to a backend; confirms locally on submit. */
export function Newsletter() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <Section tone="canvas">
      <Container size="narrow" className="flex flex-col items-center gap-6 text-center">
        <p className="text-label text-muted">Stay in touch</p>
        <h2>First look at new arrivals</h2>
        <p className="max-w-md text-muted">
          Join the list for early access to new collections, private sales and stories from the
          studio.
        </p>

        {submitted ? (
          <p role="status" className="text-label text-accent">
            Thank you. You&apos;re on the list.
          </p>
        ) : (
          <form
            // POST so a submit before hydration never puts the email in the URL (CWE-598).
            method="post"
            className="flex w-full max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="Email address"
              className="field flex-1"
            />
            <Button type="submit">Subscribe</Button>
          </form>
        )}
        <p className="text-meta">You can unsubscribe at any time.</p>
      </Container>
    </Section>
  );
}
