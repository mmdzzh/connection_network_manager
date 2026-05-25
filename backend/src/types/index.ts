export interface Person {
  id: number;
  name: string;
  avatar: string | null;
  description: string | null;
  created_at: string;
}

export interface PersonWithConnections extends Person {
  connections: Person[];
}

export interface CreatePersonDTO {
  name: string;
  avatar?: string;
  description?: string;
}

export interface UpdatePersonDTO {
  name?: string;
  avatar?: string;
  description?: string;
}

export interface Relationship {
  id: number;
  from_person_id: number;
  to_person_id: number;
  type: string | null;
  created_at: string;
}

export interface CreateRelationshipDTO {
  from_person_id: number;
  to_person_id: number;
  type?: string;
}

export interface GraphData {
  nodes: { id: number; name: string; avatar: string | null }[];
  links: { source: number; target: number }[];
}
