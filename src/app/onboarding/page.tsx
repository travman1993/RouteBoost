'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import styles from './onboarding.module.css';

const CUISINE_OPTIONS = [
  { id: 'tacos', label: 'Tacos & Mexican', emoji: '🌮' },
  { id: 'burgers', label: 'Burgers & Fries', emoji: '🍔' },
  { id: 'bbq', label: 'BBQ & Smoked', emoji: '🍖' },
  { id: 'chicken', label: 'Chicken & Wings', emoji: '🍗' },
  { id: 'pizza', label: 'Pizza', emoji: '🍕' },
  { id: 'asian', label: 'Asian Fusion', emoji: '🥡' },
  { id: 'seafood', label: 'Seafood', emoji: '🦐' },
  { id: 'sandwiches', label: 'Sandwiches & Subs', emoji: '🥪' },
  { id: 'vegan', label: 'Vegan & Plant-Based', emoji: '🥗' },
  { id: 'desserts', label: 'Desserts & Sweets', emoji: '🧁' },
  { id: 'coffee', label: 'Coffee & Drinks', emoji: '☕' },
  { id: 'other', label: 'Other', emoji: '🍽️' },
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Location {
  day: string;
  name: string;
  address: string;
}

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [cuisine, setCuisine] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [currentLocation, setCurrentLocation] = useState<Location>({
    day: 'Monday',
    name: '',
    address: '',
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const totalSteps = 3;

  const addLocation = () => {
    if (currentLocation.name && currentLocation.address) {
      setLocations([...locations, { ...currentLocation }]);
      setCurrentLocation({ day: 'Monday', name: '', address: '' });
    }
  };

  const removeLocation = (index: number) => {
    setLocations(locations.filter((_, i) => i !== index));
  };

  const handleComplete = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update truck profile with cuisine
      await supabase
        .from('trucks')
        .update({
          cuisine_type: cuisine,
          onboarding_complete: true,
        })
        .eq('id', user.id);

      // Insert locations
      if (locations.length > 0) {
        await supabase.from('locations').insert(
          locations.map((loc) => ({
            truck_id: user.id,
            day_of_week: loc.day,
            name: loc.name,
            address: loc.address,
          }))
        );
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      console.error('Onboarding error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.onboardingWrapper}>
      <div className={styles.onboardingGlow} />

      <div className={styles.onboardingContainer}>
        <a href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🔥</span>
          RouteBoost
        </a>

        {/* Progress Bar */}
        <div className={styles.progress}>
          <div
            className={styles.progressFill}
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>
        <p className={styles.stepLabel}>
          Step {step} of {totalSteps}
        </p>

        {/* STEP 1 — Cuisine */}
        {step === 1 && (
          <div className={styles.stepCard}>
            <h1 className={styles.stepTitle}>What do you serve?</h1>
            <p className={styles.stepSubtitle}>
              This helps us write better posts and find the right events for you.
            </p>

            <div className={styles.cuisineGrid}>
              {CUISINE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={`${styles.cuisineOption} ${
                    cuisine === option.id ? styles.cuisineActive : ''
                  }`}
                  onClick={() => setCuisine(option.id)}
                >
                  <span className={styles.cuisineEmoji}>{option.emoji}</span>
                  <span className={styles.cuisineLabel}>{option.label}</span>
                </button>
              ))}
            </div>

            <button
              className="btn btn-primary btn-full"
              disabled={!cuisine}
              onClick={() => setStep(2)}
              style={{ marginTop: '24px' }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* STEP 2 — Locations */}
        {step === 2 && (
          <div className={styles.stepCard}>
            <h1 className={styles.stepTitle}>Add your regular spots</h1>
            <p className={styles.stepSubtitle}>
              Where do you usually park? Add at least one to get started.
            </p>

            {/* Added locations */}
            {locations.length > 0 && (
              <div className={styles.locationList}>
                {locations.map((loc, i) => (
                  <div key={i} className={styles.locationItem}>
                    <div>
                      <span className={styles.locationDay}>{loc.day}</span>
                      <span className={styles.locationName}>{loc.name}</span>
                      <span className={styles.locationAddress}>{loc.address}</span>
                    </div>
                    <button
                      className={styles.removeBtn}
                      onClick={() => removeLocation(i)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add location form */}
            <div className={styles.addLocationForm}>
              <div className="form-group">
                <label className="form-label">Day of Week</label>
                <select
                  className="form-input"
                  value={currentLocation.day}
                  onChange={(e) =>
                    setCurrentLocation({ ...currentLocation, day: e.target.value })
                  }
                >
                  {DAYS.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Spot Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Downtown Office Park"
                  value={currentLocation.name}
                  onChange={(e) =>
                    setCurrentLocation({ ...currentLocation, name: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 123 Main St, Austin TX"
                  value={currentLocation.address}
                  onChange={(e) =>
                    setCurrentLocation({ ...currentLocation, address: e.target.value })
                  }
                />
              </div>

              <button
                className="btn btn-secondary btn-full"
                onClick={addLocation}
                disabled={!currentLocation.name || !currentLocation.address}
              >
                + Add Location
              </button>
            </div>

            <div className={styles.stepActions}>
              <button
                className="btn btn-secondary"
                onClick={() => setStep(1)}
              >
                ← Back
              </button>
              <button
                className="btn btn-primary"
                disabled={locations.length === 0}
                onClick={() => setStep(3)}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — First Plan Preview */}
        {step === 3 && (
          <div className={styles.stepCard}>
            <h1 className={styles.stepTitle}>You&apos;re all set! 🔥</h1>
            <p className={styles.stepSubtitle}>
              Here&apos;s a preview of what RouteBoost will do for you every day.
            </p>

            {/* Preview card */}
            <div className={styles.previewCard}>
              <div className={styles.previewHeader}>
                <span className={styles.previewLabel}>Tomorrow&apos;s Plan</span>
              </div>
              {locations[0] && (
                <>
                  <div className={styles.previewLocation}>
                    📍 {locations[0].name}
                  </div>
                  <div className={styles.previewMeta}>
                    <span>📅 {locations[0].day}</span>
                    <span>🔥 Ready to go</span>
                  </div>
                </>
              )}
            </div>

            <div className={styles.previewFeatures}>
              <div className={styles.previewFeature}>
                <span className={styles.featureIcon}>📣</span>
                <div>
                  <strong>AI Post</strong>
                  <p>Social media caption will be generated automatically</p>
                </div>
              </div>
              <div className={styles.previewFeature}>
                <span className={styles.featureIcon}>🎪</span>
                <div>
                  <strong>Events</strong>
                  <p>We&apos;ll find nearby booking opportunities for you</p>
                </div>
              </div>
              <div className={styles.previewFeature}>
                <span className={styles.featureIcon}>🧠</span>
                <div>
                  <strong>Insights</strong>
                  <p>AI learns from your feedback to get smarter over time</p>
                </div>
              </div>
            </div>

            <div className={styles.stepActions}>
              <button
                className="btn btn-secondary"
                onClick={() => setStep(2)}
              >
                ← Back
              </button>
              <button
                className="btn btn-primary"
                disabled={loading}
                onClick={handleComplete}
              >
                {loading ? <span className="spinner" /> : 'Go to Dashboard →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}