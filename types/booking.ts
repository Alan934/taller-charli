import { AssetType, BookingTimeType } from '../types/enums';

export const BookingStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  CANCELED: 'CANCELED',
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'En progreso',
  DONE: 'Completado',
  CANCELED: 'Cancelado',
};

export interface PartCategory {
  id: number;
  code: string;
  name: string;
}

export interface VehicleTypeOption {
  id: number;
  code: string;
  name: string;
  description?: string | null;
}

export interface VehicleBrandOption {
  id: number;
  name: string;
}

export interface CustomerSummary {
  id: number;
  email: string;
  fullName?: string | null;
}

export interface CustomerVehicle {
  id: number;
  type: VehicleTypeOption;
  brand?: VehicleBrandOption | null;
  brandOther?: string | null;
  model: string;
  year?: number;
  vinOrPlate?: string | null;
  notes?: string | null;
}

export interface Issue {
  id: number;
  kind: 'COMMON' | 'CUSTOM';
  label: string;
  durationMinutes?: number;
  partCategory?: PartCategory | null;
}

export interface Workday {
  id?: number;
  weekday: number; // 0-6
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  isActive: boolean;
  maxBookings: number;
}

export interface WorkdayOverride {
  id?: number;
  date: string; // YYYY-MM-DD
  maxBookings: number;
}

export type WorkdayInput = Pick<Workday, 'weekday' | 'startTime' | 'endTime' | 'isActive' | 'maxBookings'>;
export type WorkdayOverrideInput = Pick<WorkdayOverride, 'date' | 'maxBookings'>;

export interface SlotResponse {
  date: string; // YYYY-MM-DD
  slots: string[]; // ISO timestamps
}

export interface CreateBookingPayload {
  assetType: AssetType;
  customerId?: number;
  createCustomer?: {
    email: string;
    fullName?: string;
    phone?: string;
    password?: string;
  };
  vehicleId?: number;
  vehicle?: {
    typeId: number;
    brandId?: number;
    brandOther?: string;
    model: string;
    year?: number;
    vinOrPlate?: string;
    notes?: string;
  };
  part?: {
    partCategoryId: number;
    description: string;
  };
  commonIssueIds: number[];
  customIssues?: string[];
  details?: string;
  mediaUrl?: string;
  scheduledAt: string; // ISO
  durationMinutes?: number;
  timeType?: BookingTimeType;
}

export interface BookingResponse {
  id: number;
  code: string;
  status: BookingStatus;
  scheduledAt: string;
  durationMinutes: number;
  mediaUrl?: string | null;
  assetType?: AssetType;
  timeType?: BookingTimeType;
}

export interface BookingUsedPart {
  id: number;
  name: string;
  quantity: number;
}

export interface BookingItem {
  id: number;
  code: string;
  status: BookingStatus;
  assetType: AssetType;
  timeType?: BookingTimeType;
  scheduledAt: string;
  durationMinutes: number;
  mediaUrl?: string | null;
  details?: string | null;
  usedParts?: BookingUsedPart[];
  vehicle?: {
    id?: number;
    type: VehicleTypeOption;
    brand?: VehicleBrandOption | null;
    brandOther?: string | null;
    model: string;
    year?: number;
    vinOrPlate?: string;
    notes?: string;
  };
  part?: {
    id?: number;
    description: string;
    category: PartCategory;
  };
  customer?: {
    id: number;
    email: string;
    fullName?: string;
    phone?: string;
  } | null;
}

export interface BookingSummary {
  total: number;
  byStatus: Record<BookingStatus, number>;
  upcoming?: BookingItem | null;
}
