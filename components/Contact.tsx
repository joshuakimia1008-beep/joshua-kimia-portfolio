"use client";

import { useState, type FormEvent } from "react";
import Reveal from "./Reveal";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // Static demo submit handler.
    // Wire this up to a real endpoint — e.g. an app/api/contact/route.ts
    // API route, or a service like Formspree — to actually receive messages.
    setStatus("sent");
    e.currentTarget.reset();
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
            <p>
              Want to know more about my experience, skills and education?
            </p>
            <div className="cv-file">
              <div className="icon">PDF</div>
              <div>
                <div className="name">Joshua Kimia — CV</div>
                <div className="sub">PDF Document</div>
              </div>
            </div>
            <div className="cv-btns">
              <a className="btn btn-solid" href="#">
                Download CV ↓
              </a>
              <a className="btn btn-line" href="#">
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
            <div className="touch-list">
              <a href="mailto:JoshuaKimia1008@gmail.com">
                <span className="ic">✉️</span>JoshuaKimia1008@gmail.com
              </a>
              <a href="tel:09027961403">
                <span className="ic">📞</span>09027961403
              </a>
              <a href="#">
                <span className="ic">in</span>linkedin.com/in/joshua-kimia
              </a>
              <a href="#">
                <span className="ic">◆</span>github.com/joshuakimia
              </a>
            </div>
          </div>

          <div className="c-card">
            <h3>Send a message</h3>
            <form onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" type="text" placeholder="Your name" required />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="Your email" required />
              </div>
              <div className="field">
                <label htmlFor="message">Message</label>
                <textarea id="message" placeholder="Your message..." required />
              </div>
              <button className="btn btn-solid" type="submit">
                Send Message →
              </button>
              {status === "sent" && (
                <p className="form-status">
                  Thanks — this form is a static demo. Connect it to a backend
                  to receive real messages.
                </p>
              )}
            </form>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
