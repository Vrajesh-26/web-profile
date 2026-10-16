"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { FieldLabel, Input } from "@/components/ui/Field";
import { authClient } from "@/lib/auth/client";
import styles from "./LoginForm.module.css";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signIn(formData: FormData) {
    setPending(true);
    setError("");
    try {
      const result = await authClient.signIn.email({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      if (result.error || !result.data) {
        setError("Sign-in failed. Check your details and try again.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Sign-in failed. Check your details and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={signIn} className={styles.form}>
      <div>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <Input id="email" name="email" type="email" autoComplete="username" required maxLength={254} />
      </div>
      <div>
        <FieldLabel htmlFor="password">Password</FieldLabel>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <Button type="submit" disabled={pending}>{pending ? "Signing in..." : "Sign in"}</Button>
    </form>
  );
}