import * as relationshipModel from '../models/relationship.model';
import * as personModel from '../models/person.model';
import { CreateRelationshipDTO } from '../types';

export async function listRelationships() {
  return relationshipModel.findAll();
}

export async function getGraphData() {
  return relationshipModel.getGraphData();
}

export async function createRelationship(dto: CreateRelationshipDTO) {
  if (dto.from_person_id === dto.to_person_id) {
    const error = new Error('不能与自己建立关系');
    (error as any).statusCode = 400;
    throw error;
  }

  const fromPerson = await personModel.findById(dto.from_person_id);
  const toPerson = await personModel.findById(dto.to_person_id);

  if (!fromPerson || !toPerson) {
    const error = new Error('朋友不存在');
    (error as any).statusCode = 404;
    throw error;
  }

  const existing = await relationshipModel.findByPersonIds(dto.from_person_id, dto.to_person_id);
  if (existing) {
    const error = new Error('关系已存在');
    (error as any).statusCode = 400;
    throw error;
  }

  return relationshipModel.create(dto);
}

export async function deleteRelationship(id: number) {
  return relationshipModel.remove(id);
}
