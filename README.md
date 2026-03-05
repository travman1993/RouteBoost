# 🔥 RouteBoost

**AI-Powered Growth Assistant for Mobile Food Businesses**

RouteBoost helps food trucks, pop-ups, and catering businesses choose better locations, automate social media marketing, discover event bookings, and grow smarter with AI insights.

🌐 **Live at [routeboost.dev](https://routeboost.dev)**

---

## Features

**Today's Plan** — Daily command center with location confirmation, live weather with hourly forecast, demand predictions, and streak tracking.

**AI Post Creator** — Generate Instagram, Facebook, TikTok, and Twitter posts instantly using your truck profile. Custom prompts, save to library, copy to clipboard. Rate limited to 10 posts/day.

**Weekly Content Calendar** — Generate a full week of posts (Morning Hype, Midday Live, Evening Recap) for every serving day with one tap. Save all to your library.

**Events & Bookings** — AI scouts local festivals, breweries, markets, and corporate events. Generate booking pitches with one tap. Track status from interested → applied → booked.

**AI Insights** — Business health score, weekly goals, and categorized advice based on your feedback history, locations, and activity data.

**Location Scout & Heat Map** — AI recommends the best parking spots based on traffic, weather, time of day, and your cuisine. Interactive map with organic heat cloud overlays showing demand intensity.

**Profile Management** — Truck identity, cuisine, signature dishes, vibe & brand, social media links, weekly location management, and profile completion meter.

**Stripe Billing** — $25/month subscription with 7-day free trial. Customer portal for managing billing.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Auth & Database:** Supabase (Auth + PostgreSQL + RLS)
- **AI:** OpenAI GPT-4o-mini
- **Payments:** Stripe (Checkout, Customer Portal, Webhooks)
- **Weather:** OpenWeatherMap API
- **Geocoding:** Google Maps Geocoding API
- **Maps:** Leaflet + React-Leaflet
- **Deployment:** Vercel
- **Domain:** routeboost.dev

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── landing.module.css          # Landing styles
│   ├── legal.module.css            # Shared legal page styles
│   ├── layout.tsx                  # Root layout
│   ├── privacy/page.tsx            # Privacy policy
│   ├── terms/page.tsx              # Terms of service
│   ├── contact/page.tsx            # Contact page with FAQ
│   ├── auth/
│   │   ├── login/                  # Login page
│   │   ├── signup/                 # Signup page
│   │   ├── verify/                 # Email verification
│   │   └── callback/               # Auth callback handler
│   ├── onboarding/                 # 3-step onboarding flow
│   ├── dashboard/
│   │   ├── page.tsx                # Today's Plan (main dashboard)
│   │   ├── layout.tsx              # Bottom nav shell
│   │   ├── posts/                  # AI Post Creator
│   │   ├── weekly-posts/           # Weekly Content Calendar
│   │   ├── events/                 # Events & Bookings
│   │   ├── insights/               # AI Insights
│   │   ├── scout/                  # Location Scout & Heat Map
│   │   └── profile/                # Profile management & billing
│   └── api/
│       ├── weather/                # Weather API proxy
│       ├── generate-post/          # AI post generation
│       ├── generate-weekly-posts/  # Weekly calendar generation
│       ├── generate-events/        # AI event scouting
│       ├── generate-pitch/         # AI booking pitch
│       ├── generate-insights/      # AI business insights
│       ├── generate-locations/     # Location scout with geocoding
│       └── stripe/
│           ├── create-checkout/    # Stripe checkout session
│           ├── manage/             # Stripe customer portal
│           └── webhook/            # Stripe webhook handler
├── lib/
│   ├── supabase-browser.ts         # Client-side Supabase
│   ├── supabase-server.ts          # Server-side Supabase
│   ├── supabase-middleware.ts       # Auth middleware
│   └── check-subscription.ts       # Subscription status checker
├── styles/
│   └── globals.css                 # Global styles & design system
└── middleware.ts                    # Route protection
```

---

## Database Schema

**trucks** — User profiles (name, cuisine, description, signature dishes, vibe, social links, subscription status, Stripe IDs)

**locations** — Weekly serving locations (day, name, address, linked to truck)

**daily_feedback** — End-of-day ratings (great/normal/slow) with optional notes

**posts** — Saved AI-generated social media posts with platform, hashtags, scheduled dates

**events** — Saved event opportunities with status tracking (interested/applied/booked)

**ai_usage** — Daily AI generation tracking for rate limiting

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# OpenAI
OPENAI_API_KEY=

# Weather
WEATHER_API_KEY=

# Google Maps
GOOGLE_MAPS_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/your-username/RouteBoost.git
cd RouteBoost

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your API keys

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Design System

- **Primary:** `#FF5C00` (Flame)
- **Background:** `#0D0F14` (Night)
- **Cards:** `#1C1F2B` (Night Card)
- **Text:** `#FFF8F0` (Cream)
- **Accent:** `#00E89D` (Mint)
- **Muted:** `#8B8FA3` (Slate)
- **Display Font:** Syne (800 weight)
- **Body Font:** DM Sans

---

## License

Proprietary. All rights reserved.

© 2026 RouteBoost