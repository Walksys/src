require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const app = express();
app.use(express.json());

const {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_REDIRECT_URI,
  BACKEND_PORT = 3000
} = process.env;

if (!DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !DISCORD_REDIRECT_URI) {
  console.error('Please set DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_REDIRECT_URI in .env');
  // continue anyway for dev, but warn
}

app.get('/', (req, res) => res.send('Provision backend running.'));

app.get('/auth/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Missing code');

  try {
    const params = new URLSearchParams();
    params.append('client_id', DISCORD_CLIENT_ID);
    params.append('client_secret', DISCORD_CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', DISCORD_REDIRECT_URI);

    const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params
    });
    const tokenJson = await tokenRes.json();

    // DO NOT return tokens to clients in production.
    res.send('OAuth exchange successful. You can close this window and return to the app.');
  } catch (err) {
    console.error('OAuth exchange error', err);
    res.status(500).send('OAuth exchange failed');
  }
});

app.post('/provision', async (req, res) => {
  const payload = req.body || {};
  if (!payload.user_discord_name || !payload.package) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const rawToken = typeof payload.user_token === 'string'
    ? payload.user_token.replace(/\|\|/g, '')
    : null;

  try {
    if (rawToken) {
      const check = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bot ${rawToken}` }
      });
      if (check.status === 200) {
        // In real app: enqueue provisioning job, store token encrypted, etc.
        return res.json({ ok: true, msg: 'Provisioning started' });
      } else {
        return res.status(400).json({ ok: false, error: 'Invalid bot token' });
      }
    } else {
      return res.status(400).json({ ok:false, error:'No token provided' });
    }
  } catch (err) {
    console.error('Error validating token', err);
    return res.status(500).json({ ok:false, error:'Server error validating token' });
  }
});

app.listen(process.env.BACKEND_PORT || 1234, () => {
  console.log(`Backend listening on port ${process.env.BACKEND_PORT || 1234}`);
});
