import { request } from '../lib/apiClient';
import type { UserProfile } from '../types/auth';
import type { PartCategory, VehicleBrandOption, VehicleTypeOption } from '../types/booking';

interface UpsertClientPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export const usersApi = {
  listClients: (token: string, query?: string) => {
    const search = query ? `?q=${encodeURIComponent(query)}` : '';
    return request<UserProfile[]>(`/users/clients${search}`, { token });
  },
  createClient: (payload: UpsertClientPayload, token: string) =>
    request<UserProfile>('/users/clients', { method: 'POST', body: payload, token }),
  updateClient: (id: number, payload: UpsertClientPayload, token: string) =>
    request<UserProfile>(`/users/${id}`, { method: 'PATCH', body: payload, token }),
  deleteClient: (id: number, token: string) => request<{ success: boolean }>(`/users/${id}`, { method: 'DELETE', token }),
  listClientVehicles: (clientId: number, token: string) =>
    request<{
      id: number;
      type: VehicleTypeOption;
      brand?: VehicleBrandOption | null;
      brandOther?: string | null;
      model: string;
      year?: number | null;
      vinOrPlate?: string | null;
      notes?: string | null;
    }[]>(`/users/${clientId}/vehicles`, { token }),
  createVehicle: (clientId: number, payload: any, token: string) =>
    request(`/users/${clientId}/vehicles`, { method: 'POST', body: payload, token }),
  updateVehicle: (clientId: number, vehicleId: number, payload: any, token: string) =>
    request(`/users/${clientId}/vehicles/${vehicleId}`, { method: 'PUT', body: payload, token }),
  deleteVehicle: (clientId: number, vehicleId: number, token: string) =>
    request<{ success: boolean }>(`/users/${clientId}/vehicles/${vehicleId}`, { method: 'DELETE', token }),
  listClientParts: (clientId: number, token: string) =>
    request<{
      id: number;
      category: PartCategory;
      description: string;
    }[]>(`/users/${clientId}/parts`, { token }),
  createPart: (clientId: number, payload: any, token: string) =>
    request(`/users/${clientId}/parts`, { method: 'POST', body: payload, token }),
  updatePart: (clientId: number, partId: number, payload: any, token: string) =>
    request(`/users/${clientId}/parts/${partId}`, { method: 'PUT', body: payload, token }),
  deletePart: (clientId: number, partId: number, token: string) =>
    request<{ success: boolean }>(`/users/${clientId}/parts/${partId}`, { method: 'DELETE', token }),
};
