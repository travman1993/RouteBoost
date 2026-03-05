import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkSubscriptionServer } from '@/lib/check-subscription-server';

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, truckName, cuisine, vibe, signatureDishes } = body;

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const isActive = await checkSubscriptionServer(userId);
  if (!isActive) {
    return NextResponse.json({
      error: 'Your trial has expired. Subscribe to continue using AI Insights.',
      subscriptionRequired: true,
    }, { status: 403 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  // Fetch feedback and location data
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: feedback } = await supabase
    .from('daily_feedback')
    .select('*')
    .eq('truck_id', userId)
    .order('date', { ascending: false })
    .limit(30);

  const { data: locations } = await supabase
    .from('locations')
    .select('*')
    .eq('truck_id', userId);

  const { data: posts } = await supabase
    .from('posts')
    .select('id')
    .eq('truck_id', userId);

  const { data: events } = await supabase
    .from('events')
    .select('id, status')
    .eq('truck_id', userId);

  // Build context for AI
  const feedbackSummary = feedback && feedback.length > 0
    ? feedback.map((f: any) => `${f.date} (${f.rating})${f.notes ? ': ' + f.notes : ''}`).join('\n')
    : 'No feedback logged yet';

  const locationList = locations && locations.length > 0
    ? locations.map((l: any) => `${l.day_of_week}: ${l.name} (${l.address})`).join('\n')
    : 'No locations set';

  const totalPosts = posts?.length || 0;
  const totalEvents = events?.length || 0;
  const bookedEvents = events?.filter((e: any) => e.status === 'booked').length || 0;

  const feedbackCounts = {
    great: feedback?.filter((f: any) => f.rating === 'great').length || 0,
    normal: feedback?.filter((f: any) => f.rating === 'normal').length || 0,
    slow: feedback?.filter((f: any) => f.rating === 'slow').length || 0,
  };

  const systemPrompt = `You are an AI growth advisor for food trucks. You analyze operational data and give practical, specific advice to help food truck owners make more money and grow their business.

Your advice should be:
- Specific and actionable, not generic
- Based on the actual data provided
- Encouraging but honest
- Focused on revenue growth, customer acquisition, and operational efficiency
- Written in a friendly, coaching tone

IMPORTANT: Return ONLY a JSON object with this exact format, no markdown, no backticks:
{
  "summary": "A 1-2 sentence overall assessment",
  "score": 75,
  "insights": [
    {"title": "Insight title", "body": "Detailed insight text", "type": "tip|warning|win|idea", "icon": "emoji"},
    {"title": "Insight title", "body": "Detailed insight text", "type": "tip|warning|win|idea", "icon": "emoji"}
  ],
  "weeklyGoal": "A specific goal for this week"
}

Generate 4-6 insights. Types: "win" for things going well, "tip" for advice, "warning" for concerns, "idea" for new things to try. score is 1-100 overall health score.`;

  const userPrompt = `Analyze this food truck's data and provide growth insights:

Truck: ${truckName || 'Food Truck'}
Cuisine: ${cuisine || 'Not specified'}
Vibe: ${vibe || 'Not specified'}
Signature Dishes: ${signatureDishes || 'Not specified'}

Weekly Locations:
${locationList}

Recent Feedback (last 30 days):
${feedbackSummary}

Feedback Breakdown: ${feedbackCounts.great} great days, ${feedbackCounts.normal} normal days, ${feedbackCounts.slow} slow days

Activity Stats:
- ${totalPosts} social media posts created
- ${totalEvents} events discovered, ${bookedEvents} booked
- ${feedback?.length || 0} days of feedback logged

Give specific, actionable insights based on this data. If there's limited data, focus on getting-started advice and quick wins.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const rawContent = data.choices[0].message.content.trim();

    try {
      const parsed = JSON.parse(rawContent.replace(/```json|```/g, '').trim());
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({
        summary: 'Had trouble analyzing your data. Try again!',
        score: 50,
        insights: [],
        weeklyGoal: 'Log your daily feedback to help AI learn your patterns.',
      });
    }
  } catch (error) {
    console.error('Generate insights error:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}