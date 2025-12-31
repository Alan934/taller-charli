import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { bookingApi } from '../services/booking';
import { AssetType } from '../types/enums';
import {
  BookingResponse,
  CreateBookingPayload,
  Issue,
  PartCategory,
  SlotResponse,
  VehicleBrandOption,
  VehicleTypeOption,
} from '../types/booking';
import { useAuth } from './AuthContext';

interface VehicleInput extends NonNullable<CreateBookingPayload['vehicle']> {}
interface PartInput extends NonNullable<CreateBookingPayload['part']> {}

interface BookingState {
  assetType: AssetType;
  vehicle?: VehicleInput;
  part?: PartInput;
  commonIssueIds: number[];
  customIssues: string[];
  details?: string;
  mediaUrl?: string;
  scheduledAt?: string;
  durationMinutes?: number;
}

interface BookingContextValue extends BookingState {
  issues: Issue[];
  partCategories: PartCategory[];
  vehicleTypes: VehicleTypeOption[];
  vehicleBrands: VehicleBrandOption[];
  slots: string[];
  availability: Record<string, number>;
  loadingIssues: boolean;
  loadingPartCategories: boolean;
  loadingVehicleTypes: boolean;
  loadingVehicleBrands: boolean;
  loadingSlots: boolean;
  loadingAvailability: boolean;
  lastBooking?: BookingResponse;
  setAssetType: (type: AssetType) => void;
  setVehicle: (v?: VehicleInput) => void;
  setPart: (p?: PartInput) => void;
  toggleCommonIssue: (id: number) => void;
  setCustomIssues: (list: string[]) => void;
  setDetails: (text?: string) => void;
  setMediaUrl: (url?: string) => void;
  loadIssues: (partCategoryId?: number) => Promise<void>;
  loadPartCategories: () => Promise<void>;
  loadVehicleTypes: () => Promise<void>;
  loadVehicleBrands: () => Promise<void>;
  loadSlots: (date: string, assetType: AssetType, durationMinutes?: number) => Promise<SlotResponse>;
  refreshAvailability: (startDate: string, days?: number) => Promise<void>;
  setScheduledAt: (iso: string) => void;
  setDuration: (minutes?: number) => void;
  submitBooking: () => Promise<BookingResponse>;
  clearBooking: () => void;
}

