import { Router } from 'express';
import { WebClient } from '@slack/web-api';
import { nanoid } from 'nanoid';
import db from '../db.js';
import { storeToken } from '../services/tokenService.js';

const router = Router();

const CLIENT_ID     = process.env.SLACK_CLIENT_ID!;
const CLIENT_SECRET = process.env.SLACK_CLIENT_SECRET!;
const REDIRECT_URI  = process.env.SLACK_REDIRECT_URI!;
const FRONTEND_BASE = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';

/* ───────────────────────────────────────────────────────────
 * 1️⃣  Build & return Slack OAuth URL
 *     GET /auth/slack/authorize
 * ─────────────────────────────────────────────────────────── */
router.get('/slack/authorize', async (req, res) => {
  const state = nanoid();
  req.session.state = state;

  const url = new URL('https://slack.com/oauth/v2/authorize');
  url.searchParams.set('client_id',    CLIENT_ID);
  url.searchParams.set('scope',        'chat:write,channels:read');
  url.searchParams.set('redirect_uri', REDIRECT_URI);
  url.searchParams.set('state',        state);

  res.json({ url: url.toString() });
});

/* ───────────────────────────────────────────────────────────
 * 2️⃣  OAuth callback – code → token
 *     GET /auth/slack/callback
 * ─────────────────────────────────────────────────────────── */
router.get('/slack/callback', async (req, res) => {
  const { code, state } = req.query as Record<string, string>;

  if (!code || !state || state !== req.session.state) {
    return res.status(400).send('State mismatch');
  }

  const web  = new WebClient();
  const resp = await web.oauth.v2.access({
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    redirect_uri:  REDIRECT_URI,
  } as any);

  if (!resp.ok || !resp.access_token || !resp.team) {
    console.error(resp);
    return res.status(500).send('OAuth exchange failed');
  }

  await storeToken({
    teamId:      resp.team!.id!,
    teamName:    resp.team!.name!,
    accessToken: resp.access_token!,
    refreshToken: resp.refresh_token as string | undefined,
    expiresIn:    resp.expires_in   as number  | undefined,
  });

  req.session.teamId = resp.team!.id!;
  await new Promise(resolve => req.session.save(resolve));

  // Redirect back to UI (supports popup flow)
  if (req.query.popup === '1') {
    return res.send(`
      <html><body>
        <script>
          if (window.opener) {
            window.opener.location.href = '${FRONTEND_BASE}/dashboard';
            window.close();
          } else {
            location.href='${FRONTEND_BASE}/dashboard';
          }
        </script>
      </body></html>`);
  }

  res.redirect(302, `${FRONTEND_BASE}/dashboard`);
});

/* ───────────────────────────────────────────────────────────
 * 3️⃣  Session helper routes
 * ─────────────────────────────────────────────────────────── */
router.get('/me', async (req, res) => {
  if (!req.session.teamId) return res.status(401).json({ error: 'unauthorized' });

  await db.read();
  const team = db.data!.teams.find(t => t.teamId === req.session.teamId);
  if (!team) return res.status(404).json({ error: 'not_found' });

  res.json({ teamId: team.teamId, teamName: team.teamName });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

export default router;
