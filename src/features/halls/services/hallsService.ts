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
  facilities?: {
    facility: { id: number; name: string };
    is_active: boolean;
  }[];
};

export async function listHalls(): Promise<Hall[]> {
  const res = await apiClient.get<{ halls?: Hall[]; total?: number }>("/halls");
  // backend returns { halls: [...], total: n }
  return (res.data as any).halls ?? (res.data as any);
}

export async function createHall(payload: HallCreate): Promise<Hall> {
  const res = await apiClient.post<Hall>("/halls", payload);
  return res.data;
}

export type Facility = { id: number; name: string };

export async function listFacilities(): Promise<Facility[]> {
  const res = await apiClient.get<Facility[]>("/facilities");
  return res.data;
}

export async function createFacility(payload: {
  name: string;
}): Promise<Facility> {
  const res = await apiClient.post<Facility>("/facilities", payload);
  return res.data;
}

export async function addFacilityToHall(
  facility_name: string,
  hall_name: string,
): Promise<{ message: string }> {
  const res = await apiClient.post("/halls/add_facility", {
    facility_name,
    hall_name,
  });
  return res.data;
}

export async function modifyHallFacility(
  facility_name: string,
  hall_name: string,
  is_active: boolean,
): Promise<{ message: string }> {
  const res = await apiClient.patch("/halls/facilities", {
    facility_name,
    hall_name,
    is_active,
  });
  return res.data;
}

export async function addFavorite(
  hall_name: string,
): Promise<{ message: string }> {
  const res = await apiClient.post("/favorites/add/", null, {
    params: { hall_name },
  });
  return res.data;
}

export async function removeFavorite(hall_name: string): Promise<void> {
  await apiClient.delete("/favorites/remove/", { params: { hall_name } });
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
