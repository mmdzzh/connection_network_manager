import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { run } from '../config/database';

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(__dirname, '../../uploads');

export async function resetData(_req: Request, res: Response, next: NextFunction) {
  try {
    await run('DELETE FROM relationships');
    await run('DELETE FROM persons');

    const avatarsDir = path.join(UPLOADS_DIR, 'avatars');
    if (fs.existsSync(avatarsDir)) {
      for (const file of fs.readdirSync(avatarsDir)) {
        fs.unlinkSync(path.join(avatarsDir, file));
      }
    }

    res.json({ success: true, message: '已清空所有数据' });
  } catch (err) {
    next(err);
  }
}
