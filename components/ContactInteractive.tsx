"use client";

import { useState, type FormEvent } from "react";
import Reveal from "./Reveal";

type ContactInteractiveProps = {
  email: string;
  githubUrl: string | null;
  linkedinUrl: string | null;
  resumeUrl: string;
  availability: string;
  location: string | null;
};

type FormStatus = {
  type: "success" | "error";
  message: string;
} | null;

export default function ContactInteractive({
  email,
  githubUrl,
  linkedinUrl,
  resumeUrl,
  availability,
  location,
}: ContactInteractiveProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<FormStatus>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      website: formData.get("website"),
    };

    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Something went wrong.");
      }

      form.reset();

      setStatus({
        type: "success",
        message: "Thanks for reaching out! Your message has been received.",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unable to send your message. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="contact" id="contact">
      <div className="wrap">
        <Reveal>
          <h2>Let&apos;s connect</h2>
          <p>
            Have a project, opportunity, or just want to say hello? I&apos;d
            love to hear from you.
          </p>
        </Reveal>

        <Reveal className="contact-grid">
          <div className="c-card">
            <h3>My CV</h3>
            <p>Want to know more about my experience, skills and education?</p>

            <div className="cv-file">
              <div className="icon">PDF</div>

              <div>
                <div className="name">Joshua Kimia — CV</div>
                <div className="sub">PDF Document</div>
              </div>
            </div>

            <div className="cv-btns">
              <a className="btn btn-solid" href={resumeUrl} download>
                Download CV ↓
              </a>

              <a
                className="btn btn-line"
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View CV →
              </a>
            </div>
          </div>

          <div className="c-card">
            <h3>Get in touch</h3>

            <p>
              I&apos;m always open to learning, collaborating, and connecting
              with people building interesting things.
            </p>

            <p
              className={`availability-pill availability-${availability.toLowerCase()}`}
            >
              <span className="availability-dot" />

              {availability === "AVAILABLE"
                ? "Available for hire"
                : availability === "BUSY"
                  ? "Currently busy"
                  : "Not accepting work"}

              {location ? ` · ${location}` : ""}
            </p>

            <div className="touch-list">
              <a href={`mailto:${email}`}>
                <span className="ic">✉</span>
                {email}
              </a>

              {linkedinUrl && (
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <span className="ic">in</span>
                  LinkedIn
                </a>
              )}

              {githubUrl && (
                <a href={githubUrl} target="_blank" rel="noopener noreferrer">
                  <span className="ic">◆</span>
                  GitHub
                </a>
              )}
            </div>
          </div>

          <div className="c-card">
            <h3>Send a message</h3>

            <form onSubmit={handleSubmit}>
              {/* Hidden spam honeypot */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: "-10000px",
                  width: "1px",
                  height: "1px",
                  overflow: "hidden",
                }}
              >
                <label htmlFor="contact-website">Leave this field empty</label>

                <input
                  id="contact-website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="field">
                <label htmlFor="contact-name">Name</label>

                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  maxLength={120}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="contact-email">Email</label>

                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Your email"
                  maxLength={254}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="contact-message">Message</label>

                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Your message..."
                  maxLength={5000}
                  required
                />
              </div>

              <button
                className="btn btn-solid"
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Message →"}
              </button>

              {status && (
                <p
                  className="form-status"
                  role="status"
                  aria-live="polite"
                  data-status={status.type}
                >
                  {status.message}
                </p>
              )}
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
