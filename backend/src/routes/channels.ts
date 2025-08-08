import { Router } from 'express';
import requireAuth from '../middleware/requireAuth.js';
import { getToken } from '../services/tokenService.js';
import { WebClient } from '@slack/web-api';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const teamId = req.session.teamId as string;
  const token = await getToken(teamId);
  if (!token) return res.status(404).json({ error: 'workspace_not_connected' });

  const client = new WebClient(token);
  const resp = await client.conversations.list({ limit: 1000 });
  res.json(resp.channels);
});

export default router;
