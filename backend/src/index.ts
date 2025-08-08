import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';

import authRouter     from './routes/auth.js';
import messagesRouter from './routes/messages.js';
import channelsRouter from './routes/channels.js';
import healthRouter   from './routes/health.js';

const app  = express();
const PORT = Number(process.env.PORT ?? 4000);

// --- CORS -------------------------------------------------
const whitelist = (process.env.FRONTEND_WHITELIST ?? '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);                 // remove empty strings

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || whitelist.includes(origin)) return cb(null, true);
    cb(new Error(`CORS not allowed for ${origin}`));
  },
  credentials: true,
}));

// --- Middleware ------------------------------------------
app.use(express.json());
app.use(session({
  name: 'sc_session',
  secret: process.env.SESSION_SECRET ?? 'insecure',
  resave: false,
  saveUninitialized: false,
  cookie: {
    domain: 'local.itshivam.in',   // optional but explicit
    sameSite: 'none',              // MUST be 'none'
    secure: false                   // MUST be true on HTTPS
  }
}));


// --- Routes ----------------------------------------------
app.use('/auth',     authRouter);
app.use('/messages', messagesRouter);
app.use('/channels', channelsRouter);
app.use('/',         healthRouter);

app.listen(PORT, () => {
  console.log(`🚀  API listening on http://localhost:${PORT}`);
});
