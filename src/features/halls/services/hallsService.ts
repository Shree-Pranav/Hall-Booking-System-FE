import { apiClient } from "../../../lib/axios";

export type HallCreate = {
  name: string;
  capacity: number;
  floor: number;
};

export type Hall = {
  id: string;
  name: string;
  capacity: number;
  floor: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export async function listHalls(): Promise<Hall[]> {
  const res = await apiClient.get<Hall[]>("/halls");
  return res.data.halls ?? res.data;
}

export async function createHall(payload: HallCreate): Promise<Hall> {
  const res = await apiClient.post<Hall>("/halls", payload);
  return res.data;
}

export async function updateHall(
  id: string,
  payload: Partial<HallCreate>,
): Promise<Hall> {
  const res = await apiClient.patch<Hall>(`/halls/${id}`, payload);
  return res.data;
}

export async function deleteHall(id: string): Promise<void> {
  await apiClient.delete(`/halls/${id}`);
}
