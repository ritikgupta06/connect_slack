import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

type TeamRecord = {
  teamId: string;
  teamName: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
};

type Data = {
  teams: TeamRecord[];
};

const adapter = new JSONFile<Data>('db.json');
const db = new Low<Data>(adapter, { teams: [] });

await db.read();
db.data ||= { teams: [] };

export default db;
