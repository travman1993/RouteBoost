import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 });
  }

  const apiKey = process.env.WEATHER_API_KEY;

  try {
    // First, geocode the address to get coordinates
    const geoRes = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(address)}&limit=1&appid=${apiKey}`
    );
    const geoData = await geoRes.json();

    if (!geoData || geoData.length === 0) {
      return NextResponse.json({
        temp: '--',
        condition: 'Unknown',
        icon: '01d',
        humidity: 0,
        wind: 0,
      });
    }

    const { lat, lon } = geoData[0];

    // Then fetch weather for those coordinates
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
    );
    const weatherData = await weatherRes.json();

    return NextResponse.json({
      temp: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].main,
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      humidity: weatherData.main.humidity,
      wind: Math.round(weatherData.wind.speed),
      feelsLike: Math.round(weatherData.main.feels_like),
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json({
      temp: '--',
      condition: 'Unavailable',
      icon: '01d',
      humidity: 0,
      wind: 0,
    });
  }
}