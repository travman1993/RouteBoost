import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const DAILY_POST_LIMIT = 10;

export async function POST(request: Request) {
  const body = await request.json();
  const {
    truckName,
    cuisine,
    description,
    signatureDishes,
    vibe,
    priceRange,
    locationName,
    locationAddress,
    platform,
    weather,
    dayOfWeek,
    customPrompt,
    userId,
  } = body;

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  // Check rate limit
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (userId) {
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('ai_usage')
      .select('*', { count: 'exact', head: true })
      .eq('truck_id', userId)
      .eq('action_type', 'post_generation')
      .eq('date', today);

    if (count !== null && count >= DAILY_POST_LIMIT) {
      return NextResponse.json({
        error: `Daily limit reached (${DAILY_POST_LIMIT} posts per day). Try again tomorrow!`,
        limitReached: true,
      }, { status: 429 });
    }

    // Log this usage
    await supabase.from('ai_usage').insert({
      truck_id: userId,
      action_type: 'post_generation',
      date: today,
    });
  }

  const systemPrompt = `You are a social media marketing expert for food trucks. You write engaging, authentic social media posts that drive foot traffic. 

Your style rules:
- Sound like a real food truck owner, not a corporation
- Use emojis naturally but don't overdo it (3-5 per post)
- Include a clear call-to-action (come find us, stop by, etc.)
- Mention the location so people know where to go
- Highlight signature dishes when relevant
- Keep it concise and punchy — people scroll fast
- Match the truck's vibe and personality
- Generate 5-8 relevant hashtags at the end

IMPORTANT: Return ONLY a JSON object with this exact format, no markdown, no backticks:
{"caption": "your caption text here", "hashtags": "#hashtag1 #hashtag2 #hashtag3"}`;

  const userPrompt = `Generate a ${platform || 'Instagram'} post for this food truck:

Truck Name: ${truckName || 'Food Truck'}
Cuisine: ${cuisine || 'Not specified'}
Description: ${description || 'Not provided'}
Signature Dishes: ${signatureDishes || 'Not specified'}
Vibe: ${vibe || 'Casual'}
Price Range: ${priceRange || 'Not specified'}
Today's Location: ${locationName || 'Not specified'}${locationAddress ? ` (${locationAddress})` : ''}
Day: ${dayOfWeek || 'Today'}
${weather ? `Weather: ${weather.temp}°F, ${weather.condition}` : ''}
${customPrompt ? `Special instructions: ${customPrompt}` : ''}

Write a post that makes people hungry and want to come find this truck today.`;

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
        temperature: 0.85,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error('OpenAI error:', data.error);
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const rawContent = data.choices[0].message.content.trim();

    try {
      const parsed = JSON.parse(rawContent.replace(/```json|```/g, '').trim());
      return NextResponse.json({
        caption: parsed.caption,
        hashtags: parsed.hashtags,
      });
    } catch {
      return NextResponse.json({
        caption: rawContent,
        hashtags: '',
      });
    }
  } catch (error) {
    console.error('Generate post error:', error);
    return NextResponse.json({ error: 'Failed to generate post' }, { status: 500 });
  }
}