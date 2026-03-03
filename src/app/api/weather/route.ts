import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  const apiKey = process.env.WEATHER_API_KEY;

  try {
    const queries: string[] = [address];

    const noZip = address.replace(/\b\d{5}(-\d{4})?\b/, '').trim();
    if (noZip !== address) queries.push(noZip);

    const cityStateMatch = address.match(/(?:street|st|ave|avenue|blvd|boulevard|rd|road|dr|drive|ln|lane|way|ct|court|pl|place)\s*,?\s*(.+)/i);
    if (cityStateMatch) {
      const cityState = cityStateMatch[1].replace(/\b\d{5}(-\d{4})?\b/, '').trim();
      queries.push(cityState);
    }

    const afterStreet = address.replace(/^\d+\s+\S+\s+(street|st|ave|avenue|blvd|rd|road|dr|drive|ln|lane|way|ct|pl)\s*/i, '').replace(/\b\d{5}(-\d{4})?\b/, '').trim();
    if (afterStreet !== address) queries.push(afterStreet);

    const words = address.replace(/\b\d{5}(-\d{4})?\b/, '').replace(/[,]/g, ' ').split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      queries.push(words.slice(-2).join(' '));
      if (words.length >= 3) {
        queries.push(words.slice(-3).join(' '));
      }
    }

    let lat = 0;
    let lon = 0;
    let found = false;

    for (const query of queries) {
      if (!query || query.length < 2) continue;
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=1&appid=${apiKey}`
      );
      const geoData = await geoRes.json();

      if (geoData && geoData.length > 0) {
        lat = geoData[0].lat;
        lon = geoData[0].lon;
        found = true;
        break;
      }
    }

    if (!found) {
      return NextResponse.json({
        temp: '--',
        condition: 'Unknown',
        description: 'Could not find location',
        icon: '01d',
        humidity: 0,
        wind: 0,
        feelsLike: '--',
        forecast: [],
      });
    }

    // Current weather
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
    );
    const weatherData = await weatherRes.json();

    // 3-hour forecast (free tier)
    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&cnt=6&appid=${apiKey}`
    );
    const forecastData = await forecastRes.json();

    const forecast = forecastData.list?.map((item: any) => ({
      time: new Date(item.dt * 1000).toLocaleTimeString('en-US', {
        hour: 'numeric',
        hour12: true,
      }),
      temp: Math.round(item.main.temp),
      icon: item.weather[0].icon,
      condition: item.weather[0].main,
    })) || [];

    return NextResponse.json({
      temp: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].main,
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      humidity: weatherData.main.humidity,
      wind: Math.round(weatherData.wind.speed),
      feelsLike: Math.round(weatherData.main.feels_like),
      forecast,
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json({
      temp: '--',
      condition: 'Unavailable',
      description: 'Weather service error',
      icon: '01d',
      humidity: 0,
      wind: 0,
      feelsLike: '--',
      forecast: [],
    });
  }
}