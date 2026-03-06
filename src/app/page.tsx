import Link from 'next/link';
import styles from './landing.module.css';

export default function LandingPage() {
  return (
    <>
      {/* NAV */}
      <nav className={styles.nav}>
        <a href="/" className={styles.navLogo}>
          <span className={styles.logoIcon}>🔥</span>
          RouteBoost
        </a>
        <Link href="/auth/signup" className={styles.navCta}>Start Free Trial</Link>
      </nav>

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <span className={styles.pulseDot}></span>
          Built for mobile food businesses
        </div>
        <h1 className={styles.heroTitle}>
          Never Have a <span className={styles.highlight}>Slow Day</span> Again
        </h1>
        <p className={styles.heroSub}>
          AI helps food trucks, pop-ups, and catering businesses choose better locations,
          post on social media automatically, and get booked for events — so every day is a good day.
        </p>
        <div className={styles.heroActions}>
          <Link href="/auth/signup" className={styles.btnPrimary}>Start Free Trial →</Link>
          <a href="#how" className={styles.btnSecondary}>▶ See How It Works</a>
        </div>
        <div className={styles.heroProof}>
          <div className={styles.avatarStack}>
            <span>🌮</span>
            <span>🍔</span>
            <span>🍗</span>
            <span>🧁</span>
            <span>🔥</span>
          </div>
          <p>Built with <strong>mobile food operators</strong></p>
        </div>
      </section>

      {/* WHO IT&apos;S FOR */}
      <section className={styles.whoSection}>
        <div className={styles.sectionLabel}>Who It&apos;s For</div>
        <h2 className={styles.sectionTitle}>If you serve food on the move,<br />this is for you.</h2>
        <div className={styles.whoGrid}>
          <div className={styles.whoCard}>
            <span className={styles.whoEmoji}>🚚</span>
            <h3>Food Trucks</h3>
            <p>Daily location planning, social posts, and demand predictions. Know where to park and when to show up.</p>
          </div>
          <div className={styles.whoCard}>
            <span className={styles.whoEmoji}>🏪</span>
            <h3>Pop-Up Shops</h3>
            <p>Scout high-traffic areas, find event opportunities, and build a following that shows up wherever you go.</p>
          </div>
          <div className={styles.whoCard}>
            <span className={styles.whoEmoji}>🍧</span>
            <h3>Street Vendors & Carts</h3>
            <p>Find the highest-foot-traffic corners and markets. AI tells you where the crowds are so you never waste a setup.</p>
          </div>
          <div className={styles.whoCard}>
            <span className={styles.whoEmoji}>🍽️</span>
            <h3>Mobile Catering</h3>
            <p>Discover corporate events, private parties, and festivals. AI writes your booking pitch so you get hired faster.</p>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className={styles.stats}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>60%</div>
            <p>of mobile food revenue depends on choosing the right location</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>$300+</div>
            <p>average revenue lost on a single slow day</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>2hrs</div>
            <p>spent weekly on social media most owners can&apos;t afford</p>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>73%</div>
            <p>of customers find mobile food vendors through social media posts</p>
          </div>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className={styles.problemSolution}>
        <div className={styles.sectionLabel}>The Problem</div>
        <h2 className={styles.sectionTitle}>Running a mobile food business is hard.<br />Growing it shouldn&apos;t be.</h2>
        <div className={styles.psGrid}>
          <div className={`${styles.psColumn} ${styles.psProblem}`}>
            <h3 className={styles.psColumnTitle}>❌ Without RouteBoost</h3>
            <div className={styles.psItem}><div className={styles.psIcon}>😓</div><span>Guessing where to park and hoping for the best</span></div>
            <div className={styles.psItem}><div className={styles.psIcon}>📱</div><span>Scrambling to post on social media every single day</span></div>
            <div className={styles.psItem}><div className={styles.psIcon}>📉</div><span>Slow days that crush your revenue and motivation</span></div>
            <div className={styles.psItem}><div className={styles.psIcon}>🔍</div><span>Missing festival and event booking opportunities</span></div>
            <div className={styles.psItem}><div className={styles.psIcon}>🤷</div><span>No idea which locations or days actually perform best</span></div>
            <div className={styles.psItem}><div className={styles.psIcon}>⏰</div><span>Spending hours on marketing instead of cooking</span></div>
          </div>
          <div className={`${styles.psColumn} ${styles.psSolution}`}>
            <h3 className={styles.psColumnTitle}>✅ With RouteBoost</h3>
            <div className={styles.psItem}><div className={styles.psIcon}>📍</div><span>AI-suggested locations based on demand, weather, and your history</span></div>
            <div className={styles.psItem}><div className={styles.psIcon}>🤖</div><span>Social posts generated automatically — just review and share</span></div>
            <div className={styles.psItem}><div className={styles.psIcon}>🔥</div><span>Smarter planning that turns slow days into busy ones</span></div>
            <div className={styles.psItem}><div className={styles.psIcon}>🎪</div><span>Event opportunities delivered with AI-written applications</span></div>
            <div className={styles.psItem}><div className={styles.psIcon}>🧠</div><span>AI insights that get smarter the more you use it</span></div>
            <div className={styles.psItem}><div className={styles.psIcon}>🗺️</div><span>Heat map shows where the crowds are right now</span></div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.features}>
        <div className={styles.sectionLabel}>Core Features</div>
        <h2 className={styles.sectionTitle}>Everything you need to<br />grow your business.</h2>
        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.featureIconFlame}`}>📍</div>
            <h3>Smart Location Planning</h3>
            <p>Set your weekly route, get daily demand predictions, and discover high-traffic spots — from Walmart parking lots to downtown lunch rushes.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.featureIconMint}`}>📣</div>
            <h3>AI Marketing Engine</h3>
            <p>Generate Instagram, Facebook, TikTok, and Twitter posts instantly. A full week of content with one tap — morning hype, midday rush, and evening recap.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.featureIconPurple}`}>🎪</div>
            <h3>Event & Booking Finder</h3>
            <p>Festivals, breweries, markets, corporate lunches, and private events — surfaced to you with AI-written pitches ready to send.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.featureIconTeal}`}>🧠</div>
            <h3>AI Growth Insights</h3>
            <p>No confusing dashboards. Just plain-language advice like &quot;Your Thursday spot underperforms — try the shopping center instead.&quot;</p>
          </div>
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.featureIconBlue}`}>🗺️</div>
            <h3>Demand Heat Map</h3>
            <p>See a live heat map of your area showing where the crowds are. AI recommends the best spots based on traffic, weather, time of day, and your cuisine.</p>
          </div>
          <div className={styles.featureCard}>
            <div className={`${styles.featureIcon} ${styles.featureIconYellow}`}>☀️</div>
            <h3>Weather-Smart Planning</h3>
            <p>Live weather with hourly forecasts built into your daily plan. Know if rain is coming so you can adjust your strategy before it hits.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.howItWorks} id="how">
        <div className={styles.sectionLabel}>How It Works</div>
        <h2 className={styles.sectionTitle}>Three steps. That&apos;s it.</h2>
        <div className={styles.howSteps}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>01</div>
            <h3>Set Your Spots</h3>
            <p>Add your regular weekly locations. Monday at the office park, Friday at the brewery — your schedule, your way.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>02</div>
            <h3>Confirm & Go</h3>
            <p>Each morning, check your daily plan, confirm your location, and let AI generate your social media posts for the day.</p>
          </div>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>03</div>
            <h3>Grow on Autopilot</h3>
            <p>AI learns from your daily feedback to suggest better locations, find events, and grow your following automatically.</p>
          </div>
        </div>
      </section>

      {/* DAILY FLOW */}
      <section className={styles.dailyFlow}>
        <div className={styles.sectionLabel}>Your Day with RouteBoost</div>
        <h2 className={styles.sectionTitle}>A daily habit that<br />grows your business.</h2>
        <div className={styles.flowTimeline}>
          <div className={styles.flowItem}>
            <div className={styles.flowDot}>☀️</div>
            <div className={styles.flowContent}>
              <div className={styles.flowTime}>Morning</div>
              <h4>Check Your Daily Plan</h4>
              <p>Open the app, see where you&apos;re headed, check the weather, and confirm your location with one tap.</p>
            </div>
          </div>
          <div className={styles.flowItem}>
            <div className={styles.flowDot}>📸</div>
            <div className={styles.flowContent}>
              <div className={styles.flowTime}>Before Opening</div>
              <h4>Post in Seconds</h4>
              <p>AI has your morning hype caption ready. Copy it, add a photo, and your audience knows you&apos;re open.</p>
            </div>
          </div>
          <div className={styles.flowItem}>
            <div className={styles.flowDot}>🔥</div>
            <div className={styles.flowContent}>
              <div className={styles.flowTime}>During Service</div>
              <h4>Focus on Cooking</h4>
              <p>Your midday &quot;we&apos;re here now&quot; post goes out. If a nearby event pops up, you&apos;ll get a nudge.</p>
            </div>
          </div>
          <div className={styles.flowItem}>
            <div className={styles.flowDot}>🌙</div>
            <div className={styles.flowContent}>
              <div className={styles.flowTime}>After Closing</div>
              <h4>Quick Feedback</h4>
              <p>Rate your day in one tap. AI learns what works so tomorrow is even better. Your evening recap post is ready to go.</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className={styles.testimonials}>
        <div className={styles.sectionLabel}>Why Operators Love It</div>
        <h2 className={styles.sectionTitleCenter}>Built by people who get<br />the mobile food grind.</h2>
        <div className={styles.testimonialGrid}>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialStars}>★★★★★</div>
            <p className={styles.testimonialText}>&quot;I used to spend 45 minutes every morning figuring out what to post. Now it takes me 30 seconds. The AI nails my vibe every time.&quot;</p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.testimonialAvatar} style={{ background: 'rgba(255, 92, 0, 0.12)' }}>🌮</div>
              <div>
                <div className={styles.testimonialName}>Maria L.</div>
                <div className={styles.testimonialRole}>Taco Truck Owner, Austin TX</div>
              </div>
            </div>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialStars}>★★★★★</div>
            <p className={styles.testimonialText}>&quot;The heat map found me a Walmart parking lot I never would have tried. It&apos;s now my best Tuesday spot — $800+ days consistently.&quot;</p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.testimonialAvatar} style={{ background: 'rgba(0, 232, 157, 0.12)' }}>🍔</div>
              <div>
                <div className={styles.testimonialName}>Derek W.</div>
                <div className={styles.testimonialRole}>Burger Truck, Atlanta GA</div>
              </div>
            </div>
          </div>
          <div className={styles.testimonialCard}>
            <div className={styles.testimonialStars}>★★★★★</div>
            <p className={styles.testimonialText}>&quot;Got booked for 3 brewery events in my first month using the AI pitch feature. That alone paid for a year of the app.&quot;</p>
            <div className={styles.testimonialAuthor}>
              <div className={styles.testimonialAvatar} style={{ background: 'rgba(155, 93, 229, 0.12)' }}>🍗</div>
              <div>
                <div className={styles.testimonialName}>James T.</div>
                <div className={styles.testimonialRole}>BBQ Catering, Nashville TN</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className={styles.pricing} id="pricing">
        <div className={styles.sectionLabel}>Simple Pricing</div>
        <h2 className={styles.sectionTitleCenter}>One plan. No surprises.</h2>
        <div className={styles.pricingCard}>
          <div className={styles.pricingBadge}>7 Days Free</div>
          <div className={styles.pricingAmount}>$25 <span>/month</span></div>
          <p className={styles.pricingNote}>One extra customer per day pays for the entire app.</p>
          <div className={styles.pricingFeatures}>
            <div className={styles.pricingFeature}><span className={styles.pricingCheck}>✓</span><span>AI-powered daily location plans</span></div>
            <div className={styles.pricingFeature}><span className={styles.pricingCheck}>✓</span><span>Demand heat map with live data</span></div>
            <div className={styles.pricingFeature}><span className={styles.pricingCheck}>✓</span><span>Automatic social media posts</span></div>
            <div className={styles.pricingFeature}><span className={styles.pricingCheck}>✓</span><span>Weekly content calendar</span></div>
            <div className={styles.pricingFeature}><span className={styles.pricingCheck}>✓</span><span>Event & booking finder with AI pitches</span></div>
            <div className={styles.pricingFeature}><span className={styles.pricingCheck}>✓</span><span>AI growth insights & health score</span></div>
            <div className={styles.pricingFeature}><span className={styles.pricingCheck}>✓</span><span>Weather-smart planning</span></div>
            <div className={styles.pricingFeature}><span className={styles.pricingCheck}>✓</span><span>Cancel anytime — no contracts</span></div>
          </div>
          <Link href="/auth/signup" className={styles.btnPrimary}>Start Free Trial →</Link>
          <p className={styles.pricingGuarantee}>No credit card required to start.</p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className={styles.finalCta}>
        <h2>Stop guessing.<br />Start growing.</h2>
        <p>Join the mobile food businesses that never have a slow day.</p>
        <Link href="/auth/signup" className={styles.btnPrimary}>Start Your Free Trial →</Link>
      </section>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>🔥 RouteBoost</div>
        <p>The AI Growth Assistant for Mobile Food Businesses</p>
        <p className={styles.footerLinks}>
          <Link href="/privacy">Privacy</Link> &nbsp;·&nbsp; <Link href="/terms">Terms</Link> &nbsp;·&nbsp; <Link href="/contact">Contact</Link>
        </p>
        <p style={{ marginTop: '16px' }}>© 2026 RouteBoost. All rights reserved.</p>
      </footer>
    </>
  );
}