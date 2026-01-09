import { request } from '../lib/apiClient';
import { CustomerVehicle } from '../types/booking';
import { UserProfile } from '../types/auth';

export interface UpsertVehiclePayload {
    typeId: number;
    brandId?: number;
    brandOther?: string;
    model: string;
    year?: number;
    vinOrPlate?: string;
    notes?: string;
}

export const vehiclesApi = {
    getAllVehicles: (token: string, query?: string) => {
        const search = query ? `?q=${encodeURIComponent(query)}` : '';
        return request<(CustomerVehicle & { owner?: UserProfile })[]>(`/users/vehicles/all${search}`, { token });
    },

    getMyVehicles: (token: string) => {
        return request<CustomerVehicle[]>('/users/me/vehicles', { token });
    },

    createMyVehicle: (data: UpsertVehiclePayload, token: string) => {
        return request<CustomerVehicle>('/users/me/vehicles', { token, body: data });
    },

    updateMyVehicle: (id: number, data: UpsertVehiclePayload, token: string) => {
        return request<CustomerVehicle>(`/users/me/vehicles/${id}`, { token, method: 'PUT', body: data });
    },

    deleteMyVehicle: (id: number, token: string) => {
        return request<{ success: true }>(`/users/me/vehicles/${id}`, { token, method: 'DELETE' });
    },

    deleteVehicleAsAdmin: (clientId: number, vehicleId: number, token: string) => {
        return request<{ success: boolean }>(`/users/${clientId}/vehicles/${vehicleId}`, { method: 'DELETE', token });
    }
};
