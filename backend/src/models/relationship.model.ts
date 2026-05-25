import { all, get, run } from '../config/database';
import { Relationship, CreateRelationshipDTO, GraphData } from '../types';

export async function findAll(): Promise<Relationship[]> {
  return all<Relationship>('SELECT * FROM relationships');
}

export async function findById(id: number): Promise<Relationship | undefined> {
  return get<Relationship>('SELECT * FROM relationships WHERE id = ?', [id]);
}

export async function findByPersonIds(from: number, to: number): Promise<Relationship | undefined> {
  return get<Relationship>(
    'SELECT * FROM relationships WHERE (from_person_id = ? AND to_person_id = ?) OR (from_person_id = ? AND to_person_id = ?)',
    [from, to, to, from]
  );
}

export async function create(dto: CreateRelationshipDTO): Promise<Relationship> {
  const result = await run(
    'INSERT INTO relationships (from_person_id, to_person_id, type) VALUES (?, ?, ?)',
    [dto.from_person_id, dto.to_person_id, dto.type ?? null]
  );
  const rel = await findById(result.lastID!);
  return rel!;
}

export async function remove(id: number): Promise<void> {
  await run('DELETE FROM relationships WHERE id = ?', [id]);
}

export async function getGraphData(): Promise<GraphData> {
  const nodes = await all<{ id: number; name: string; avatar: string | null }>(
    'SELECT id, name, avatar FROM persons'
  );
  const links = await all<{ source: number; target: number; type: string | null }>(
    'SELECT from_person_id as source, to_person_id as target, type FROM relationships'
  );
  return { nodes, links };
}
