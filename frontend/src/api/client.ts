import type { ApiResponse, Person, PersonWithConnections, GraphData, CreatePersonDTO, Relationship } from '../types';

const BASE = 'http://localhost:3001/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const isFormData = options?.body instanceof FormData;
  const res = await fetch(BASE + url, {
    headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
    ...options,
  });
  const json: ApiResponse<T> = await res.json();
  if (!json.success) {
    throw new Error(json.message || '请求失败');
  }
  return json.data;
}

export const personApi = {
  list: () => request<Person[]>('/persons'),
  get: (id: number) => request<PersonWithConnections>(`/persons/${id}`),
  create: (dto: CreatePersonDTO) =>
    request<Person>('/persons', { method: 'POST', body: JSON.stringify(dto) }),
  update: (id: number, dto: Partial<CreatePersonDTO>) =>
    request<Person>(`/persons/${id}`, { method: 'PUT', body: JSON.stringify(dto) }),
  remove: (id: number) =>
    request<void>(`/persons/${id}`, { method: 'DELETE' }),
  uploadAvatar: (id: number, file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return request<Person>(`/persons/${id}/avatar`, {
      method: 'POST',
      body: formData,
    });
  },
};

export const relationshipApi = {
  getGraph: () => request<GraphData>('/relationships'),
  create: (from_person_id: number, to_person_id: number, type?: string) =>
    request<Relationship>('/relationships', {
      method: 'POST',
      body: JSON.stringify({ from_person_id, to_person_id, type }),
    }),
  remove: (id: number) =>
    request<void>(`/relationships/${id}`, { method: 'DELETE' }),
};

export const exportApi = {
  exportData: () => request<{
    version: string;
    exported_at: string;
    persons: any[];
    relationships: any[];
  }>('/export'),
};

export const importApi = {
  importData: (data: any) =>
    request<void>('/import', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const resetApi = {
  resetData: () => request<void>('/reset', { method: 'POST' }),
};
