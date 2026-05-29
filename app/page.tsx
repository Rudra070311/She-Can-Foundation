import Image from "next/image";
import Link from "next/link";
import "./page.css";

export default function Home() {
  return (
    <main className="home-shell">
      <section className="hero-panel">
        <div className="home-copy">
          <div className="eyebrow-row">
            <span className="eyebrow">She Can Foundation</span>
            <span className="eyebrow-secondary">Education • Safety • Dignity</span>
          </div>

          <h1>Bold support for girls and communities who deserve more room to rise.</h1>

          <p className="hero-description">
            We build a brighter path through education, practical help, and local support.
            The goal is simple: make every child, especially girls, feel seen, safe, and
            capable of a bigger future.
          </p>

          <div className="cta-row">
            <Link className="cta-button primary" href="/form">
              Contact Us
            </Link>
            <a className="cta-button ghost" href="https://shecanfoundation.org/donate" target="_blank" rel="noreferrer">
              Donate Now
            </a>
            <Link className="cta-link" href="/story">
              Read our story
            </Link>
          </div>

          <div className="hero-notes">
            <span>Education access</span>
            <span>Women-centered support</span>
            <span>Community outreach</span>
          </div>
        </div>

        <div className="visual-stack">
          <article className="photo-card">
            <Image
              src="https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80"
              alt="Students learning together in a bright classroom"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="photo-image"
            />
            <div className="photo-overlay">
              <span className="overlay-pill">Hope in motion</span>
              <p>Small acts of support can open the door to a completely different future.</p>
            </div>
          </article>

          <div className="stat-grid">
            <div className="stat-card">
              <strong>01</strong>
              <span>One message can start real help.</span>
            </div>
            <div className="stat-card">
              <strong>Girls</strong>
              <span>We center dignity, learning, and long-term opportunity.</span>
            </div>
            <div className="stat-card accent-card">
              <strong>Community</strong>
              <span>Local action, practical care, and visible progress.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="impact-band">
        <div className="impact-card highlight">
          <span className="impact-label">What we do</span>
          <h2>Help that feels human, not hidden behind jargon.</h2>
          <p>
            We focus on simple, direct support for girls and families: awareness,
            education, and practical connection to resources.
          </p>
        </div>

        <div className="impact-list">
          <div>
            <span>Learning support</span>
            <p>Tools and confidence for the next step.</p>
          </div>
          <div>
            <span>Advocacy</span>
            <p>Standing up for girls who need their voice heard.</p>
          </div>
          <div>
            <span>Care network</span>
            <p>Connecting people to help that actually reaches them.</p>
          </div>
        </div>
      </section>
    </main>
  );
}