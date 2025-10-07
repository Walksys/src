# Discord Provision Frontend + Backend (ZIP)
This archive contains a minimal **frontend** (static `index.html`) and a minimal **backend** (`server.js`) to safely handle Discord OAuth code exchanges and accept provisioning requests from the frontend.

**IMPORTANT SECURITY REMINDERS**
- Do NOT store `DISCORD_CLIENT_SECRET` or Bot tokens in frontend code.
- Regenerate your Client Secret & Bot Token immediately if they were exposed.
- Store secrets in a server `.env` file (not committed to git) and protect the server.

## What's included
- `index.html` — Frontend single-file app. Edit `BACKEND_WEBHOOK_URL` inside the file to point to your backend (e.g., https://yourdomain.com/provision).
- `server.js` — Node.js (Express) backend example that:
  - handles `/auth/callback` to exchange authorization code for tokens (server-side, uses CLIENT_SECRET)
  - accepts `POST /provision` with payload `{ user_discord_name, package, user_token }` and validates the bot token before returning success.
- `.env.example` — example env file. Copy to `.env` and fill values.
- `package.json` — dependencies and start script.

## Quick start (local)
1. Copy `.env.example` → `.env` and fill `DISCORD_CLIENT_SECRET` and other values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the backend:
   ```bash
   node server.js
   ```
4. Open `index.html` in a browser (or serve it with a static server). Edit `BACKEND_WEBHOOK_URL` in `index.html` to point at your backend (e.g., http://localhost:3000/provision).
5. (Optional) Use ngrok for a public URL and set your Discord app's Redirect URI to `https://<ngrok-id>.ngrok.io/auth/callback`.

## Notes
- This example is intentionally simple for demonstration and testing.
- In production, always:
  - Use HTTPS
  - Encrypt stored tokens
  - Avoid storing long-lived tokens in localStorage
  - Rate-limit and validate incoming requests
