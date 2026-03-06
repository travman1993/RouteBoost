import { NextResponse } from 'next/server';
import { checkSubscriptionServer } from '@/lib/check-subscription-server';

export async function POST(request: Request) {
  const body = await request.json();
  const { truckName, businessType, cuisine, vibe, locationAddress, userId } = body;

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const isActive = await checkSubscriptionServer(userId);
  if (!isActive) {
    return NextResponse.json({
      error: 'Your trial has expired. Subscribe to continue scouting events.',
      subscriptionRequired: true,
    }, { status: 403 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  const systemPrompt = `You are a local event scout for mobile food businesses (food trucks, pop-ups, carts, and caterers). You find realistic booking opportunities based on the truck's location and cuisine type.

Generate 5 realistic event opportunities. These should be the types of events that actually exist in or near the given area — farmers markets, brewery taproom nights, corporate lunch catering, festivals, neighborhood block parties, private events, sports watch parties, etc.

Make them feel real and specific to the area. Include a mix of recurring weekly events and one-time opportunities.

IMPORTANT: Return ONLY a JSON array with this exact format, no markdown, no backticks:
[{"title": "Event Name", "description": "Brief description of the opportunity", "location": "Venue or area name", "date_text": "When it happens (e.g. Every Saturday, March 15, Weekly)", "event_type": "market|festival|brewery|corporate|private|community", "fit_score": 85}]

fit_score is 1-100 representing how good a fit this event is for the truck's cuisine and vibe.`;

  const userPrompt = `Find event and booking opportunities for this mobile food business:

Business Name: ${truckName || 'Food Business'}
Business Type: ${businessType || 'Food Truck'}
Cuisine: ${cuisine || 'Not specified'}
Vibe: ${vibe || 'Casual'}
Area: ${locationAddress || 'Not specified'}

Generate 5 realistic, specific event opportunities near this area that would be good fits for this business type and cuisine.`;

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
      return NextResponse.json({ events: parsed });
    } catch {
      return NextResponse.json({ events: [], error: 'Failed to parse events' });
    }
  } catch (error) {
    console.error('Generate events error:', error);
    return NextResponse.json({ error: 'Failed to generate events' }, { status: 500 });
  }
}