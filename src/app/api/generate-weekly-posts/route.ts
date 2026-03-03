import { NextResponse } from 'next/server';

interface ServingDay {
  day: string;
  location: string;
  address: string;
}

export async function POST(request: Request) {
  const body = await request.json();
  const {
    truckName,
    cuisine,
    description,
    signatureDishes,
    vibe,
    priceRange,
    instagram,
    servingDays,
  } = body;

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  if (!servingDays || servingDays.length === 0) {
    return NextResponse.json({ error: 'No serving days provided' }, { status: 400 });
  }

  const systemPrompt = `You are a social media content strategist for food trucks. You create a full week of social media posts — 3 posts per serving day with different time slots and purposes.

For each serving day, generate exactly 3 posts:
1. "Morning Hype" — posted early morning to build anticipation. Tease the menu, share location, get people excited.
2. "Midday Live" — posted around lunch/serving time. We're here now, come get it, showing energy and urgency.
3. "Evening Recap" — posted after service. Thank customers, share highlights, tease tomorrow.

Each post should:
- Sound authentic, not corporate
- Use 3-5 emojis naturally
- Mention the specific location for that day
- Vary in tone and content across the week (don't repeat the same structure)
- Include 5-7 relevant hashtags
- Be tailored to the truck's cuisine and vibe
${instagram ? `- Tag ${instagram} when relevant` : ''}

IMPORTANT: Return ONLY a JSON array with this exact format, no markdown, no backticks:
[{"day": "Monday", "location": "Spot Name", "address": "Address", "posts": [{"time_slot": "Morning Hype", "caption": "caption text", "hashtags": "#tag1 #tag2"}, {"time_slot": "Midday Live", "caption": "caption text", "hashtags": "#tag1 #tag2"}, {"time_slot": "Evening Recap", "caption": "caption text", "hashtags": "#tag1 #tag2"}]}]`;

  const daysDescription = (servingDays as ServingDay[])
    .map((d) => `${d.day}: ${d.location} (${d.address})`)
    .join('\n');

  const userPrompt = `Create a full week of social media posts for this food truck:

Truck: ${truckName || 'Food Truck'}
Cuisine: ${cuisine || 'Not specified'}
Description: ${description || 'Not provided'}
Signature Dishes: ${signatureDishes || 'Not specified'}
Vibe: ${vibe || 'Casual'}
Price Range: ${priceRange || 'Not specified'}
${instagram ? `Instagram: ${instagram}` : ''}

Serving Schedule:
${daysDescription}

Generate 3 posts per day (Morning Hype, Midday Live, Evening Recap) for each serving day listed above. Make each post unique and engaging.`;

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
        temperature: 0.9,
        max_tokens: 3000,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const rawContent = data.choices[0].message.content.trim();

    try {
      const parsed = JSON.parse(rawContent.replace(/```json|```/g, '').trim());
      const withSavedFlag = parsed.map((day: any) => ({
        ...day,
        posts: day.posts.map((p: any) => ({ ...p, saved: false })),
      }));
      return NextResponse.json({ weeklyPosts: withSavedFlag });
    } catch {
      return NextResponse.json({ error: 'Failed to parse weekly posts' }, { status: 500 });
    }
  } catch (error) {
    console.error('Generate weekly posts error:', error);
    return NextResponse.json({ error: 'Failed to generate posts' }, { status: 500 });
  }
}