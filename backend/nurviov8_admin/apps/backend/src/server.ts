import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { prisma } from './db/prisma';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import publicRoutes from './routes/publicRoutes';
import { apiLimiter } from './middlewares/rateLimit';
import { verifyAccessToken } from './utils/jwt';

const app = express();
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
});

let maintenanceCache: { enabled: boolean; ts: number } | null = null;
async function isMaintenance(): Promise<boolean> {
  if (env.nodeEnv === 'development') return false;
  const now = Date.now();
  if (maintenanceCache && now - maintenanceCache.ts < 5000) return maintenanceCache.enabled;
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'maintenance' } });
    const enabled = Boolean((setting?.value as any)?.enabled);
    maintenanceCache = { enabled, ts: now };
    return enabled;
  } catch {
    return false;
  }
}

app.use(async (req, res, next) => {
  const maintenance = await isMaintenance();
  if (!maintenance) return next();

  // Allow admins during maintenance
  try {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) {
      const token = auth.slice(7);
      const payload = verifyAccessToken(token);
      const roles = payload.roles || [];
      const isAdmin = roles.includes('ADMIN') || roles.includes('SUPERADMIN');
      if (isAdmin) return next();
    }
  } catch {}

  return res.status(503).json({ message: 'Maintenance mode' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/public', apiLimiter, publicRoutes);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(env.port, () => {
  console.log(`Backend listening on http://localhost:${env.port}`);
});