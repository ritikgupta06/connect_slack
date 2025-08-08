import db from '../db.js';
import { WebClient } from '@slack/web-api';

export async function getToken(teamId: string): Promise<string | null> {
  await db.read();
  const team = db.data!.teams.find(t => t.teamId === teamId);
  if (!team) return null;

  // if token has expiry and is about to expire, refresh (exercise left as comment)
  if (team.expiresAt && Date.now() > team.expiresAt - 30000 && team.refreshToken) {
    // TODO: implement refresh with slack oauth.v2.access using refresh_token
  }
  return team.accessToken;
}

export async function storeToken(record: {
  teamId: string;
  teamName: string;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}) {
  await db.read();
  const idx = db.data!.teams.findIndex(t => t.teamId === record.teamId);
  const expiresAt = record.expiresIn ? Date.now() + record.expiresIn * 1000 : undefined;
  const newRec = { ...record, expiresAt };
  if (idx >= 0) db.data!.teams[idx] = newRec;
  else db.data!.teams.push(newRec);
  await db.write();
}