const BookingContext = createContext<BookingContextValue | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user } = useAuth();
  const [state, setState] = useState<BookingState>({
    assetType: 'VEHICLE',
    commonIssueIds: [],
    customIssues: [],
    durationMinutes: undefined,
  });
  const [issues, setIssues] = useState<Issue[]>([]);
  const [partCategories, setPartCategories] = useState<PartCategory[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleTypeOption[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrandOption[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Record<string, number>>({});
  const availabilityCache = useRef<Record<string, number>>({});
  const [loadingIssues, setLoadingIssues] = useState(false);
  const [loadingPartCategories, setLoadingPartCategories] = useState(false);
  const [loadingVehicleTypes, setLoadingVehicleTypes] = useState(false);
  const [loadingVehicleBrands, setLoadingVehicleBrands] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [lastBooking, setLastBooking] = useState<BookingResponse | undefined>(undefined);

  // Recalculate duration from selected common issues; if total is 0, keep it undefined
  useEffect(() => {
    const total = issues
      .filter((i) => state.commonIssueIds.includes(i.id))
      .reduce((sum, issue) => sum + (issue.durationMinutes ?? 0), 0);

    setState((prev) => {
      const nextDuration = total > 0 ? total : undefined;
      if (prev.durationMinutes === nextDuration) return prev;
      return { ...prev, durationMinutes: nextDuration };
    });
  }, [issues, state.commonIssueIds]);

  const setAssetType = (type: AssetType) => {
    setIssues([]);
    setAvailability({});
    availabilityCache.current = {};
    setState((s) => ({ ...s, assetType: type, commonIssueIds: [], customIssues: [] }));
  };
  const setVehicle = (v?: VehicleInput) =>
    setState((s) => ({ ...s, vehicle: v, part: undefined, commonIssueIds: [], customIssues: [] }));
  const setPart = (p?: PartInput) =>
    setState((s) => ({ ...s, part: p, vehicle: undefined, commonIssueIds: [], customIssues: [] }));
  const toggleCommonIssue = (id: number) =>
    setState((s) => ({
      ...s,
      commonIssueIds: s.commonIssueIds.includes(id)
        ? s.commonIssueIds.filter((x) => x !== id)
        : [...s.commonIssueIds, id],
    }));
  const setCustomIssues = (list: string[]) => setState((s) => ({ ...s, customIssues: list }));
  const setDetails = (text?: string) => setState((s) => ({ ...s, details: text }));
  const setMediaUrl = (url?: string) => setState((s) => ({ ...s, mediaUrl: url }));
  const setScheduledAt = (iso: string) => setState((s) => ({ ...s, scheduledAt: iso }));
  const setDuration = (minutes?: number) => setState((s) => ({ ...s, durationMinutes: minutes }));

  const loadIssues = useCallback(
    async (partCategoryId?: number) => {
      if (!token) {
        setIssues([]);
        return;
      }
      setLoadingIssues(true);
      try {
        const data = await bookingApi.listCommonIssues(token, partCategoryId ? { partCategoryId } : undefined);
        setIssues(data);
      } finally {
        setLoadingIssues(false);
      }
    },
    [token],
  );

  const loadPartCategories = useCallback(async () => {
    if (!token) {
      setPartCategories([]);
      return;
    }
    setLoadingPartCategories(true);
    try {
      const data = await bookingApi.listPartCategories(token);
      setPartCategories(data);
    } finally {
      setLoadingPartCategories(false);
    }
  }, [token]);

  const loadVehicleTypes = useCallback(async () => {
    if (!token) {
      setVehicleTypes([]);
      return;
    }
    setLoadingVehicleTypes(true);
    try {
      const data = await bookingApi.listVehicleTypes(token);
      setVehicleTypes(data);
    } finally {
      setLoadingVehicleTypes(false);
    }
  }, [token]);

  const loadVehicleBrands = useCallback(async () => {
    if (!token) {
      setVehicleBrands([]);
      return;
    }
    setLoadingVehicleBrands(true);
    try {
      const data = await bookingApi.listVehicleBrands(token);
      setVehicleBrands(data);
    } finally {
      setLoadingVehicleBrands(false);
    }
  }, [token]);

  const loadSlots = useCallback(
    async (date: string, assetType: AssetType, durationMinutes?: number) => {
      if (!token) {
        setSlots([]);
        return { date, slots: [] } as SlotResponse;
      }
      setLoadingSlots(true);
      try {
        const res = await bookingApi.getSlots({ date, assetType, durationMinutes }, token);
        setSlots(res.slots);
        return res;
      } finally {
        setLoadingSlots(false);
      }
    },
    [token],
  );

  const refreshAvailability = useCallback(
    async (startDate: string, days: number = 30) => {
      if (!token) {
        setAvailability({});
        availabilityCache.current = {};
        return;
      }
      setLoadingAvailability(true);
      try {
        const start = new Date(startDate);
        const missing: string[] = [];
        for (let i = 0; i < days; i++) {
          const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate() + i));
          const dateStr = d.toISOString().slice(0, 10);
          if (availabilityCache.current[dateStr] === undefined) {
            missing.push(dateStr);
          }
        }

        if (!missing.length) {
          setAvailability({ ...availabilityCache.current });
          return;
        }

        const requests = missing.map((dateStr) =>
          bookingApi.getSlots(
            { date: dateStr, assetType: state.assetType, durationMinutes: state.durationMinutes },
            token,
          ),
        );
        const results = await Promise.all(requests);
        results.forEach((r) => {
          availabilityCache.current[r.date] = r.slots.length;
        });
        setAvailability({ ...availabilityCache.current });
      } finally {
        setLoadingAvailability(false);
      }
    },
    [token, state.assetType, state.durationMinutes],
  );

  const submitBooking = async () => {
    if (!token || !user) throw new Error('Debes iniciar sesión para reservar');
    if (!state.scheduledAt) throw new Error('Selecciona un horario');
    if (!state.commonIssueIds.length) throw new Error('Selecciona al menos una falla común');

    if (state.assetType === 'VEHICLE') {
      if (!state.vehicle) throw new Error('Completa los datos del vehículo');
      if (!state.vehicle.typeId) {
        throw new Error('Selecciona el tipo de vehículo');
      }
      if (!state.vehicle.model) {
        throw new Error('Modelo es obligatorio');
      }
      if (!state.vehicle.brandId && !state.vehicle.brandOther?.trim()) {
        throw new Error('Selecciona una marca o especifica "Otros"');
      }
    }

    if (state.assetType === 'PART') {
      if (!state.part?.partCategoryId) throw new Error('Selecciona la categoría de la pieza');
      if (!state.part.description?.trim()) throw new Error('Describe la pieza a reparar');
    }

    const payload: CreateBookingPayload = {
      assetType: state.assetType,
      customerId: user?.id,
      vehicle: state.assetType === 'VEHICLE' ? state.vehicle : undefined,
      part: state.assetType === 'PART' ? state.part : undefined,
      commonIssueIds: state.commonIssueIds,
      customIssues: state.customIssues.length ? state.customIssues : undefined,
      details: state.details,
      mediaUrl: state.mediaUrl,
      scheduledAt: state.scheduledAt,
      durationMinutes: state.durationMinutes,
    };

    const res = await bookingApi.create(payload, token);
    setLastBooking({ ...res, assetType: state.assetType });
    return res;
  };

  const clearBooking = () => {
    setState({ assetType: 'VEHICLE', commonIssueIds: [], customIssues: [], durationMinutes: undefined });
    setIssues([]);
    setSlots([]);
    setPartCategories([]);
    availabilityCache.current = {};
    setAvailability({});
    setLastBooking(undefined);
  };

  const value = useMemo(
    () => ({
      ...state,
      issues,
      partCategories,
      vehicleTypes,
      vehicleBrands,
      slots,
      loadingIssues,
      loadingPartCategories,
      loadingVehicleTypes,
      loadingVehicleBrands,
      loadingSlots,
      loadingAvailability,
      lastBooking,
      setAssetType,
      setVehicle,
      setPart,
      toggleCommonIssue,
      setCustomIssues,
      setDetails,
      setMediaUrl,
      loadIssues,
      loadPartCategories,
      loadVehicleTypes,
      loadVehicleBrands,
      loadSlots,
      availability,
      refreshAvailability,
      setScheduledAt,
      setDuration,
      submitBooking,
      clearBooking,
    }),
    [
      state,
      issues,
      partCategories,
      slots,
      loadingIssues,
      loadingPartCategories,
      loadingSlots,
      loadingAvailability,
      lastBooking,
      loadIssues,
      loadPartCategories,
      loadVehicleTypes,
      loadVehicleBrands,
      loadSlots,
      availability,
      refreshAvailability,
      submitBooking,
    ],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
};

export const useBooking = () => {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking must be used within BookingProvider');
  return ctx;
};
