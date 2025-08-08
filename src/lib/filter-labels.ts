import type { SearchFilters, LicenseType, AspectRatio, ImageSize, ImageType, SafeSearch } from './serpapi.service';
import googleLanguages from '@/../references/google-languages.json';

// Filter label mappings - centralized to avoid duplication
const ENGINE_LABELS = {
  'google_images_light': 'Light (Fast)',
  'google_images': 'Full (Slow)'
} as const;

const LICENSE_LABELS = {
  'f': 'Free to use or share',
  'fc': 'Free to use commercially', 
  'fm': 'Free to modify',
  'fmc': 'Free commercial & modify',
  'cl': 'Creative Commons',
  'ol': 'Commercial licenses'
} as const;

// Create language mapping from the imported JSON
const LANGUAGE_LABELS = googleLanguages.reduce((acc, lang) => {
  acc[lang.language_code] = lang.language_name;
  return acc;
}, {} as Record<string, string>);

const ASPECT_LABELS = {
  's': 'Square',
  't': 'Tall',
  'w': 'Wide',
  'xw': 'Panoramic'
} as const;

const SIZE_LABELS = {
  'i': 'Icon',
  'm': 'Medium',
  'l': 'Large',
  '2mp': '2MP',
  '4mp': '4MP',
  '6mp': '6MP',
  '8mp': '8MP',
  '10mp': '10MP',
  '12mp': '12MP',
  '15mp': '15MP',
  '20mp': '20MP',
  '40mp': '40MP',
  '70mp': '70MP'
} as const;

const TYPE_LABELS = {
  'face': 'Face',
  'photo': 'Photo',
  'clipart': 'Clip Art',
  'lineart': 'Line Drawing',
  'animated': 'Animated'
} as const;

const SAFE_LABELS = {
  'active': 'Safe',
  'off': 'Off'
} as const;

// Enhanced SearchFilters interface with formatted labels for history
export interface SearchFiltersWithLabels extends SearchFilters {
  _labels?: Record<string, string>; // Store formatted labels for history display
}

export function getEngineLabel(engine: string): string {
  return ENGINE_LABELS[engine as keyof typeof ENGINE_LABELS] || engine;
}

export function getLicenseLabel(license: LicenseType): string {
  return LICENSE_LABELS[license] || license;
}

export function getLanguageLabel(language: string): string {
  return LANGUAGE_LABELS[language] || language;
}

export function getAspectLabel(aspect: AspectRatio): string {
  return ASPECT_LABELS[aspect] || aspect;
}

export function getSizeLabel(size: ImageSize): string {
  return SIZE_LABELS[size as keyof typeof SIZE_LABELS] || size;
}

export function getTypeLabel(type: ImageType): string {
  return TYPE_LABELS[type] || type;
}

export function getSafeLabel(safe: SafeSearch): string {
  return SAFE_LABELS[safe] || safe;
}

export function formatStartDate(startDate: string): string {
  return `${startDate.slice(0, 4)}-${startDate.slice(4, 6)}-${startDate.slice(6, 8)}`;
}

// Convert SearchFilters to SearchFiltersWithLabels by adding formatted labels
export function addLabelsToFilters(filters: SearchFilters): SearchFiltersWithLabels {
  const labels: Record<string, string> = {};
  
  if (filters.engine) {
    labels.engine = `Engine: ${getEngineLabel(filters.engine)}`;
  }
  
  if (filters.licenses) {
    labels.licenses = `License: ${getLicenseLabel(filters.licenses)}`;
  }
  
  if (filters.hl) {
    labels.hl = `Language: ${getLanguageLabel(filters.hl)}`;
  }
  
  if (filters.imgar) {
    labels.imgar = `Aspect: ${getAspectLabel(filters.imgar)}`;
  }
  
  if (filters.imgsz) {
    labels.imgsz = `Size: ${getSizeLabel(filters.imgsz)}`;
  }
  
  if (filters.image_type) {
    labels.image_type = `Type: ${getTypeLabel(filters.image_type)}`;
  }
  
  if (filters.safe) {
    labels.safe = `Safe: ${getSafeLabel(filters.safe)}`;
  }
  
  if (filters.start_date) {
    labels.start_date = `From: ${formatStartDate(filters.start_date)}`;
  }
  
  return {
    ...filters,
    _labels: labels
  };
}

// Extract formatted filter labels for display (used in history)
export function getFilterLabels(filtersWithLabels: SearchFiltersWithLabels): string[] {
  return filtersWithLabels._labels ? Object.values(filtersWithLabels._labels) : [];
}