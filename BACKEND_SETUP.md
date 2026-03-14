# Photo & contact form backend (free)

The estimate form (with photo uploads) and contact form send data to **your email** via a small backend that runs on **Vercel** (free tier). Your code stays on **GitHub**; Vercel deploys from the same repo.

## How it works

- **Estimates page**: User submits name, email, VIN, message, and up to 4 photos → emailed to you. (Keep total upload under ~4 MB so the request fits Vercel’s limit.)
- **Contact page**: User submits name, email, message → emailed to you.
- No paid form service; only free tiers: **Vercel** (hosting + serverless) and **Resend** (email).

## 1. Get a Resend API key (free)

1. Sign up at [resend.com](https://resend.com).
2. Create an API key: [resend.com/api-keys](https://resend.com/api-keys).
3. Copy the key (starts with `re_`).  
   Free tier: 3,000 emails/month; you can send from `onboarding@resend.dev` or add your own domain later.

## 2. Deploy to Vercel (free) — site stays on GitHub Pages

1. Push this repo to GitHub (if it isn’t already).
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. **Add New Project** → import this repository (same repo as your GitHub Pages site).
4. **Framework Preset:** leave as “Other” or “None”. **Root Directory:** leave blank. **Build Command:** leave blank (static site + API only).
5. **Before clicking Deploy**, open **Environment Variables** and add:

   | Name              | Value                    | Notes                          |
   |-------------------|--------------------------|--------------------------------|
   | `RESEND_API_KEY`  | `re_xxxxxxxxxxxx`        | Your new Resend API key        |
   | `RECIPIENT_EMAIL` | `your@email.com`        | Where estimate & contact go    |
   | `ESTIMATE_EMAIL`  | (optional) `estimates@…` | Override for estimates only   |
   | `CONTACT_EMAIL`   | (optional) `contact@…`  | Override for contact only     |
   | `FROM_EMAIL`      | (optional) `Name <you@…>`| Sender; default uses Resend   |

6. Click **Deploy**. When it finishes, Vercel shows a URL like `https://petersbodyshop-xxxx.vercel.app` — copy it.
7. In your repo, edit **estimates.html** and **contact.html**: find `data-api-base="https://YOUR-PROJECT.vercel.app"` and replace `YOUR-PROJECT` with your real Vercel URL (e.g. `data-api-base="https://petersbodyshop-abc123.vercel.app"`). Commit and push so GitHub Pages uses the updated forms.

## 3. Use the backend

- **If the site is deployed on Vercel**  
  The forms already point to `/api/send-estimate` and `/api/send-contact`. No extra config.

- **If the site stays on GitHub Pages**  
  Point the forms at your Vercel API by setting the API base on each form, e.g. in `estimates.html` and `contact.html`:

  ```html
  <form ... data-api-base="https://your-project.vercel.app" data-api-url="/api/send-estimate">
  ```

  Replace `https://your-project.vercel.app` with your real Vercel URL.

## 4. Optional: custom “From” address

- To use your own domain as sender, add and verify it in [Resend Domains](https://resend.com/domains), then set `FROM_EMAIL` (e.g. `Peters Body Shop <info@yourdomain.com>`).

## Files added

- `api/send-estimate.js` – serverless handler for the estimate form (with file uploads).
- `api/send-contact.js` – serverless handler for the contact form.
- `package.json` – dependency: `resend`.
- `vercel.json` – function timeouts for the API routes.

The estimate and contact forms in the HTML/JS now submit to these APIs instead of a third-party form service.
