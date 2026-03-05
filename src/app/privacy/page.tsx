import Link from 'next/link';
import styles from '../legal.module.css';

export default function PrivacyPage() {
  return (
    <>
      <nav className={styles.nav}>
        <Link href="/" className={styles.navLogo}>
          <span className={styles.logoIcon}>🔥</span>RouteBoost
        </Link>
        <Link href="/" className={styles.navBack}>← Back to Home</Link>
      </nav>

      <main className={styles.legalPage}>
        <div className={styles.pageLabel}>Legal</div>
        <h1>Privacy Policy</h1>
        <p className={styles.lastUpdated}>Last updated: March 1, 2026</p>

        <p>RouteBoost (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting the privacy of mobile food business owners and operators who use our platform. This Privacy Policy explains how we collect, use, store, and protect your information when you use the RouteBoost application and website.</p>

        <div className={styles.highlightBox}>
          <p>In short: we collect only what we need to make RouteBoost work for you, we never sell your data, and you can delete your account and data at any time.</p>
        </div>

        <h2>1. Information We Collect</h2>
        <p><strong>Account Information</strong> — When you sign up, we collect your email address, password (stored securely as a hash, never in plain text), and your food truck name.</p>
        <p><strong>Business Profile Data</strong> — Information you provide about your food truck, pop-up, or catering business, including cuisine type, menu descriptions, operating hours, and branding details.</p>
        <p><strong>Location Data</strong> — Weekly route locations you add (addresses, schedules, notes). We also collect daily check-in confirmations. We do not track your GPS location in the background.</p>
        <p><strong>Feedback Data</strong> — End-of-day ratings, notes, and factors you provide. This is used to improve AI predictions for your business specifically.</p>
        <p><strong>Usage Data</strong> — How you interact with the app (screens visited, features used, post generation frequency). This helps us improve the product.</p>
        <p><strong>Payment Information</strong> — Subscription payments are processed by Stripe. We do not store your credit card number on our servers.</p>

        <h2>2. How We Use Your Information</h2>
        <p>We use your data to:</p>
        <ul>
          <li>Generate AI-powered daily plans, social media posts, and event application messages</li>
          <li>Provide personalized location recommendations and demand predictions</li>
          <li>Deliver AI growth insights based on your feedback history</li>
          <li>Surface relevant event and booking opportunities in your area</li>
          <li>Improve the accuracy of our AI models over time</li>
          <li>Send essential account communications (verification, billing, security)</li>
          <li>Maintain and improve the RouteBoost platform</li>
        </ul>

        <h2>3. What We Do NOT Do</h2>
        <ul>
          <li>We do <strong>not</strong> sell your personal information to third parties</li>
          <li>We do <strong>not</strong> share your individual business performance data with other users</li>
          <li>We do <strong>not</strong> track your GPS location in the background</li>
          <li>We do <strong>not</strong> send marketing emails without your consent</li>
          <li>We do <strong>not</strong> store your payment card details on our servers</li>
        </ul>

        <h2>4. AI-Generated Content</h2>
        <p>RouteBoost uses artificial intelligence to generate social media posts, event applications, and growth insights. These are generated based on your business profile and activity data. You always have the ability to review, edit, or discard AI-generated content before it is used or shared.</p>

        <h2>5. Data Storage & Security</h2>
        <p>Your data is stored on secure, encrypted servers. We use industry-standard security practices including encrypted connections (HTTPS/TLS), hashed passwords, and access controls.</p>

        <h2>6. Third-Party Services</h2>
        <p>We use third-party services including payment processing (Stripe), AI providers (for content generation), hosting infrastructure, and analytics (anonymized).</p>

        <h2>7. Data Retention</h2>
        <p>We retain your data for as long as your account is active. If you cancel your subscription, your data is retained for 30 days in case you reactivate. After 30 days, or upon your request, your data is permanently deleted.</p>

        <h2>8. Your Rights</h2>
        <p>You have the right to access, correct, delete, and export your data. To exercise any of these rights, contact us at <a href="mailto:privacy@routeboost.com">privacy@routeboost.com</a>.</p>

        <h2>9. Contact</h2>
        <p>Email: <a href="mailto:privacy@routeboost.com">privacy@routeboost.com</a></p>
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