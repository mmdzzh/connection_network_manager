import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import * as personModel from '../models/person.model';
import * as relationshipModel from '../models/relationship.model';

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.resolve(__dirname, '../../uploads');

export async function exportData(_req: Request, res: Response, next: NextFunction) {
  try {
    const persons = await personModel.findAll();
    const relationships = await relationshipModel.findAll();

    const exportPersons = persons.map((p) => {
      const item: Record<string, any> = {
        name: p.name,
        avatar: p.avatar,
        description: p.description,
      };

      // 图片头像转为 base64 嵌入
      if (p.avatar && !p.avatar.startsWith('#')) {
        const relativePath = p.avatar.replace('/uploads/', '');
        const filePath = path.join(UPLOADS_DIR, relativePath);
        if (fs.existsSync(filePath)) {
          const buffer = fs.readFileSync(filePath);
          const ext = path.extname(filePath).slice(1) || 'png';
          item.avatar = `data:image/${ext};base64,${buffer.toString('base64')}`;
        }
      }

      return item;
    });

    const exportRelationships = relationships.map((r) => {
      const fromPerson = persons.find((p) => p.id === r.from_person_id);
      const toPerson = persons.find((p) => p.id === r.to_person_id);
      return {
        from_name: fromPerson?.name || '',
        to_name: toPerson?.name || '',
        type: r.type,
      };
    });

    res.json({
      success: true,
      data: {
        version: '1.0',
        exported_at: new Date().toISOString(),
        persons: exportPersons,
        relationships: exportRelationships,
      },
    });
  } catch (err) {
    next(err);
  }
}
