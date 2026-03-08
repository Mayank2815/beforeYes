# BeforeYes

**Pre-Marriage Compatibility Intelligence Platform**

A privacy-first, session-based compatibility assessment for two partners. No accounts. No persistent storage. Results in 72 hours or they're gone.

BeforeYes generates a detailed compatibility report across emotional alignment, financial compatibility, and foundational life vision — backed by deterministic scoring and AI-generated narrative context.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                       │
│  Next.js 14 App Router · Tailwind · Recharts · Framer Motion│
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│                   NEXT.JS API ROUTES (Vercel)               │
│  /api/session  /api/quiz/:id  /api/payment/*  /api/report/* │
│  Validation (Zod) · Scoring Engine · Razorpay Integration   │
└────────────┬────────────────────────────┬───────────────────┘
             │ Admin SDK                  │ REST
┌────────────▼──────────────┐  ┌──────────▼──────────────────┐
│     FIRESTORE             │  │     RAZORPAY                │
│  sessions/{id}            │  │  Order creation             │
│  rateLimits/{ip}          │  │  Signature verification     │
└────────────┬──────────────┘  └─────────────────────────────┘
             │ Triggers
┌────────────▼──────────────────────────────────────────────┐
│              FIREBASE CLOUD FUNCTIONS (Gen 2)              │
│  onQuizComplete — backup scoring trigger                   │
│  generateReport — AI narrative + Puppeteer PDF             │
│  cleanupSessions — scheduled cleanup every 6 hours        │
└──────────────┬──────────────────────────┬─────────────────┘
               │ Claude API               │ Storage
┌──────────────▼───────────────┐  ┌───────▼───────────────┐
│     ANTHROPIC CLAUDE         │  │  FIREBASE STORAGE     │
│  claude-sonnet-4-6           │  │  pdfs/{id}/report.pdf │
│  Temperature 0               │  │  Signed URLs (7d)     │
│  Scores in → Text out        │  └───────────────────────┘
└──────────────────────────────┘
```

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | Next.js 14, TypeScript, Tailwind CSS |
| Forms       | React Hook Form v7 + Zod            |
| Charts      | Recharts v2                         |
| Animation   | Framer Motion v11                   |
| Database    | Firebase Firestore                  |
| Storage     | Firebase Storage                    |
| Functions   | Firebase Cloud Functions v2 (Node 20)|
| Payments    | Razorpay Standard Checkout          |
| AI          | Anthropic Claude (claude-sonnet-4-6) |
| PDF         | Puppeteer (headless Chrome)          |
| Deployment  | Vercel (frontend) + Firebase (functions) |

---

## Environment Variables

See `.env.example` for all required keys.

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_FIREBASE_*` | Client | Firebase project config |
| `FIREBASE_PROJECT_ID` | Server | Firebase admin credentials |
| `FIREBASE_CLIENT_EMAIL` | Server | Firebase service account |
| `FIREBASE_PRIVATE_KEY` | Server | Firebase private key (JSON escaped) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client | Razorpay publishable key |
| `RAZORPAY_KEY_ID` | Server | Razorpay key (server copy) |
| `RAZORPAY_SECRET` | Server | Razorpay secret — NEVER expose |
| `ANTHROPIC_API_KEY` | Server | Claude API key |
| `NEXT_PUBLIC_APP_BASE_URL` | Both | Production URL |

---

## Local Development

```bash
# 1. Clone and install
git clone https://github.com/yourorg/beforeyes.git
cd beforeyes
npm install
cd functions && npm install && cd ..

# 2. Configure environment
cp .env.example .env.local
# Fill in all values in .env.local

# 3. Start Firebase emulators
firebase emulators:start --only firestore,functions,storage

# 4. Start Next.js dev server
npm run dev
```

Visit `http://localhost:3000`

---

## Firebase Setup

```bash
# Install Firebase CLI
npm install -g firebase-tools
firebase login

# Initialize project
firebase init
# Select: Firestore, Functions, Storage, Emulators

# Deploy rules
firebase deploy --only firestore:rules
firebase deploy --only storage

# Set function secrets
firebase functions:secrets:set RAZORPAY_SECRET
firebase functions:secrets:set ANTHROPIC_API_KEY

# Deploy functions
cd functions && npm run build && cd ..
firebase deploy --only functions
```

---

## Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# https://vercel.com/your-team/beforeyes/settings/environment-variables
# Add all variables from .env.example
```

### Razorpay Webhook Setup

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add URL: `https://yourdomain.com/api/payment/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Copy the webhook secret and add to environment variables

---

## Scoring Engine

The scoring engine is **deterministic** — same inputs always produce the same scores. AI only explains scores, never calculates them.

**Score weights:**
- Overall = Foundational (35%) + Emotional (35%) + Financial (30%)

**Emotional score** = avg of:
- Core Values alignment (Q1–Q6): 30%
- Conflict Style compatibility (Q7–Q12): 30%
- Emotional Stability patterns (Q13–Q16): 20%
- Lifestyle Vision alignment (Q17–Q20): 20%

Compatibility is measured by `likertDiff(a, b)`: identical answers score 5, difference of 4 scores 0.

**Financial score** = weighted combination of DTI, income balance, savings buffer, spending compatibility, risk compatibility, and one-income stress simulation.

**Foundational score** = career alignment, location flexibility, family structure, cultural flexibility, kids timeline, and income bracket proximity.

---

## Privacy Commitments

- No user accounts or authentication required
- Session IDs are 21-character nanoid (126 bits entropy, unguessable)
- Sessions auto-expire after 72 hours via scheduled Cloud Function
- Partner names are **never** sent to the AI API
- All scoring is server-side — no score data in client JS beyond what's displayed
- PDF generated server-side, stored with signed URLs (7-day expiry)
- Razorpay signature verified server-side via HMAC-SHA256
- `RAZORPAY_SECRET` and `FIREBASE_PRIVATE_KEY` never referenced in client code
- Firestore rules prevent direct client writes to session documents
- No third-party analytics or advertising

---

## License

MIT License — see LICENSE file for details.

---

*BeforeYes is not a therapy service, relationship counseling platform, or professional advice tool. All reports are for informational and reflective purposes only.*
