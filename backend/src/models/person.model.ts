import { all, get, run } from '../config/database';
import { Person, PersonWithConnections, CreatePersonDTO, UpdatePersonDTO } from '../types';

export async function findAll(): Promise<Person[]> {
  return all<Person>('SELECT * FROM persons ORDER BY created_at DESC');
}

export async function findById(id: number): Promise<Person | undefined> {
  return get<Person>('SELECT * FROM persons WHERE id = ?', [id]);
}

export async function findByName(name: string): Promise<Person | undefined> {
  return get<Person>('SELECT * FROM persons WHERE name = ?', [name]);
}

export async function findWithConnections(id: number): Promise<PersonWithConnections | undefined> {
  const person = await findById(id);
  if (!person) return undefined;

  const connections = await all<Person>(
    `SELECT p.* FROM persons p
     INNER JOIN relationships r ON (r.from_person_id = ? AND r.to_person_id = p.id)
        OR (r.to_person_id = ? AND r.from_person_id = p.id)
     WHERE p.id != ?`,
    [id, id, id]
  );

  return { ...person, connections };
}

export async function create(dto: CreatePersonDTO): Promise<Person> {
  const result = await run(
    'INSERT INTO persons (name, avatar, description) VALUES (?, ?, ?)',
    [dto.name, dto.avatar ?? null, dto.description ?? null]
  );
  const person = await findById(result.lastID!);
  return person!;
}

export async function update(id: number, dto: UpdatePersonDTO): Promise<Person | undefined> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (dto.name !== undefined) { fields.push('name = ?'); values.push(dto.name); }
  if (dto.avatar !== undefined) { fields.push('avatar = ?'); values.push(dto.avatar); }
  if (dto.description !== undefined) { fields.push('description = ?'); values.push(dto.description); }

  if (fields.length === 0) return findById(id);

  values.push(id);
  await run(`UPDATE persons SET ${fields.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

export async function remove(id: number): Promise<void> {
  await run('DELETE FROM persons WHERE id = ?', [id]);
}
