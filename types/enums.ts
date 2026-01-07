export type AssetType = 'VEHICLE' | 'PART';

export const BookingTimeType = {
  SPECIFIC: 'SPECIFIC',
  MORNING: 'MORNING',
  AFTERNOON: 'AFTERNOON',
} as const;

export type BookingTimeType = typeof BookingTimeType[keyof typeof BookingTimeType];

