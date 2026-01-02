import { request } from '../lib/apiClient';
import { AssetType } from '../types/enums';
import {
  BookingItem,
  BookingResponse,
  BookingSummary,
  BookingStatus,
  CreateBookingPayload,
  Issue,
  PartCategory,
  SlotResponse,
  VehicleBrandOption,
  VehicleTypeOption,
} from '../types/booking';
import { CustomerSummary, CustomerVehicle } from '../types/booking';

export const bookingApi = {
  listCommonIssues: (token: string, params?: { partCategoryId?: number }) => {
    const search = params?.partCategoryId ? `?partCategoryId=${params.partCategoryId}` : '';
    return request<Issue[]>(`/issues/common${search}`, { token });
  },
  listPartCategories: (token: string) => request<PartCategory[]>('/part-categories', { token }),
  listVehicleTypes: (token: string) => request<VehicleTypeOption[]>('/vehicle-types', { token }),
  listVehicleBrands: (token: string) => request<VehicleBrandOption[]>('/vehicle-brands', { token }),
    searchCustomers: (query: string, token: string) => request<CustomerSummary[]>(`/bookings/customers/search?q=${encodeURIComponent(query)}`, { token }),
    listCustomerVehicles: (customerId: number, token: string) => request<CustomerVehicle[]>(`/bookings/customers/${customerId}/vehicles`, { token }),
  getSlots: (
    params: { date: string; assetType: AssetType; durationMinutes?: number },
    token?: string,
  ) =>
    request<SlotResponse>(
      (() => {
        const search = new URLSearchParams({
          date: params.date,
          assetType: params.assetType,
        });
        if (params.durationMinutes !== undefined) {
          search.set('durationMinutes', String(params.durationMinutes));
        }
        return `/agenda/slots?${search.toString()}`;
      })(),
      token ? { token } : {},
    ),
  create: (payload: CreateBookingPayload, token: string) =>
    request<BookingResponse>('/bookings', { body: payload, token }),
  listMine: (token: string) => request<BookingItem[]>('/bookings/me', { token }),
  listAll: (token: string) => request<BookingItem[]>('/bookings', { token }),
  summary: (token: string) => request<BookingSummary>('/bookings/summary', { token }),
  getOne: (id: number, token: string) => request<BookingItem>(`/bookings/${id}`, { token }),
  updateStatus: (id: number, status: BookingStatus, token: string) =>
    request<BookingItem>(`/bookings/${id}/status`, { method: 'PATCH', body: { status }, token }),
};
