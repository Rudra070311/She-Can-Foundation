"use client";

import "./form.css";
import Link from "next/link";
import type { FormEvent } from "react";
import { useState } from "react";

async function readResponseData(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as { error?: string; message?: string };
  } catch {
    return { message: text };
  }
}

async function postJsonWithRetry(url: string, payload: unknown, attempts = 2) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      lastError = error;

      if (attempt === attempts) {
        throw error;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Request failed.");
}

export default function Form() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Verify your email before submitting the form.");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  async function handleSendOtp() {
    if (!email) {
      setStatusMessage("Enter your email first.");
      return;
    }

    setIsSendingOtp(true);
    setStatusMessage("Sending your code...");

    try {
      const response = await postJsonWithRetry("/api/email-otp", { action: "send", email });
      const data = await readResponseData(response);

      if (!response.ok) {
        throw new Error(data.error || "Could not send verification code.");
      }

      setOtpSent(true);
      setVerified(false);
      setStatusMessage("Code sent. Check your inbox and enter it below.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not send verification code.");
    } finally {
      setIsSendingOtp(false);
    }
  }

  async function handleVerifyOtp() {
    if (!email || !otpCode) {
      setStatusMessage("Enter the code from your email.");
      return;
    }

    setIsVerifyingOtp(true);
    setStatusMessage("Checking your code...");

    try {
      const response = await postJsonWithRetry("/api/email-otp", {
        action: "verify",
        email,
        token: otpCode,
      });
      const data = await readResponseData(response);

      if (!response.ok) {
        throw new Error(data.error || "That code is not valid.");
      }

      setVerified(true);
      setStatusMessage("Email verified. You can now submit the form.");
    } catch (error) {
      setVerified(false);
      setStatusMessage(error instanceof Error ? error.message : "That code is not valid.");
    } finally {
      setIsVerifyingOtp(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!verified) {
      setStatusMessage("Verify your email before submitting the form.");
      return;
    }

    const formData = new FormData(form);
    const payload = {
      name: formData.get("name")?.toString() || "",
      email: formData.get("email")?.toString() || "",
      message: formData.get("message")?.toString() || "",
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await readResponseData(res);

      if (!res.ok) {
        throw new Error(data.error || data.message || "Network response was not ok");
      }

      setSubmitted(true);
      setStatusMessage("Form submitted successfully.");
      form.reset();
      setEmail("");
      setOtpCode("");
      setOtpSent(false);
      setVerified(false);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : "Network response was not ok");
    }
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
          <Link href="https://shecanfoundation.org/donate">
            <span>DONATE</span>
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
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button
                type="button"
                className="verify-button"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
              >
                {isSendingOtp ? "Sending..." : otpSent ? "Resend" : "Verify"}
              </button>
            </div>
          </div>

          <div className={`otp-panel ${otpSent ? "is-visible" : ""}`}>
            <label htmlFor="otp-code">Verification code</label>
            <div className="otp-row">
              <input
                type="text"
                id="otp-code"
                name="otp-code"
                placeholder="Enter the code from your email"
                value={otpCode}
                onChange={(event) => setOtpCode(event.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
              />
              <button
                type="button"
                className="verify-button otp-confirm"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp || !otpSent}
              >
                {isVerifyingOtp ? "Checking..." : "Confirm"}
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

          <button type="submit" className="submit-button" disabled={submitted || !verified}>
            {verified ? "Submit" : "Verify first"}
          </button>

          <p className="success-message is-visible">
            {statusMessage}
          </p>
        </form>
      </section>
    </main>
  );
}
