# W or L Tribunal 👑
### No cap. No mercy.

A viral Gen Z hype rater powered by Claude AI. Drop anything — a fit, a decision, a situation — and the Tribunal judges it: **S TIER / W / MID / L / COOKED**.

---

## Project Structure

```
tribunal/
├── api/
│   └── rate.js          ← Vercel serverless proxy (calls Anthropic)
├── frontend/
│   └── index.html       ← Full frontend (HTML/JS, no build step)
├── vercel.json          ← Routing config
├── package.json
└── README.md
```

---

## Deploy in 5 Minutes (Vercel)

### 1. Get your Anthropic API key
Go to https://console.anthropic.com → API Keys → Create Key  
Copy it somewhere safe.

### 2. Install Vercel CLI
```bash
npm install -g vercel
```

### 3. Deploy
```bash
cd tribunal
vercel
```
Follow the prompts:
- Link to existing project? **No**
- Project name: `worltribunal` (or whatever)
- Root directory: `.`
- Override settings? **No**

### 4. Add your API key as an env var
```bash
vercel env add ANTHROPIC_API_KEY
```
Paste your key when prompted. Select **Production**, **Preview**, and **Development**.

### 5. Redeploy with the env var
```bash
vercel --prod
```

Your app is live at `https://worltribunal.vercel.app` 🎉

---

## Add a Custom Domain (optional but 🔥)

1. Buy `worltribunal.com` on Namecheap/GoDaddy (~$10/yr)
2. In Vercel dashboard → Your project → Settings → Domains
3. Add your domain, follow the DNS instructions (takes ~5 mins to propagate)

---

## How It Works

```
User types something
        ↓
frontend/index.html  →  POST /api/rate  →  api/rate.js
                                                ↓
                                    Anthropic API (Claude Haiku)
                                                ↓
                                     JSON verdict returned
                                                ↓
                              frontend renders result + share card
```

The backend (`api/rate.js`) is a thin proxy — it:
1. Receives the user's input
2. Adds the system prompt (the Tribunal persona)
3. Calls Claude Haiku (fast + cheap — ~$0.001 per rating)
4. Returns the JSON verdict

If the API is unavailable, the frontend falls back to the local keyword engine automatically.

---

## Cost Estimate

Claude Haiku pricing: ~$0.80 per million input tokens  
Each request: ~400 tokens in + ~150 tokens out = ~$0.0005 per rating

| Daily ratings | Monthly cost |
|--------------|-------------|
| 1,000        | ~$0.45      |
| 10,000       | ~$4.50      |
| 100,000      | ~$45        |

Vercel: **Free** up to 100k requests/month

---

## Monetisation Path

1. **AdSense** — add a banner below the result card. ~$1-3 RPM.
2. **Premium tier** — remove ads, unlock history, custom card themes.
3. **Brand deals** — energy drinks, streetwear, gaming peripherals want Gen Z reach.
4. **White-label** — sell branded versions to festivals, sports teams, universities.

---

## Rate Limiting (add this before going viral)

To prevent abuse/cost blowout, add to `api/rate.js`:

```javascript
// Simple IP-based rate limit — 20 requests per IP per hour
// Use Vercel KV (free tier) or Upstash Redis for persistence
```

Or use Vercel's built-in Edge Rate Limiting (Pro plan).

---

## Local Development

```bash
npm install
vercel dev
```

Open http://localhost:3000

---

*Built with Claude · Deployed on Vercel · No cap, no mercy*
