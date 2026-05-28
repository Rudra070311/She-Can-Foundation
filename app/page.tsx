"use client";

import "./form.css";
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
            {theme === "dark" ? "Switch to light" : "Switch to black theme"}
          </button>
        </div>
        <h1>Leave a message that feels warm, clear, and human.</h1>
        <p>
          This frontend version keeps the form simple for now, but the design is
          polished enough to feel like a real support touchpoint.
        </p>
        <div className="hero-notes">
          <span>Frontend first</span>
          <span>Database later</span>
          <span>Responsive layout</span>
        </div>
      </section>

      <section className="form-card">
        <div className="card-header">
          <span className="card-label">Contact form</span>
          <h2>Tell us what you need</h2>
          <p>
            Share your name, email, and a short message. We will just show a
            success state for now.
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
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Your email address"
              required
            />
          </div>

          <div className="field-group">
            <label htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              rows={5}
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