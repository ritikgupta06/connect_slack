import { Router } from 'express';
import { WebClient } from '@slack/web-api';
import requireAuth from '../middleware/requireAuth.js';
import { getToken } from '../services/tokenService.js';
import schedule from 'node-schedule';
import { nanoid } from 'nanoid';
import db from '../db.js';

const router = Router();

type JobRecord = {
  id: string;
  teamId: string;
  channel: string;
  text: string;
  postAt: number;
};

const jobs: Record<string, schedule.Job> = {};

function scheduleMessage(rec: JobRecord, token: string) {
  const client = new WebClient(token);
  const date = new Date(rec.postAt * 1000);
  const job = schedule.scheduleJob(rec.id, date, async () => {
    await client.chat.postMessage({ channel: rec.channel, text: rec.text });
    delete jobs[rec.id];
  });
  jobs[rec.id] = job;
}

router.use(requireAuth);

router.post('/send', async (req, res) => {
  const { channel, text } = req.body as { channel: string; text: string };
  const teamId = req.session.teamId as string;
  const token = await getToken(teamId);
  if (!token) return res.status(404).json({ error: 'workspace_not_connected' });

  const client = new WebClient(token);
  const resp = await client.chat.postMessage({ channel, text });
  res.json({ ok: resp.ok, ts: resp.ts, channel: resp.channel });
});

router.post('/schedule', async (req, res) => {
  const { channel, text, postAt } = req.body as { channel: string; text: string; postAt: number };
  const teamId = req.session.teamId as string;
  const token = await getToken(teamId);
  if (!token) return res.status(404).json({ error: 'workspace_not_connected' });

  const id = nanoid();
  scheduleMessage({ id, teamId, channel, text, postAt }, token);
  res.json({ ok: true, jobId: id });
});

router.get('/schedule', async (req, res) => {
  const teamId = req.session.teamId as string;
  const pending = Object.values(jobs)
    .filter(j => (j as any).teamId === teamId)
    .map(j => ({ id: j.name, next: j.nextInvocation() }));
  res.json(pending);
});

router.delete('/schedule/:id', async (req, res) => {
  const id = req.params.id;
  const job = jobs[id];
  if (job) {
    job.cancel();
    delete jobs[id];
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: 'job_not_found' });
  }
});

export default router;
