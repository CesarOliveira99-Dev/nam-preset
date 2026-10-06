export enum PresetType {
  ELETRIC = 'Eletric',
  ACOUSTIC = 'Acoustic',
  BOTH = 'Both',
}

export const PRESET_TYPES = Object.values(PresetType);

export function isPresetType(value: string): value is PresetType {
  return PRESET_TYPES.includes(value as PresetType);
}
