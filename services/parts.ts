import { request } from '../lib/apiClient';
import { Part } from '../types/booking';

interface PartCategory {
    id: number;
    name: string;
    code: string;
}

export interface UpsertPartPayload {
    categoryId: number;
    description: string;
}

export const partsApi = {
    // Categories
    listCategories: (token: string) => {
        return request<PartCategory[]>('/part-categories', { token });
    },

    // Admin: List all parts for a specific client
    listParts: (clientId: number, token: string) => {
        return request<Part[]>(`/users/${clientId}/parts`, { token });
    },

    // Admin: List ALL parts from ALL clients
    getAllParts: (token: string, query?: string) => {
        const search = query ? `?q=${encodeURIComponent(query)}` : '';
        return request<Part[]>(`/users/parts/all${search}`, { token });
    },

    // Client: List my parts
    listMyParts: (token: string) => {
        return request<Part[]>('/users/me/parts', { token });
    },

    // Client: Create part
    createMyPart: (data: UpsertPartPayload, token: string) => {
        return request<Part>('/users/me/parts', { token, body: data });
    },

    // Admin: Create part for client
    createPartAsAdmin: (clientId: number, data: UpsertPartPayload, token: string) => {
        return request<Part>(`/users/${clientId}/parts`, { token, body: data });
    },

    // Client: Update part
    updateMyPart: (id: number, data: UpsertPartPayload, token: string) => {
        return request<Part>(`/users/me/parts/${id}`, { token, method: 'PUT', body: data });
    },

    // Admin: Update part
    updatePartAsAdmin: (clientId: number, partId: number, data: UpsertPartPayload, token: string) => {
        return request<Part>(`/users/${clientId}/parts/${partId}`, { token, method: 'PUT', body: data });
    },

    // Client: Delete part
    deleteMyPart: (id: number, token: string) => {
        return request<{ success: true }>(`/users/me/parts/${id}`, { token, method: 'DELETE' });
    },

    // Admin: Delete part
    deletePartAsAdmin: (clientId: number, partId: number, token: string) => {
        return request<{ success: boolean }>(`/users/${clientId}/parts/${partId}`, { method: 'DELETE', token });
    }
};
