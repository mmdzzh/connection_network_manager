import { Request, Response, NextFunction } from 'express';
import * as personService from '../services/person.service';
import { uploadAvatar } from '../utils/upload';

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const persons = await personService.listPersons();
    res.json({ success: true, data: persons });
  } catch (err) {
    next(err);
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const person = await personService.getPerson(id);
    if (!person) {
      res.status(404).json({ success: false, message: '朋友不存在' });
      return;
    }
    res.json({ success: true, data: person });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, avatar, description } = req.body;
    if (!name || typeof name !== 'string') {
      res.status(400).json({ success: false, message: '姓名不能为空' });
      return;
    }
    const person = await personService.createPerson({ name, avatar, description });
    res.status(201).json({ success: true, data: person });
  } catch (err) {
    next(err);
  }
}

export async function update(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, avatar, description } = req.body;
    const person = await personService.updatePerson(id, { name, avatar, description });
    if (!person) {
      res.status(404).json({ success: false, message: '朋友不存在' });
      return;
    }
    res.json({ success: true, data: person });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    await personService.deletePerson(id);
    res.json({ success: true, message: '删除成功' });
  } catch (err) {
    next(err);
  }
}

export function uploadAvatarHandler(req: Request, res: Response, next: NextFunction) {
  uploadAvatar(req, res, async (err: any) => {
    try {
      if (err) {
        res.status(400).json({ success: false, message: err.message });
        return;
      }
      if (!req.file) {
        res.status(400).json({ success: false, message: '请上传图片文件' });
        return;
      }
      const id = parseInt(req.params.id, 10);
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;
      const person = await personService.updatePerson(id, { avatar: avatarUrl });
      if (!person) {
        res.status(404).json({ success: false, message: '朋友不存在' });
        return;
      }
      res.json({ success: true, data: person });
    } catch (err) {
      next(err);
    }
  });
}
