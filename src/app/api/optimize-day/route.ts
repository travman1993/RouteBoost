import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkSubscriptionServer } from '@/lib/check-subscription-server';

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, day, locationName, locationAddress, truckName, businessType, cuisine, vibe } = body;

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const isActive = await checkSubscriptionServer(userId);
  if (!isActive) {
    return NextResponse.json({
      error: 'Your trial has expired. Subscribe to continue using route optimization.',
      subscriptionRequired: true,
    }, { status: 403 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Get recent feedback for this location to inform the insight
  const { data: feedback } = await supabase
    .from('daily_feedback')
    .select('rating, notes, date')
    .eq('truck_id', userId)
    .order('date', { ascending: false })
    .limit(14);

  const feedbackSummary = feedback && feedback.length > 0
    ? feedback.map((f: any) => `${f.date}: ${f.rating}${f.notes ? ' - ' + f.notes : ''}`).join('\n')
    : 'No feedback history yet';

  const systemPrompt = `You are a location performance analyst for mobile food businesses. You evaluate a scheduled location for a specific day and give an honest, actionable assessment.

Return ONLY a JSON object, no markdown, no backticks:
{
  "status": "good|medium|low",
  "insight": "1-2 sentences explaining why this location is good, medium, or low performing for this day. Be specific — mention the day, crowd type, or timing.",
  "alternative": null
}

If status is "medium" or "low", include an alternative spot:
{
  "status": "medium",
  "insight": "...",
  "alternative": {
    "name": "Suggested place name",
    "address": "Full address",
    "score": 82,
    "reasoning": "Why this is better"
  }
}

Status guide:
- good (score 75-100): Strong demand expected, good fit for their cuisine and vibe
- medium (score 50-74): Decent but there may be better options nearby
- low (score < 50): This spot likely underperforms on this day — suggest moving`;

  const userPrompt = `Evaluate this scheduled location for a mobile food business:

Business: ${truckName || 'Food Business'}
Business Type: ${businessType || 'Food Truck'}
Cuisine: ${cuisine || 'Not specified'}
Vibe: ${vibe || 'Casual'}

Day: ${day}
Scheduled Location: ${locationName}
Address: ${locationAddress}

Recent performance history:
${feedbackSummary}

Evaluate this location for ${day}. Consider: typical foot traffic patterns for this day, how well this location type matches their cuisine, and any patterns from their feedback history. If medium or low, suggest a real alternative location with a real address near the same area.`;

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
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const rawContent = data.choices[0].message.content.trim();

    try {
      let cleaned = rawContent.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const objMatch = cleaned.match(/\{[\s\S]*\}/);
      if (objMatch) cleaned = objMatch[0];
      const parsed = JSON.parse(cleaned);
      return NextResponse.json(parsed);
    } catch {
      console.error('Optimize day parse error:', rawContent.slice(0, 300));
      return NextResponse.json({ error: 'Failed to parse optimization result' }, { status: 500 });
    }
  } catch (error) {
    console.error('Optimize day error:', error);
    return NextResponse.json({ error: 'Failed to optimize day' }, { status: 500 });
  }
}
