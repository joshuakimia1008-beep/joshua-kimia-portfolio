"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import CapsulePal from "@/components/login/CapsulePal";
import styles from "./login.module.css";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("joshuakimia1008@gmail.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      if (!normalizedEmail || !password) {
        setError("Please enter your email and password.");
        return;
      }

      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || "Unable to sign in. Please try again.");
        console.error("Login response:", result);
        return;
      }

      setSuccess(true);
      router.replace("/admin");
      router.refresh();
    } catch (error) {
      console.error("Login request failed:", error);
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const busy = loading || success;
  const mood = success ? "happy" : error ? "oops" : "idle";

  return (
    <main className={styles.page}>
      {/* ───────── Left: editorial side ───────── */}
      <section className={styles.left}>
        <div className={styles.signature} aria-label="Joshua Kimia">
          JK.
        </div>

        <div className={styles.hero}>
          <p className={styles.eyebrow}>PRIVATE WORKSPACE</p>

          <h1 className={styles.headline}>
            Behind the work.
            <br />
            <em>Beyond</em> the portfolio.
          </h1>

          <p className={styles.description}>
            A private workspace for managing the ideas, projects and experiences
            behind Joshua Kimia.
          </p>
        </div>

        <span className={styles.ghost} aria-hidden="true">
          JK
        </span>
      </section>

      {/* ───────── Right: capsule + sign-in card ───────── */}
      <section className={styles.right}>
        <div className={styles.grain} aria-hidden="true" />
        <div className={styles.ringOne} aria-hidden="true" />
        <div className={styles.ringTwo} aria-hidden="true" />

        <div className={styles.stage}>
          <CapsulePal mood={mood} />

          <form
            className={styles.card}
            onSubmit={handleSubmit}
            noValidate
            aria-busy={busy}
          >
            <h2 className={styles.cardTitle}>Welcome back.</h2>
            <p className={styles.cardSub}>
              Sign in to continue to your workspace.
            </p>

            <div className={styles.field}>
              <label htmlFor="admin-email">Email address</label>
              <input
                id="admin-email"
                type="text"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email address"
                aria-invalid={error ? true : undefined}
                disabled={busy}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="admin-password">Password</label>
              <div className={styles.passwordWrap}>
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  aria-invalid={error ? true : undefined}
                  disabled={busy}
                  required
                />
                <button
                  type="button"
                  className={styles.toggle}
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 3l18 18" />
                      <path d="M10.6 6.2A10.4 10.4 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.3 3.9M6.7 7.7A17 17 0 0 0 2 12s3.6 6 10 6c1.6 0 3-.4 4.3-1" />
                      <path d="M9.9 10a3 3 0 0 0 4.1 4.1" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className={styles.messages} aria-live="polite">
              {error && (
                <p className={styles.error} role="alert">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7.5v5.5M12 16.5h.01" />
                  </svg>
                  <span>{error}</span>
                </p>
              )}

              {success && (
                <p className={styles.success} role="status">
                  Welcome back. Redirecting to your workspace...
                </p>
              )}
            </div>

            <button type="submit" className={styles.submit} disabled={busy}>
              {busy && <span className={styles.spinner} aria-hidden="true" />}
              <span>
                {success
                  ? "Redirecting..."
                  : loading
                    ? "Signing you in..."
                    : "Sign in to workspace"}
              </span>
              {!busy && (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              )}
            </button>

            <p className={styles.security}>
              <i aria-hidden="true" />
              Protected access · Authorized account only
            </p>
          </form>
        </div>
      </section>

      {/* ───────── Footer ───────── */}
      <footer className={styles.footer}>
        <span>Designed and built by Joshua Kimia.</span>
        <span suppressHydrationWarning>© {new Date().getFullYear()}</span>
      </footer>
    </main>
  );
}
