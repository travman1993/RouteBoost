import styles from '../dashboard.module.css';

export default function EventsPage() {
  return (
    <div className={styles.comingSoonPage}>
      <div className={styles.comingSoonIcon}>🎪</div>
      <h1>Events & Bookings</h1>
      <p>Festivals, breweries, markets, and private events — surfaced to you with AI-written applications ready to send.</p>
      <span className={styles.comingSoonTag}>Coming Soon</span>
    </div>
  );
}