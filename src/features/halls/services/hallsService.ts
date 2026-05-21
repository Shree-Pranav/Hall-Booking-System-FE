import { apiClient } from "../../../lib/axios";

export type HallCreate = {
  name: string;
  capacity: number;
  floor: number;
};

export type HallUpdate = Partial<HallCreate> & {
  is_active?: boolean;
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

type ListHallsResponse = {
  halls: Hall[];
  total: number;
};

export type FavoriteHall = {
  id: string;
  name: string;
};

export async function listHalls(): Promise<Hall[]> {
  const res = await apiClient.get<ListHallsResponse | Hall[]>("/halls");
  return Array.isArray(res.data) ? res.data : res.data.halls;
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
  facilityName: string,
  hallName: string,
): Promise<{ message: string }> {
  const res = await apiClient.post("/halls/add_facility", {
    facility_name: facilityName,
    hall_name: hallName,
  });
  return res.data;
}

export async function removeFacilityFromHall(
  facilityName: string,
  hallName: string,
): Promise<{ message: string }> {
  const res = await apiClient.patch("/halls/facilities", {
    facility_name: facilityName,
    hall_name: hallName,
    is_active: false,
  });
  return res.data;
}

export async function modifyHallFacility(
  facilityName: string,
  hallName: string,
  is_active: boolean,
): Promise<{ message: string }> {
  const res = await apiClient.patch("/halls/facilities", {
    facility_name: facilityName,
    hall_name: hallName,
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

export async function listFavoriteHalls(): Promise<FavoriteHall[]> {
  const res = await apiClient.get<FavoriteHall[]>("/favorites/me");
  return res.data;
}

export async function updateHall(
  id: string,
  payload: HallUpdate,
): Promise<Hall> {
  const res = await apiClient.patch<Hall>(`/halls/${id}`, payload);
  return res.data;
}
