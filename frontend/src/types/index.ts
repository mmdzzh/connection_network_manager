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

export interface Relationship {
  id: number;
  from_person_id: number;
  to_person_id: number;
  type: string | null;
  created_at: string;
}

export interface GraphNode {
  id: number;
  name: string;
  avatar: string | null;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
}

export interface GraphLink {
  source: number;
  target: number;
  type?: string | null;
}

export interface GraphData {
  nodes: { id: number; name: string; avatar: string | null }[];
  links: GraphLink[];
}

export interface CreatePersonDTO {
  name: string;
  avatar?: string;
  description?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}


