import Link from 'next/link';
import styles from '../legal.module.css';

export default function TermsPage() {
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
        <h1>Terms of Service</h1>
        <p className={styles.lastUpdated}>Last updated: March 1, 2026</p>

        <p>Welcome to RouteBoost. By creating an account or using the RouteBoost application and website (&quot;Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). Please read them carefully.</p>

        <div className={styles.highlightBox}>
          <p>In short: use RouteBoost to grow your mobile food business, treat the platform respectfully, and understand that AI-generated content should be reviewed before sharing.</p>
        </div>

        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using RouteBoost, you confirm that you are at least 18 years old, have the legal capacity to enter into these Terms, and agree to comply with all applicable laws and regulations.</p>

        <h2>2. Description of Service</h2>
        <p>RouteBoost is an AI-powered growth assistant for food truck owners, pop-up shops, and catering businesses. The Service provides location planning tools, AI-generated social media content, event and booking discovery, daily feedback tracking, and AI-driven business insights.</p>

        <h2>3. Account Registration</h2>
        <p>To use RouteBoost, you must create an account with a valid email address and password. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.</p>

        <h2>4. Free Trial & Subscription</h2>
        <p>RouteBoost offers a 7-day free trial for new users. After the trial period, continued access requires an active paid subscription at the then-current monthly rate ($25/month at launch).</p>
        <ul>
          <li>Subscriptions are billed monthly and renew automatically</li>
          <li>You may cancel your subscription at any time through your account settings</li>
          <li>Cancellation takes effect at the end of the current billing period</li>
          <li>We do not offer prorated refunds for partial months</li>
          <li>We reserve the right to change pricing with 30 days advance notice</li>
        </ul>

        <h2>5. AI-Generated Content</h2>
        <p>RouteBoost uses artificial intelligence to generate social media posts, event application messages, and business insights. You acknowledge and agree that:</p>
        <ul>
          <li><strong>Review is your responsibility.</strong> AI-generated content is a suggestion. You should always review and approve content before posting or sending.</li>
          <li><strong>No guarantee of accuracy.</strong> AI suggestions are based on patterns and available data. They are not guaranteed to be accurate or suitable for your specific circumstances.</li>
          <li><strong>You own your content.</strong> Once you create, edit, and publish content through RouteBoost, you retain ownership.</li>
        </ul>

        <h2>6. Acceptable Use</h2>
        <p>You agree to use RouteBoost only for its intended purpose — growing and managing your mobile food business. You agree not to use the Service for unlawful purposes, attempt to gain unauthorized access, reverse engineer the platform, or resell access.</p>

        <h2>7. Data & Privacy</h2>
        <p>Your use of RouteBoost is also governed by our <Link href="/privacy">Privacy Policy</Link>, which describes how we collect, use, and protect your information.</p>

        <h2>8. Limitation of Liability</h2>
        <p>RouteBoost is provided &quot;as is&quot; without warranties of any kind. We do not guarantee that AI suggestions will result in increased revenue or business performance. Our total liability shall not exceed the amount you paid in the 12 months preceding the claim.</p>

        <h2>9. Termination</h2>
        <p>You may terminate your account at any time by canceling your subscription and requesting account deletion. We reserve the right to suspend or terminate accounts that violate these Terms.</p>

        <h2>10. Changes to These Terms</h2>
        <p>We may update these Terms from time to time. We will notify you of significant changes at least 30 days in advance.</p>

        <h2>11. Contact</h2>
        <p>Email: <a href="mailto:legal@routeboost.com">legal@routeboost.com</a></p>
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