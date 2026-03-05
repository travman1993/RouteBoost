import { NextResponse } from 'next/server';
import { checkSubscriptionServer } from '@/lib/check-subscription-server';

export async function POST(request: Request) {
  const body = await request.json();
  const { truckName, cuisine, description, signatureDishes, vibe, eventTitle, eventDescription, eventLocation, userId } = body;

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const isActive = await checkSubscriptionServer(userId);
  if (!isActive) {
    return NextResponse.json({
      error: 'Your trial has expired. Subscribe to continue generating pitches.',
      subscriptionRequired: true,
    }, { status: 403 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  const systemPrompt = `You are a booking pitch writer for food trucks. You write professional but friendly emails/messages to event organizers to pitch a food truck's participation.

Your pitches should:
- Be concise (under 150 words)
- Sound professional but warm, not corporate
- Highlight what makes this truck a great fit for the event
- Mention specific dishes that would work well
- Include a clear call to action
- Feel personalized to the specific event

Write the pitch as a ready-to-send message. Do not include subject lines or email headers.`;

  const userPrompt = `Write a booking pitch for this food truck to this event:

Truck: ${truckName || 'Food Truck'}
Cuisine: ${cuisine || 'Not specified'}
Description: ${description || 'Not provided'}
Signature Dishes: ${signatureDishes || 'Not specified'}
Vibe: ${vibe || 'Casual'}

Event: ${eventTitle}
Event Details: ${eventDescription || 'No details'}
Event Location: ${eventLocation || 'Not specified'}`;

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
        max_tokens: 400,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    return NextResponse.json({
      pitch: data.choices[0].message.content.trim(),
    });
  } catch (error) {
    console.error('Generate pitch error:', error);
    return NextResponse.json({ error: 'Failed to generate pitch' }, { status: 500 });
  }
}