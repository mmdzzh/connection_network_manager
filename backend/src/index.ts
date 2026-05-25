import express from 'express';
import cors from 'cors';
import path from 'path';
import { initDb } from './config/database';
import personRoutes from './routes/person.routes';
import relationshipRoutes from './routes/relationship.routes';
import exportRoutes from './routes/export.routes';
import importRoutes from './routes/import.routes';
import resetRoutes from './routes/reset.routes';

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(__dirname, '../uploads');

export function createApp(staticDir?: string): express.Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/persons', personRoutes);
  app.use('/api/relationships', relationshipRoutes);
  app.use('/api/export', exportRoutes);
  app.use('/api/import', importRoutes);
  app.use('/api/reset', resetRoutes);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/uploads', express.static(UPLOADS_DIR));

  if (staticDir) {
    app.use(express.static(staticDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(staticDir, 'index.html'));
    });
  }

  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: err.message || '服务器内部错误',
    });
  });

  return app;
}

export async function startServer(port?: number, staticDir?: string): Promise<number> {
  await initDb();
  const app = createApp(staticDir);
  const preferredPort = port || 3001;

  return new Promise((resolve, reject) => {
    const tryListen = (p: number) => {
      const server = app.listen(p, () => {
        const addr = server.address();
        const usedPort = typeof addr === 'object' && addr ? addr.port : p;
        console.log(`Server running at http://localhost:${usedPort}`);
        resolve(usedPort);
      });
      server.on('error', (err: any) => {
        if (err.code === 'EADDRINUSE' && p !== 0) {
          console.log(`Port ${p} in use, trying random port...`);
          tryListen(0);
        } else {
          reject(err);
        }
      });
    };
    tryListen(preferredPort);
  });
}

// CLI 直接运行时启动
if (require.main === module) {
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : undefined;
  const staticDir = process.env.STATIC_DIR;
  startServer(port, staticDir).then((usedPort) => {
    if (process.send) {
      process.send({ type: 'ready', port: usedPort });
    }
  });
}
