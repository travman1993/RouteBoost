import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkSubscriptionServer } from '@/lib/check-subscription-server';

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return null;
  
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      const data = await res.json();
  
      if (data.status === 'OK' && data.results.length > 0) {
        const loc = data.results[0].geometry.location;
        return { lat: loc.lat, lng: loc.lng };
      }
      return null;
    } catch {
      return null;
    }
  }

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, truckName, businessType, cuisine, vibe, signatureDishes, priceRange, currentAddress } = body;

  if (!userId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const isActive = await checkSubscriptionServer(userId);
  if (!isActive) {
    return NextResponse.json({
      error: 'Your trial has expired. Subscribe to continue using Location Scout.',
      subscriptionRequired: true,
    }, { status: 403 });
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  const weatherKey = process.env.WEATHER_API_KEY;
  if (!openaiKey) {
    return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: feedback } = await supabase
    .from('daily_feedback')
    .select('rating, notes, date')
    .eq('truck_id', userId)
    .order('date', { ascending: false })
    .limit(14);

  const { data: locations } = await supabase
    .from('locations')
    .select('name, address, day_of_week')
    .eq('truck_id', userId);

  const feedbackSummary = feedback && feedback.length > 0
    ? feedback.map((f: any) => `${f.date}: ${f.rating}${f.notes ? ' - ' + f.notes : ''}`).join('\n')
    : 'No feedback history yet';

  const currentLocations = locations && locations.length > 0
    ? locations.map((l: any) => `${l.day_of_week}: ${l.name} (${l.address})`).join('\n')
    : 'No regular locations';

  const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const timeNow = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  let weatherInfo = '';
  if (currentAddress && weatherKey) {
    try {
      const coords = await geocodeAddress(currentAddress);
      if (coords) {
        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${coords.lat}&lon=${coords.lng}&units=imperial&appid=${weatherKey}`
        );
        const weatherData = await weatherRes.json();
        weatherInfo = `Current weather: ${Math.round(weatherData.main.temp)}°F, ${weatherData.weather[0].main}`;
      }
    } catch {
      weatherInfo = 'Weather unavailable';
    }
  }

  const systemPrompt = `You are a location strategist for mobile food businesses (food trucks, pop-ups, carts, and caterers) with deep knowledge of real-world businesses, traffic patterns, and commercial areas.

Your job is to recommend the top 5 spots for a mobile food business to set up TODAY based on real locations in the given area.

IMPORTANT LOCATION TYPES TO CONSIDER:
- Superstore parking lots (Walmart, Target, Costco, Home Depot, Lowe's)
- Shopping center parking lots and strip malls
- Downtown business districts and office parks
- College/university campuses
- Hospital and medical center areas
- Brewery and bar districts (evening)
- Parks, sports complexes, recreation centers
- Farmers markets and flea markets
- Industrial parks and warehouse districts (lunch)
- Churches (Sunday)
- Gas station clusters along busy highways
- Event venues

CRITICAL: For each recommendation you MUST provide:
- The REAL business name or landmark (e.g. "Walmart Supercenter", "Cartersville Downtown Square", "Target at Main Street Marketplace")
- A REAL full street address with city and state (e.g. "101 Market Place Blvd, Cartersville, GA 30121")
- The address MUST be accurate enough to geocode — this is critical for map placement

Do NOT make up addresses. Use real addresses for real businesses in the area.

Return ONLY a JSON object, no markdown, no backticks:
{
  "analysis": "2-3 sentence overview of demand patterns in this area right now",
  "recommendations": [
    {
      "name": "Real business or landmark name",
      "address": "Full real street address, City, State ZIP",
      "score": 85,
      "reasoning": "Why this spot is good right now",
      "crowd_type": "Who is there right now",
      "best_hours": "11:00 AM - 2:00 PM",
      "type": "superstore|shopping|office|campus|medical|brewery|park|event|industrial|residential"
    }
  ]
}

Generate exactly 5 recommendations sorted by score (highest first). At least one should be a superstore/big box retail location.`;

  const userPrompt = `Recommend the 5 best spots RIGHT NOW for this mobile food business:

Business Name: ${truckName || 'Food Business'}
Business Type: ${businessType || 'Food Truck'}
Cuisine: ${cuisine || 'Not specified'}
Vibe: ${vibe || 'Casual'}
Signature Dishes: ${signatureDishes || 'Not specified'}
Price Range: ${priceRange || 'Not specified'}
Day: ${dayName}
Current Time: ${timeNow}
${weatherInfo}

Operating area: ${currentAddress || 'Not specified'}

Their regular locations:
${currentLocations}

Recent performance:
${feedbackSummary}

Find 5 REAL locations with REAL street addresses near this area. The addresses must be accurate — they will be geocoded for map placement. Include at least one superstore like Walmart or Target if any exist nearby.`;

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
        max_tokens: 2000,
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    const rawContent = data.choices[0].message.content.trim();

    let parsed;
    try {
      parsed = JSON.parse(rawContent.replace(/```json|```/g, '').trim());
    } catch {
      return NextResponse.json({ error: 'Failed to parse location data' }, { status: 500 });
    }

    // Geocode every address for accurate map placement
    if (parsed.recommendations && weatherKey) {
      const geocoded = await Promise.all(
        parsed.recommendations.map(async (spot: any) => {
          // Try geocoding the full address
          let coords = await geocodeAddress(spot.address);

          // If that fails, try business name + city
      if (!coords && spot.name) {
        const cityMatch = currentAddress.match(/([A-Za-z\s]+),?\s*([A-Z]{2})/);
        if (cityMatch) {
          coords = await geocodeAddress(`${spot.name}, ${cityMatch[1].trim()}, ${cityMatch[2]}`);
        }
      }

      // If still no coords, try just the street + city from the address
      if (!coords) {
        const parts = spot.address.split(',');
        if (parts.length >= 2) {
          coords = await geocodeAddress(parts.slice(0, 2).join(',').trim());
        }
      }

      // Last resort — try just the business name near the area
      if (!coords && spot.name) {
        coords = await geocodeAddress(`${spot.name} near ${currentAddress}`);
      }

          return {
            ...spot,
            lat: coords?.lat || 0,
            lng: coords?.lng || 0,
            geocoded: !!coords,
          };
        })
      );

      // Filter out any that completely failed to geocode
      parsed.recommendations = geocoded.filter((s: any) => s.lat !== 0 && s.lng !== 0);

      if (parsed.recommendations.length === 0) {
        return NextResponse.json({
          error: 'Could not map locations for this address. Try a more specific address in your profile (include city and state).',
        }, { status: 422 });
      }
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Generate locations error:', error);
    return NextResponse.json({ error: 'Failed to generate locations' }, { status: 500 });
  }
}