'use client';

import { createClient } from '@/lib/supabase-browser';
import { useEffect, useState } from 'react';
import styles from './posts.module.css';

interface SavedPost {
  id: string;
  caption: string;
  hashtags: string;
  platform: string;
  location_name: string;
  created_at: string;
}

const PLATFORMS = [
  { id: 'instagram', label: '📸 Instagram' },
  { id: 'facebook', label: '📘 Facebook' },
  { id: 'tiktok', label: '🎵 TikTok' },
  { id: 'twitter', label: '𝕏 Twitter/X' },
];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function PostsPage() {
  const [platform, setPlatform] = useState('instagram');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [truckData, setTruckData] = useState<any>(null);
  const [todayLocation, setTodayLocation] = useState<any>(null);

  const supabase = createClient();
  const dayName = DAYS[new Date().getDay()];

  useEffect(() => {
    loadTruckData();
    loadSavedPosts();
  }, []);

  async function loadTruckData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: truck, error: truckError } = await supabase
      .from('trucks')
      .select('*')
      .eq('id', user.id)
      .single();

    if (truckError) console.error('Could not load truck profile:', truckError.message);
    if (truck) setTruckData(truck);

    const { data: locations } = await supabase
      .from('locations')
      .select('*')
      .eq('truck_id', user.id)
      .eq('day_of_week', dayName);

    if (locations && locations.length > 0) {
      setTodayLocation(locations[0]);
    }
  }

  async function loadSavedPosts() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('truck_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setSavedPosts(data);
  }

  async function handleGenerate() {
    setGenerating(true);
    setError('');
    setCaption('');
    setHashtags('');

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const res = await fetch('/api/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          truckName: truckData?.name,
          cuisine: truckData?.cuisine_type,
          description: truckData?.description,
          signatureDishes: truckData?.signature_dishes,
          vibe: truckData?.vibe,
          priceRange: truckData?.price_range,
          locationName: todayLocation?.name,
          locationAddress: todayLocation?.address,
          platform,
          dayOfWeek: dayName,
          customPrompt,
          userId: user?.id,
        }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setCaption(data.caption);
        setHashtags(data.hashtags);
      }
    } catch (err) {
      setError('Failed to generate post. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !caption) return;

    await supabase.from('posts').insert({
      truck_id: user.id,
      caption,
      hashtags,
      platform,
      location_name: todayLocation?.name || null,
    });

    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
    loadSavedPosts();
  }

  function handleCopy() {
    const fullText = hashtags ? `${caption}\n\n${hashtags}` : caption;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDeletePost(id: string) {
    await supabase.from('posts').delete().eq('id', id);
    loadSavedPosts();
  }

  function handleCopySaved(post: SavedPost) {
    const fullText = post.hashtags ? `${post.caption}\n\n${post.hashtags}` : post.caption;
    navigator.clipboard.writeText(fullText);
  }

  return (
    <div className={styles.postsPage}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Post Creator</h1>
        <p className={styles.pageSubtitle}>AI generates posts using your truck profile</p>
      </div>

      {truckData && (!truckData.name || !truckData.cuisine_type) && (
        <div style={{ background: 'rgba(255,184,77,0.12)', border: '1px solid rgba(255,184,77,0.3)', borderRadius: '12px', padding: '12px 16px', marginBottom: '16px', fontSize: '0.88rem', color: 'var(--cream)' }}>
          ⚠️ Your profile is incomplete — add your truck name and cuisine for better AI results. <a href="/dashboard/profile" style={{ color: 'var(--flame)', fontWeight: 600 }}>Complete Profile →</a>
        </div>
      )}

      {/* GENERATOR */}
      <div className={styles.generatorCard}>
        <div className={styles.generatorHeader}>
          <h2 className={styles.generatorTitle}>✨ Generate a Post</h2>
        </div>

        {/* Platform Picker */}
        <div className={styles.platformPicker}>
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              className={`${styles.platformBtn} ${platform === p.id ? styles.platformBtnActive : ''}`}
              onClick={() => setPlatform(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Custom prompt */}
        <textarea
          className={styles.customPrompt}
          placeholder="Any special angle? e.g. 'Promote our new birria tacos' or 'Mention the rain discount today'..."
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
        />

        <button
          className={styles.generateBtn}
          onClick={handleGenerate}
          disabled={generating}
        >
          {generating ? (
            <>
              <span className="spinner" />
              Generating...
            </>
          ) : (
            '🔥 Generate Post'
          )}
        </button>
      </div>

      {/* ERROR */}
      {error && <div className={styles.errorMsg}>{error}</div>}

      {/* GENERATING ANIMATION */}
      {generating && (
        <div className={styles.generating}>
          <div className={styles.generatingDots}>
            <div className={styles.dot} />
            <div className={styles.dot} />
            <div className={styles.dot} />
          </div>
          <p className={styles.generatingText}>Writing your post...</p>
        </div>
      )}

      {/* RESULT */}
      {caption && !generating && (
        <div className={styles.resultCard}>
          <div className={styles.resultLabel}>Generated Post</div>
          <div className={styles.captionText}>{caption}</div>
          {hashtags && <div className={styles.hashtagText}>{hashtags}</div>}

          <div className={styles.resultActions}>
            <button className={`${styles.actionBtn} ${styles.copyBtn}`} onClick={handleCopy}>
              📋 Copy
            </button>
            <button className={`${styles.actionBtn} ${styles.saveBtn}`} onClick={handleSave}>
              💾 Save
            </button>
            <button className={`${styles.actionBtn} ${styles.regenerateBtn}`} onClick={handleGenerate}>
              🔄 Redo
            </button>
          </div>

          {copied && <p className={styles.copiedBanner}>✓ Copied to clipboard!</p>}
          {savedMsg && <p className={styles.savedBanner}>✓ Saved to your library!</p>}
        </div>
      )}

      {/* SAVED POSTS */}
      <div className={styles.savedSection}>
        <h2 className={styles.savedTitle}>📚 Saved Posts</h2>

        {savedPosts.length > 0 ? (
          savedPosts.map((post) => (
            <div key={post.id} className={styles.savedPost}>
              <div className={styles.savedPostHeader}>
                <span className={styles.savedPostPlatform}>{post.platform}</span>
                <span className={styles.savedPostDate}>
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className={styles.savedPostCaption}>{post.caption}</div>
              <div className={styles.savedPostActions}>
                <button
                  className={`${styles.savedPostBtn} ${styles.savedPostCopy}`}
                  onClick={() => handleCopySaved(post)}
                >
                  Copy
                </button>
                <button
                  className={`${styles.savedPostBtn} ${styles.savedPostDelete}`}
                  onClick={() => handleDeletePost(post.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyPosts}>
            No saved posts yet. Generate your first one above!
          </div>
        )}
      </div>
    </div>
  );
}