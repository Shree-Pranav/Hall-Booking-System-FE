import { apiClient } from "../../../lib/axios";

export type BookingCreate = {
  hall_name: string;
  start_datetime: string;
  end_datetime: string;
};

export type BookingTimingUpdate = {
  start_datetime: string;
  end_datetime: string;
};

export type Booking = {
  id: string;
  user_id: string;
  user_name?: string;
  hall_id: string;
  hall_name: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type AvailableTimeSlot = {
  start_time: string;
  end_time: string;
  duration_minutes: number;
};

export type AvailableHall = {
  hall_id: string;
  hall_name: string;
  capacity: number;
  floor: number;
  available_slots: AvailableTimeSlot[];
};

export type SearchAvailableHallsParams = {
  start_datetime: string;
  end_datetime: string;
  hall_name?: string;
  hall_id?: string;
  facility_name?: string;
  facility_id?: number;
};

export type SearchAvailableHallsResult = {
  search_filters: SearchAvailableHallsParams;
  results: AvailableHall[];
};

export async function listMyBookings(): Promise<Booking[]> {
  const res = await apiClient.get<Booking[]>("/bookings/me");
  return res.data;
}

export async function listAllBookings(): Promise<Booking[]> {
  const res = await apiClient.get<Booking[]>("/bookings/all");
  return res.data;
}

export async function listUserBookings(userId: string): Promise<Booking[]> {
  const res = await apiClient.get<Booking[]>(`/bookings/users/${userId}`);
  return res.data;
}

export async function bookHall(payload: BookingCreate): Promise<Booking> {
  const res = await apiClient.post<Booking>("/bookings/", payload);
  return res.data;
}

export async function searchAvailableHalls(
  params: SearchAvailableHallsParams,
): Promise<SearchAvailableHallsResult> {
  const res = await apiClient.get<SearchAvailableHallsResult>(
    "/search/available-halls",
    { params },
  );
  return res.data;
}

export async function cancelBooking(bookingId: string): Promise<void> {
  await apiClient.patch(`/bookings/${bookingId}`);
}

export async function updateBookingTiming(
  bookingId: string,
  payload: BookingTimingUpdate,
): Promise<Booking> {
  const res = await apiClient.patch<Booking>(
    `/bookings/${bookingId}/timing`,
    payload,
  );
  return res.data;
}
