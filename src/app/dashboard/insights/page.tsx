'use client';

import { createClient } from '@/lib/supabase-browser';
import { useEffect, useState } from 'react';
import styles from './insights.module.css';

interface Insight {
  title: string;
  body: string;
  type: 'tip' | 'warning' | 'win' | 'idea';
  icon: string;
}

interface InsightsData {
  summary: string;
  score: number;
  insights: Insight[];
  weeklyGoal: string;
}

const TYPE_BG: Record<string, string> = {
  win: styles.insightWin,
  tip: styles.insightTip,
  warning: styles.insightWarning,
  idea: styles.insightIdea,
};

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [truckData, setTruckData] = useState<any>(null);
  const [stats, setStats] = useState({ feedback: 0, posts: 0, events: 0 });

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: truck } = await supabase
      .from('trucks')
      .select('*')
      .eq('id', user.id)
      .single();
    if (truck) setTruckData(truck);

    const { count: feedbackCount } = await supabase
      .from('daily_feedback')
      .select('*', { count: 'exact', head: true })
      .eq('truck_id', user.id);

    const { count: postCount } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('truck_id', user.id);

    const { count: eventCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('truck_id', user.id);

    setStats({
      feedback: feedbackCount || 0,
      posts: postCount || 0,
      events: eventCount || 0,
    });
  }

  async function handleGenerate() {
    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const res = await fetch('/api/generate-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          truckName: truckData?.name,
          cuisine: truckData?.cuisine_type,
          vibe: truckData?.vibe,
          signatureDishes: truckData?.signature_dishes,
        }),
      });

      const result = await res.json();

      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
    } catch {
      setError('Failed to generate insights. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function getScoreColor(score: number) {
    if (score >= 70) return styles.scoreHigh;
    if (score >= 40) return styles.scoreMed;
    return styles.scoreLow;
  }

  function getScoreStroke(score: number) {
    if (score >= 70) return '#00E89D';
    if (score >= 40) return '#FFB84D';
    return '#FF6B6B';
  }

  const circumference = 2 * Math.PI * 52;

  return (
    <div className={styles.insightsPage}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>AI Insights</h1>
        <p className={styles.pageSubtitle}>Your AI growth coach analyzes your data</p>
      </div>

      {/* ACTIVITY STATS */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.feedback}</div>
          <div className={styles.statLabel}>Days Logged</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.posts}</div>
          <div className={styles.statLabel}>Posts Created</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statValue}>{stats.events}</div>
          <div className={styles.statLabel}>Events Saved</div>
        </div>
      </div>

      {/* GENERATE BUTTON */}
      {!data && !loading && (
        <div className={styles.generateCard}>
          <h2 className={styles.generateTitle}>🧠 Get Your Insights</h2>
          <p className={styles.generateDesc}>
            AI analyzes your feedback, locations, and activity to give you personalized growth advice.
          </p>
          <button
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={loading}
          >
            🔥 Analyze My Business
          </button>
        </div>
      )}

      {error && <div className={styles.errorMsg}>{error}</div>}

      {/* LOADING */}
      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.loadingDots}>
            <div className={styles.dot} />
            <div className={styles.dot} />
            <div className={styles.dot} />
          </div>
          <p className={styles.loadingText}>Analyzing your business data...</p>
        </div>
      )}

      {/* RESULTS */}
      {data && !loading && (
        <>
          {/* HEALTH SCORE */}
          <div className={styles.scoreCard}>
            <div className={styles.scoreLabel}>Business Health Score</div>
            <div className={styles.scoreRing}>
              <svg className={styles.scoreSvg} width="120" height="120">
                <circle className={styles.scoreTrack} cx="60" cy="60" r="52" />
                <circle
                  className={styles.scoreFill}
                  cx="60"
                  cy="60"
                  r="52"
                  stroke={getScoreStroke(data.score)}
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (data.score / 100) * circumference}
                />
              </svg>
              <span className={`${styles.scoreNumber} ${getScoreColor(data.score)}`}>
                {data.score}
              </span>
            </div>
            <p className={styles.scoreSummary}>{data.summary}</p>
          </div>

          {/* WEEKLY GOAL */}
          <div className={styles.goalCard}>
            <div className={styles.goalLabel}>🎯 This Week&apos;s Goal</div>
            <div className={styles.goalText}>{data.weeklyGoal}</div>
          </div>

          {/* INSIGHTS */}
          {data.insights.map((insight, i) => (
            <div
              key={i}
              className={styles.insightCard}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className={`${styles.insightIcon} ${TYPE_BG[insight.type] || styles.insightTip}`}>
                {insight.icon}
              </div>
              <div className={styles.insightContent}>
                <div className={styles.insightTitle}>{insight.title}</div>
                <div className={styles.insightBody}>{insight.body}</div>
              </div>
            </div>
          ))}

          {/* REFRESH */}
          <button
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={loading}
            style={{ marginTop: '16px' }}
          >
            🔄 Refresh Insights
          </button>

          <p className={styles.lastUpdated}>
            Last updated: {new Date().toLocaleString()}
          </p>
        </>
      )}
    </div>
  );
}