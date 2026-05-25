import { Request, Response, NextFunction } from 'express';
import * as relationshipService from '../services/relationship.service';

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const graphData = await relationshipService.getGraphData();
    res.json({ success: true, data: graphData });
  } catch (err) {
    next(err);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const { from_person_id, to_person_id, type } = req.body;
    if (typeof from_person_id !== 'number' || typeof to_person_id !== 'number') {
      res.status(400).json({ success: false, message: '参数错误' });
      return;
    }
    const rel = await relationshipService.createRelationship({ from_person_id, to_person_id, type });
    res.status(201).json({ success: true, data: rel });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    await relationshipService.deleteRelationship(id);
    res.json({ success: true, message: '删除成功' });
  } catch (err) {
    next(err);
  }
}
