import * as personModel from '../models/person.model';
import { CreatePersonDTO, UpdatePersonDTO, PersonWithConnections } from '../types';

export async function listPersons() {
  return personModel.findAll();
}

export async function getPerson(id: number): Promise<PersonWithConnections | undefined> {
  return personModel.findWithConnections(id);
}

export async function createPerson(dto: CreatePersonDTO) {
  const existing = await personModel.findByName(dto.name);
  if (existing) {
    const error = new Error('该姓名已存在');
    (error as any).statusCode = 400;
    throw error;
  }
  return personModel.create(dto);
}

export async function updatePerson(id: number, dto: UpdatePersonDTO) {
  if (dto.name) {
    const existing = await personModel.findByName(dto.name);
    if (existing && existing.id !== id) {
      const error = new Error('该姓名已存在');
      (error as any).statusCode = 400;
      throw error;
    }
  }
  return personModel.update(id, dto);
}

export async function deletePerson(id: number) {
  return personModel.remove(id);
}
