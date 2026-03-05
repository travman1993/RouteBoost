'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from '../legal.module.css';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [truckName, setTruckName] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleSubmit() {
    if (!name || !email || !topic || !message) return;
    setSubmitted(true);
  }

  const faqs = [
    { q: 'Do I need to be tech-savvy to use RouteBoost?', a: 'Not at all. RouteBoost is built specifically for busy food truck owners. The interface is mobile-first, uses large buttons, minimal typing, and plain-language AI. If you can use Instagram, you can use RouteBoost.' },
    { q: 'Does RouteBoost work for pop-ups and catering too?', a: 'Yes! RouteBoost works for any mobile food business — food trucks, pop-up shops, catering companies, and mobile vendors. The AI adapts to your specific business type.' },
    { q: 'Does RouteBoost replace Square or Toast?', a: 'No. RouteBoost is not a point-of-sale or payment system. It focuses on growing your customer base through better locations, marketing, and event bookings.' },
    { q: 'What happens after my 7-day free trial?', a: 'After your trial, RouteBoost is $25/month. No credit card is required to start. You can cancel anytime — no contracts, no hassle.' },
    { q: 'Will AI post to my social media automatically?', a: 'In the current version, RouteBoost generates your post and you review it before sharing. You always have final approval. Fully automated posting is on the roadmap.' },
    { q: 'How do I cancel my subscription?', a: 'You can cancel anytime from your profile settings inside the app, or by emailing support@routeboost.com. Your access continues until the end of your billing period.' },
  ];

  return (
    <>
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLogo}>
          <span className={styles.logoIcon}>🔥</span>RouteBoost
        </Link>
        <Link href="/" className={styles.navBack}>← Back to Home</Link>
      </nav>

      <main className={styles.contactPage}>
        <div className={styles.contactHeader}>
          <div className={styles.pageLabel}>Get in Touch</div>
          <h1>We&apos;d love to hear from you</h1>
          <p>Whether you have a question, feedback, or want to learn more about RouteBoost — we&apos;re here to help.</p>
        </div>

        <div className={styles.contactGrid}>
          <div className={styles.contactInfo}>
            <div className={styles.infoCard}>
              <div className={`${styles.infoIcon} ${styles.infoIconFlame}`}>📧</div>
              <h3>General Inquiries</h3>
              <p>Questions about RouteBoost or how it can help your business?</p>
              <p style={{ marginTop: '8px' }}><a href="mailto:hello@routeboost.com">hello@routeboost.com</a></p>
            </div>
            <div className={styles.infoCard}>
              <div className={`${styles.infoIcon} ${styles.infoIconMint}`}>🛠️</div>
              <h3>Support</h3>
              <p>Need help with your account, billing, or a technical issue?</p>
              <p style={{ marginTop: '8px' }}><a href="mailto:support@routeboost.com">support@routeboost.com</a></p>
            </div>
            <div className={styles.infoCard}>
              <div className={`${styles.infoIcon} ${styles.infoIconPurple}`}>🤝</div>
              <h3>Partnerships</h3>
              <p>Event organizers, food truck associations, or press inquiries.</p>
              <p style={{ marginTop: '8px' }}><a href="mailto:partners@routeboost.com">partners@routeboost.com</a></p>
            </div>
          </div>

          <div className={styles.formCard}>
            {!submitted ? (
              <>
                <h2>Send us a message</h2>
                <div className={styles.formRow}>
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input className="form-input" placeholder="e.g. Maria Lopez" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input className="form-input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Topic</label>
                  <select className="form-input" value={topic} onChange={(e) => setTopic(e.target.value)}>
                    <option value="" disabled>Select a topic…</option>
                    <option value="general">General Question</option>
                    <option value="demo">Request a Demo</option>
                    <option value="support">Account or Billing Support</option>
                    <option value="feedback">Product Feedback</option>
                    <option value="partnership">Partnership / Events</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Business Name <span style={{ color: 'var(--slate)', fontWeight: 400 }}>(optional)</span></label>
                  <input className="form-input" placeholder="e.g. Taco Fuego" value={truckName} onChange={(e) => setTruckName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-input" style={{ minHeight: '120px', resize: 'vertical' }} placeholder="Tell us what's on your mind…" value={message} onChange={(e) => setMessage(e.target.value)} />
                </div>
                <button className={styles.submitBtn} onClick={handleSubmit}>Send Message →</button>
              </>
            ) : (
              <div className={styles.successMsg}>
                <div className={styles.successIcon}>✓</div>
                <h3>Message sent!</h3>
                <p>Thanks for reaching out. We&apos;ll get back to you within 24 hours.</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.faqSection}>
          <h2>Common Questions</h2>
          {faqs.map((faq, i) => (
            <div key={i} className={styles.faqItem}>
              <button className={styles.faqQuestion} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.q}</span>
                <span className={styles.faqToggle} style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none', color: openFaq === i ? 'var(--flame)' : 'var(--slate)' }}>+</span>
              </button>
              <div className={`${styles.faqAnswer} ${openFaq === i ? styles.faqAnswerOpen : ''}`}>
                <div className={styles.faqAnswerInner}>{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerLogo}>🔥 RouteBoost</div>
        <p>The AI Growth Assistant for Mobile Food Businesses</p>
        <p className={styles.footerLinks} style={{ marginTop: '16px' }}>
          <Link href="/privacy">Privacy</Link> &nbsp;·&nbsp; <Link href="/terms">Terms</Link> &nbsp;·&nbsp; <Link href="/contact">Contact</Link>
        </p>
        <p style={{ marginTop: '16px' }}>© 2026 RouteBoost. All rights reserved.</p>
      </footer>
    </>
  );
}