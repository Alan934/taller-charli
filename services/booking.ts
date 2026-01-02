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
  Workday,
  WorkdayInput,
  WorkdayOverride,
  WorkdayOverrideInput,
  VehicleBrandOption,
  VehicleTypeOption,
} from '../types/booking';
import { CustomerSummary, CustomerVehicle } from '../types/booking';

export const bookingApi = {
  listCommonIssues: (token: string, params?: { partCategoryId?: number }) => {
    const search = params?.partCategoryId ? `?partCategoryId=${params.partCategoryId}` : '';
    return request<Issue[]>(`/issues/common${search}`, { token });
  },
  createIssue: (
    data: { label: string; durationMinutes: number; kind: Issue['kind']; partCategoryId?: number },
    token: string,
  ) => request<Issue>('/issues', { token, body: data }),
  updateIssue: (
    id: number,
    data: Partial<Omit<Issue, 'id'>> & { partCategoryId?: number },
    token: string,
  ) => request<Issue>(`/issues/${id}`, { token, method: 'PATCH', body: data }),
  listPartCategories: (token: string) => request<PartCategory[]>('/part-categories', { token }),
  createPartCategory: (data: { code: string; name: string }, token: string) =>
    request<PartCategory>('/part-categories', { token, body: data }),
  updatePartCategory: (id: number, data: { code?: string; name?: string }, token: string) =>
    request<PartCategory>(`/part-categories/${id}`, { token, method: 'PATCH', body: data }),
  deletePartCategory: (id: number, token: string) =>
    request<{ success: true }>(`/part-categories/${id}`, { token, method: 'DELETE' }),
  listVehicleTypes: (token: string) => request<VehicleTypeOption[]>('/vehicle-types', { token }),
  listVehicleBrands: (token: string) => request<VehicleBrandOption[]>('/vehicle-brands', { token }),
  createVehicleBrand: (data: { name: string }, token: string) =>
    request<VehicleBrandOption>('/vehicle-brands', { token, body: data }),
  updateVehicleBrand: (id: number, data: { name?: string }, token: string) =>
    request<VehicleBrandOption>(`/vehicle-brands/${id}`, { token, method: 'PATCH', body: data }),
  deleteVehicleBrand: (id: number, token: string) =>
    request<{ success: true }>(`/vehicle-brands/${id}`, { token, method: 'DELETE' }),
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
  getWorkdays: (token: string) => request<{ workdays: Workday[]; overrides: WorkdayOverride[] }>('/agenda/workdays', { token }),
  saveWorkdays: (payload: { workdays: WorkdayInput[]; overrides?: WorkdayOverrideInput[] }, token: string) =>
    request<{ workdays: Workday[]; overrides: WorkdayOverride[] }>('/agenda/workdays', {
      token,
      method: 'PUT',
      body: payload,
    }),
  listMine: (token: string) => request<BookingItem[]>('/bookings/me', { token }),
  listAll: (token: string) => request<BookingItem[]>('/bookings', { token }),
  summary: (token: string) => request<BookingSummary>('/bookings/summary', { token }),
  getOne: (id: number, token: string) => request<BookingItem>(`/bookings/${id}`, { token }),
  updateStatus: (id: number, status: BookingStatus, token: string) =>
    request<BookingItem>(`/bookings/${id}/status`, { method: 'PATCH', body: { status }, token }),
};
