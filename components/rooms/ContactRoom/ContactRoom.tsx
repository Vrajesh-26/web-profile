"use client";

import Script from "next/script";
import { useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./ContactRoom.module.css";

type TurnstileOptions = {
  sitekey: string;
  theme?: "light" | "dark" | "auto";
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
};

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function ContactRoom({
  siteKey,
  web3FormsKey,
}: {
  siteKey: string;
  web3FormsKey?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [turnstileError, setTurnstileError] = useState(false);
  const [scriptAttempt, setScriptAttempt] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [error, setError] = useState("");
  const turnstileContainer = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !turnstileReady || submitted || !turnstileContainer.current || !window.turnstile) return;

    try {
      widgetId.current = window.turnstile.render(turnstileContainer.current, {
        sitekey: siteKey,
        theme: "dark",
        callback: setTurnstileToken,
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => {
          setTurnstileToken("");
          setTurnstileError(true);
        },
      });
    } catch {
      queueMicrotask(() => setTurnstileError(true));
    }

    return () => {
      if (widgetId.current) window.turnstile?.remove(widgetId.current);
      widgetId.current = null;
    };
  }, [scriptAttempt, siteKey, submitted, turnstileReady]);

  function retryVerification() {
    setTurnstileToken("");
    setTurnstileError(false);
    if (widgetId.current && window.turnstile) {
      window.turnstile.reset(widgetId.current);
    } else {
      setTurnstileReady(false);
      setScriptAttempt((attempt) => attempt + 1);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    let token = turnstileToken;
    if (!token && siteKey === "1x00000000000000000000AA") {
      token = "dummy-dev-token";
    }

    if (!token) {
      setError(!siteKey
        ? "Contact verification is not configured. Please try again later."
        : turnstileError
          ? "Verification is unavailable. Retry verification before sending."
          : "Complete the verification before sending your message.");
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const message = String(formData.get("message") ?? "");

    setPending(true);
    try {
      const dbPromise = fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          turnstileToken: token,
        }),
      });

      let emailPromise: Promise<unknown> = Promise.resolve();
      if (web3FormsKey) {
        emailPromise = fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: web3FormsKey,
            name,
            email,
            message,
            subject: `New Portfolio Message from ${name}`,
            from_name: "Web Profile Contact Form",
          }),
        }).catch((err) => console.warn("Web3Forms client warning:", err));
      }

      const [dbResponse] = await Promise.all([dbPromise, emailPromise]);
      const result = await dbResponse.json() as { error?: string };
      if (!dbResponse.ok) {
        setError(result.error ?? "Your message could not be sent. Please try again.");
        setTurnstileToken("");
        if (widgetId.current) window.turnstile?.reset(widgetId.current);
        return;
      }
      setTurnstileToken("");
      setSubmitted(true);
    } catch {
      setError("Your message could not be sent. Please check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  function startAnotherMessage() {
    setError("");
    setTurnstileToken("");
    setSubmitted(false);
  }

  return (
    <section
      className={styles["contact-room"]}
      id="contact"
      aria-labelledby="contact-title"
    >
      {siteKey && (
        <Script
          key={scriptAttempt}
          id={`turnstile-api-${scriptAttempt}`}
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onReady={() => setTurnstileReady(true)}
          onError={() => setTurnstileError(true)}
        />
      )}
      {submitted ? (
        <div className={styles["contact-success"]} role="status">
          <p className={styles["eyebrow"]}>Message sent</p>
          <h2 id="contact-title">Thanks for reaching out.</h2>
          <p>Your message is in my inbox. I’ll get back to you soon.</p>
          <button type="button" onClick={startAnotherMessage}>
            Write another message
          </button>
        </div>
      ) : (
        <>
          <div className={styles["contact-intro"]}>
            <p className={styles["eyebrow"]}>The next good question</p>
            <h2 id="contact-title">What are you thinking about?</h2>
            <p>
              A project, a role, or just an interesting problem — I’d be glad
              to hear about it.
            </p>
          </div>
          <form className={styles["contact-form"]} onSubmit={handleSubmit} aria-busy={pending}>
            <label>
              <span>Your name</span>
              <input autoComplete="name" name="name" required />
            </label>
            <label>
              <span>Email address</span>
              <input
                autoComplete="email"
                name="email"
                type="email"
                required
              />
            </label>
            <label className={styles["message-field"]}>
              <span>A little about it</span>
              <textarea name="message" rows={4} minLength={2} required />
            </label>
            <div className={styles.verification} ref={turnstileContainer} />
            {(!siteKey || (turnstileError && siteKey !== "1x00000000000000000000AA")) && (
              <div className={styles["verification-error"]} role="alert">
                <p className={styles["form-note"]}>
                  {siteKey ? "Verification is unavailable. Please try again." : "Contact verification is not configured."}
                </p>
                {siteKey && <button type="button" onClick={retryVerification}>Retry verification</button>}
              </div>
            )}
            {error && <p className={styles["form-note"]} role="alert">{error}</p>}
            <button type="submit" disabled={pending}>
              {pending ? "Sending…" : "Send message"} <span aria-hidden="true">↗</span>
            </button>
          </form>
        </>
      )}
    </section>
  );
}
