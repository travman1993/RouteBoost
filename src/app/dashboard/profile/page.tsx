'use client';

import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from './profile.module.css';

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

const VIBE_OPTIONS = [
  'Family Friendly', 'Late Night', 'Lunch Rush', 'Festival Style',
  'Craft & Artisan', 'Quick & Casual', 'Gourmet', 'Comfort Food',
  'Healthy', 'Spicy', 'Southern', 'Fusion',
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface Location {
  id: string;
  day_of_week: string;
  name: string;
  address: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: '',
    cuisine_type: '',
    description: '',
    signature_dishes: '',
    price_range: '',
    instagram: '',
    facebook: '',
    tiktok: '',
    website: '',
    phone: '',
    operating_since: '',
    vibe: '',
    service_style: '',
  });
  const [email, setEmail] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [newLocation, setNewLocation] = useState({ day: 'Monday', name: '', address: '' });

  const supabase = createClient();
  const router = useRouter();

  const [subStatus, setSubStatus] = useState('trial');
  const [trialDays, setTrialDays] = useState<number | null>(null);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingSuccess, setBillingSuccess] = useState(false);

  useEffect(() => {
    loadProfile();
    loadLocations();
    loadSubscription();

    // Check for billing success redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get('billing') === 'success') {
      setBillingSuccess(true);
      setTimeout(() => setBillingSuccess(false), 5000);
      // Clean URL
      window.history.replaceState({}, '', '/dashboard/profile');
    }
  }, []);

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setEmail(user.email || '');

    const { data: truck } = await supabase
      .from('trucks')
      .select('*')
      .eq('id', user.id)
      .single();

    if (truck) {
      setProfile({
        name: truck.name || '',
        cuisine_type: truck.cuisine_type || '',
        description: truck.description || '',
        signature_dishes: truck.signature_dishes || '',
        price_range: truck.price_range || '',
        instagram: truck.instagram || '',
        facebook: truck.facebook || '',
        tiktok: truck.tiktok || '',
        website: truck.website || '',
        phone: truck.phone || '',
        operating_since: truck.operating_since || '',
        vibe: truck.vibe || '',
        service_style: truck.service_style || '',
      });
    }
  }

  async function loadLocations() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('locations')
      .select('*')
      .eq('truck_id', user.id)
      .order('created_at', { ascending: true });

    if (data) setLocations(data);
  }

  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('trucks')
      .update({
        name: profile.name,
        cuisine_type: profile.cuisine_type,
        description: profile.description,
        signature_dishes: profile.signature_dishes,
        price_range: profile.price_range,
        instagram: profile.instagram,
        facebook: profile.facebook,
        tiktok: profile.tiktok,
        website: profile.website,
        phone: profile.phone,
        operating_since: profile.operating_since,
        vibe: profile.vibe,
        service_style: profile.service_style,
      })
      .eq('id', user.id);

    setSaving(false);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleAddLocation() {
    if (!newLocation.name || !newLocation.address) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('locations').insert({
      truck_id: user.id,
      day_of_week: newLocation.day,
      name: newLocation.name,
      address: newLocation.address,
    });

    setNewLocation({ day: 'Monday', name: '', address: '' });
    setShowAddLocation(false);
    loadLocations();
  }

  async function handleDeleteLocation(id: string) {
    await supabase.from('locations').delete().eq('id', id);
    loadLocations();
  }

  async function loadSubscription() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: truck } = await supabase
      .from('trucks')
      .select('subscription_status, trial_ends_at')
      .eq('id', user.id)
      .single();

    if (truck) {
      const status = truck.subscription_status || 'trial';
      setSubStatus(status);

      if (status === 'trial' && truck.trial_ends_at) {
        const now = new Date();
        const trialEnd = new Date(truck.trial_ends_at);
        const days = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        setTrialDays(days > 0 ? days : 0);
        if (days <= 0) setSubStatus('trial_expired');
      }
    }
  }

  async function handleSubscribe() {
    setBillingLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setBillingLoading(false);
    }
  }

  async function handleManageBilling() {
    setBillingLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch('/api/stripe/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Billing portal error:', err);
    } finally {
      setBillingLoading(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  const cuisineLabel = CUISINE_OPTIONS.find(c => c.id === profile.cuisine_type);

  const completionItems = [
    !!profile.name,
    !!profile.cuisine_type,
    !!profile.description,
    !!profile.signature_dishes,
    !!profile.price_range,
    !!profile.vibe,
    locations.length > 0,
    !!(profile.instagram || profile.facebook || profile.tiktok),
  ];
  const completionPercent = Math.round(
    (completionItems.filter(Boolean).length / completionItems.length) * 100
  );

  return (
    <div className={styles.profilePage}>
      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Profile</h1>
        {!editing ? (
          <button className={styles.editBtn} onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        ) : (
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {saved && <div className={styles.savedBanner}>✓ Profile saved successfully</div>}

      {/* COMPLETION BAR */}
      <div className={styles.completionCard}>
        <div className={styles.completionHeader}>
          <span className={styles.completionLabel}>Profile Strength</span>
          <span className={styles.completionPercent}>{completionPercent}%</span>
        </div>
        <div className={styles.completionBar}>
          <div
            className={styles.completionFill}
            style={{
              width: `${completionPercent}%`,
              background:
                completionPercent === 100
                  ? 'var(--mint)'
                  : 'linear-gradient(90deg, var(--flame), var(--flame-light))',
            }}
          />
        </div>
        <p className={styles.completionHint}>
          {completionPercent === 100
            ? '🔥 Your profile is complete! AI has everything it needs.'
            : 'The more detail you add, the better your AI posts and insights will be.'}
        </p>
      </div>

      {/* TRUCK IDENTITY */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>🚚 Truck Identity</h2>
        <p className={styles.sectionHint}>This is what AI uses to write your posts and event applications.</p>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Truck Name</label>
          {editing ? (
            <input
              className="form-input"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder="e.g. Taco Fuego"
            />
          ) : (
            <div className={styles.fieldValue}>{profile.name || <span className={styles.fieldValueEmpty}>Not set</span>}</div>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>Cuisine Type</label>
          {editing ? (
            <div className={styles.cuisineGrid}>
              {CUISINE_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  className={`${styles.cuisineChip} ${profile.cuisine_type === option.id ? styles.cuisineChipActive : ''}`}
                  onClick={() => setProfile({ ...profile, cuisine_type: option.id })}
                >
                  <span>{option.emoji}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.fieldValue}>
              {cuisineLabel ? `${cuisineLabel.emoji} ${cuisineLabel.label}` : <span className={styles.fieldValueEmpty}>Not set</span>}
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>
            Description
            <span className={styles.fieldHint}>Tell customers what makes your truck special. AI uses this for posts.</span>
          </label>
          {editing ? (
            <textarea
              className={`form-input ${styles.textarea}`}
              value={profile.description}
              onChange={(e) => setProfile({ ...profile, description: e.target.value })}
              placeholder="e.g. Authentic street tacos made with family recipes from Oaxaca. We use locally sourced ingredients and make our tortillas fresh daily."
              rows={3}
            />
          ) : (
            <div className={styles.fieldValue}>
              {profile.description || <span className={styles.fieldValueEmpty}>Not set — add this to improve AI-generated posts</span>}
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>
            Signature Dishes
            <span className={styles.fieldHint}>Your most popular items — AI will highlight these in posts</span>
          </label>
          {editing ? (
            <input
              className="form-input"
              value={profile.signature_dishes}
              onChange={(e) => setProfile({ ...profile, signature_dishes: e.target.value })}
              placeholder="e.g. Birria tacos, elote, horchata, churros"
            />
          ) : (
            <div className={styles.fieldValue}>
              {profile.signature_dishes || <span className={styles.fieldValueEmpty}>Not set</span>}
            </div>
          )}
        </div>

        <div className={styles.fieldRow}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Price Range</label>
            {editing ? (
              <select
                className="form-input"
                value={profile.price_range}
                onChange={(e) => setProfile({ ...profile, price_range: e.target.value })}
              >
                <option value="">Select...</option>
                <option value="$">$ (Under $8)</option>
                <option value="$$">$$ ($8–$15)</option>
                <option value="$$$">$$$ ($15+)</option>
              </select>
            ) : (
              <div className={styles.fieldValue}>
                {profile.price_range || <span className={styles.fieldValueEmpty}>Not set</span>}
              </div>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Operating Since</label>
            {editing ? (
              <input
                className="form-input"
                value={profile.operating_since}
                onChange={(e) => setProfile({ ...profile, operating_since: e.target.value })}
                placeholder="e.g. 2021"
              />
            ) : (
              <div className={styles.fieldValue}>
                {profile.operating_since || <span className={styles.fieldValueEmpty}>Not set</span>}
              </div>
            )}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>
            Service Style
            <span className={styles.fieldHint}>How do customers order?</span>
          </label>
          {editing ? (
            <select
              className="form-input"
              value={profile.service_style}
              onChange={(e) => setProfile({ ...profile, service_style: e.target.value })}
            >
              <option value="">Select...</option>
              <option value="walk-up">Walk-up window</option>
              <option value="order-ahead">Order ahead / pickup</option>
              <option value="catering">Catering only</option>
              <option value="mixed">Mixed (walk-up + catering)</option>
            </select>
          ) : (
            <div className={styles.fieldValue}>
              {profile.service_style
                ? profile.service_style.charAt(0).toUpperCase() + profile.service_style.slice(1).replace('-', ' ')
                : <span className={styles.fieldValueEmpty}>Not set</span>}
            </div>
          )}
        </div>
      </div>

      {/* VIBE & BRAND */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>✨ Vibe & Brand</h2>
        <p className={styles.sectionHint}>This shapes the tone of AI-generated posts and captions.</p>

        <div className={styles.field}>
          <label className={styles.fieldLabel}>What&apos;s your truck&apos;s vibe?</label>
          {editing ? (
            <div className={styles.vibeGrid}>
              {VIBE_OPTIONS.map((v) => (
                <button
                  key={v}
                  className={`${styles.vibeChip} ${profile.vibe === v ? styles.vibeChipActive : ''}`}
                  onClick={() => setProfile({ ...profile, vibe: v })}
                >
                  {v}
                </button>
              ))}
            </div>
          ) : (
            <div className={styles.fieldValue}>
              {profile.vibe || <span className={styles.fieldValueEmpty}>Not set — helps AI match your tone</span>}
            </div>
          )}
        </div>
      </div>

      {/* SOCIAL MEDIA */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>📱 Social Media & Contact</h2>
        <p className={styles.sectionHint}>AI uses these to format posts with the right handles and tags.</p>

        {editing ? (
          <>
            <div className={styles.socialField}>
              <span className={styles.socialIcon}>📸</span>
              <input
                className="form-input"
                value={profile.instagram}
                onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                placeholder="Instagram handle (e.g. @tacofuego)"
              />
            </div>
            <div className={styles.socialField}>
              <span className={styles.socialIcon}>📘</span>
              <input
                className="form-input"
                value={profile.facebook}
                onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                placeholder="Facebook page name"
              />
            </div>
            <div className={styles.socialField}>
              <span className={styles.socialIcon}>🎵</span>
              <input
                className="form-input"
                value={profile.tiktok}
                onChange={(e) => setProfile({ ...profile, tiktok: e.target.value })}
                placeholder="TikTok handle"
              />
            </div>
            <div className={styles.socialField}>
              <span className={styles.socialIcon}>🌐</span>
              <input
                className="form-input"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="Website URL"
              />
            </div>
            <div className={styles.socialField}>
              <span className={styles.socialIcon}>📞</span>
              <input
                className="form-input"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="Phone number"
              />
            </div>
          </>
        ) : (
          <>
            {profile.instagram && (
              <div className={styles.socialValue}><span className={styles.socialIcon}>📸</span> {profile.instagram}</div>
            )}
            {profile.facebook && (
              <div className={styles.socialValue}><span className={styles.socialIcon}>📘</span> {profile.facebook}</div>
            )}
            {profile.tiktok && (
              <div className={styles.socialValue}><span className={styles.socialIcon}>🎵</span> {profile.tiktok}</div>
            )}
            {profile.website && (
              <div className={styles.socialValue}><span className={styles.socialIcon}>🌐</span> {profile.website}</div>
            )}
            {profile.phone && (
              <div className={styles.socialValue}><span className={styles.socialIcon}>📞</span> {profile.phone}</div>
            )}
            {!profile.instagram && !profile.facebook && !profile.tiktok && !profile.website && !profile.phone && (
              <div className={styles.fieldValue}>
                <span className={styles.fieldValueEmpty}>No social accounts added yet</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* WEEKLY LOCATIONS */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>📍 Weekly Locations</h2>
        <p className={styles.sectionHint}>Your regular weekly spots. These power your daily plan.</p>

        {locations.length > 0 ? (
          locations.map((loc) => (
            <div key={loc.id} className={styles.locationItem}>
              <div className={styles.locationInfo}>
                <span className={styles.locationDay}>{loc.day_of_week}</span>
                <span className={styles.locationName}>{loc.name}</span>
                <span className={styles.locationAddress}>{loc.address}</span>
              </div>
              <button className={styles.deleteBtn} onClick={() => handleDeleteLocation(loc.id)}>
                ✕
              </button>
            </div>
          ))
        ) : (
          <div className={styles.fieldValue}>
            <span className={styles.fieldValueEmpty}>No locations added yet</span>
          </div>
        )}

        {showAddLocation ? (
          <div className={styles.addLocationForm}>
            <div className="form-group">
              <label className="form-label">Day</label>
              <select
                className="form-input"
                value={newLocation.day}
                onChange={(e) => setNewLocation({ ...newLocation, day: e.target.value })}
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Spot Name</label>
              <input
                className="form-input"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                placeholder="e.g. Downtown Office Park"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                className="form-input"
                value={newLocation.address}
                onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                placeholder="e.g. 123 Main St, Austin TX"
              />
            </div>
            <div className={styles.addLocationActions}>
              <button className="btn btn-secondary" onClick={() => setShowAddLocation(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddLocation}
                disabled={!newLocation.name || !newLocation.address}
              >
                Add
              </button>
            </div>
          </div>
        ) : (
          <button className={styles.addLocationBtn} onClick={() => setShowAddLocation(true)}>
            + Add Location
          </button>
        )}
      </div>

      {/* ACCOUNT & BILLING */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>⚙️ Account & Billing</h2>

        <div className={styles.accountRow}>
          <span className={styles.accountLabel}>Email</span>
          <span className={styles.accountValue}>{email}</span>
        </div>
        <div className={styles.accountRow}>
          <span className={styles.accountLabel}>Plan</span>
          <span className={styles.planBadge}>
            {subStatus === 'active' ? 'RouteBoost Pro' :
             subStatus === 'trial' ? `Free Trial${trialDays !== null ? ` (${trialDays} days left)` : ''}` :
             subStatus === 'trial_expired' ? 'Trial Expired' :
             subStatus === 'past_due' ? 'Past Due' :
             subStatus === 'canceled' ? 'Canceled' : 'Free Trial'}
          </span>
        </div>
        <div className={styles.accountRow}>
          <span className={styles.accountLabel}>Price</span>
          <span className={styles.accountValue}>$25/mo</span>
        </div>

        {(subStatus === 'trial' || subStatus === 'trial_expired' || subStatus === 'canceled' || subStatus === 'none') && (
          <button
            className={styles.upgradeBtn}
            onClick={handleSubscribe}
            disabled={billingLoading}
          >
            {billingLoading ? 'Loading...' : subStatus === 'trial' ? '🚀 Subscribe Now — 7-Day Free Trial' : '🚀 Subscribe — $25/mo'}
          </button>
        )}

        {(subStatus === 'active' || subStatus === 'past_due') && (
          <button
            className={styles.manageBtn}
            onClick={handleManageBilling}
            disabled={billingLoading}
          >
            {billingLoading ? 'Loading...' : '⚙️ Manage Subscription'}
          </button>
        )}

        {billingSuccess && (
          <div className={styles.savedBanner} style={{ marginTop: '12px' }}>
            ✓ Subscription activated! Welcome to RouteBoost Pro.
          </div>
        )}
      </div>

      <button className={styles.logoutBtn} onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
}