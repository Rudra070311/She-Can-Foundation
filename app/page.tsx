"use client";

import "./form.css";
import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";

export default function Form() {
  const [submitted, setSubmitted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    event.currentTarget.reset();
  }

  return (
    <main className={`page-shell theme-${theme}`}>
      <section className="hero-copy">
        <div className="hero-topbar">
          <span className="eyebrow">She Can Foundation</span>
          <button
            type="button"
            className="theme-toggle"
            aria-pressed={theme === "dark"}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? "𖤓" : "☾"}
          </button>
        </div>
        <h1>Leave a message that feels warm, clear, and human.</h1>
        <p className="hero-description">
          This frontend version keeps the form simple for now, but the design is
          polished enough to feel like a real support touchpoint.
        </p>
        <div className="hero-notes">
          <Link href="/">
            <span>Home</span>
          </Link>
          <Link href="/donate">
            <span>DONATE</span>
          </Link>
          <Link href="/story">
            <span>Our Story</span>
          </Link>
        </div>
      </section>

      <section className="form-card">
        <div className="card-header">
          <span className="card-label">Contact form</span>
          <h2>Tell us what you need</h2>
          <p>
            Share your name, email, and a short message. We would ❤️ to hear from you!
          </p>
        </div>

        <form className="myform" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Your name"
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="email">Email</label>
            <div className="email-row">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Your email address"
                required
              />
              <button type="button" className="verify-button">
                Verify
              </button>
            </div>
          </div>

          <div className="field-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows={4}
              placeholder="Write your message here"
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Submit
          </button>

          <p className={`success-message ${submitted ? "is-visible" : ""}`}>
            Form Submitted Successfully
          </p>
        </form>
      </section>
    </main>
  );
}