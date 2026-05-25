import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import * as personModel from '../models/person.model';
import * as relationshipModel from '../models/relationship.model';
import { run } from '../config/database';

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(__dirname, '../../uploads');

function decodeBase64Avatar(base64Str: string): { ext: string; buffer: Buffer } | null {
  const match = base64Str.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!match) return null;
  return { ext: match[1], buffer: Buffer.from(match[2], 'base64') };
}

export async function importData(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body;

    if (!data.persons || !Array.isArray(data.persons)) {
      res.status(400).json({ success: false, message: '数据格式错误：缺少 persons 数组' });
      return;
    }

    // 清空现有数据（外键级联会自动删除关系）
    await run('DELETE FROM relationships');
    await run('DELETE FROM persons');

    // 清理旧头像文件
    const avatarsDir = path.join(UPLOADS_DIR, 'avatars');
    if (fs.existsSync(avatarsDir)) {
      for (const file of fs.readdirSync(avatarsDir)) {
        fs.unlinkSync(path.join(avatarsDir, file));
      }
    }

    const nameToId = new Map<string, number>();

    // 创建人员
    for (const p of data.persons) {
      const avatarValue: string | undefined =
        typeof p.avatar === 'string' && p.avatar.startsWith('#') ? p.avatar : undefined;

      const person = await personModel.create({
        name: String(p.name),
        avatar: avatarValue,
        description: p.description ? String(p.description) : undefined,
      });

      // 处理 base64 图片头像
      if (typeof p.avatar === 'string' && p.avatar.startsWith('data:')) {
        const decoded = decodeBase64Avatar(p.avatar);
        if (decoded) {
          const filename = `avatar-${person.id}-${Date.now()}.${decoded.ext}`;
          const filePath = path.join(UPLOADS_DIR, 'avatars', filename);
          fs.mkdirSync(path.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, decoded.buffer);
          await personModel.update(person.id, {
            avatar: `/uploads/avatars/${filename}`,
          });
        }
      }

      nameToId.set(String(p.name), person.id);
    }

    // 创建关系
    if (data.relationships && Array.isArray(data.relationships)) {
      for (const rel of data.relationships) {
        const fromId = nameToId.get(String(rel.from_name));
        const toId = nameToId.get(String(rel.to_name));
        if (fromId && toId && fromId !== toId) {
          const existing = await relationshipModel.findByPersonIds(fromId, toId);
          if (!existing) {
            await relationshipModel.create({
              from_person_id: fromId,
              to_person_id: toId,
              type: rel.type || undefined,
            });
          }
        }
      }
    }

    res.json({ success: true, message: `导入成功：${data.persons.length} 位朋友` });
  } catch (err) {
    next(err);
  }
}
