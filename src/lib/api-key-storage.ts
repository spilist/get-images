import { ApiKeyConfig } from '@/types/api';

const API_KEY_STORAGE_KEY = 'serpapi_user_key';

/**
 * Get the stored API key from localStorage
 */
export function getStoredApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to get stored API key:', error);
    return null;
  }
}

/**
 * Store the API key in localStorage
 */
export function storeApiKey(apiKey: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey.trim());
    return true;
  } catch (error) {
    console.error('Failed to store API key:', error);
    return false;
  }
}

/**
 * Remove the API key from localStorage
 */
export function removeStoredApiKey(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Failed to remove stored API key:', error);
    return false;
  }
}

/**
 * Validate API key format (basic SERPAPI key validation)
 */
export function validateApiKeyFormat(apiKey: string): { isValid: boolean; error?: string } {
  if (!apiKey || apiKey.trim().length === 0) {
    return { isValid: false, error: 'API key is required' };
  }
  
  const trimmedKey = apiKey.trim();
  
  // SERPAPI keys are typically 64 characters long and hexadecimal
  if (trimmedKey.length !== 64) {
    return { isValid: false, error: 'API key must be 64 characters long' };
  }
  
  // Check if it's a valid hexadecimal string
  const hexPattern = /^[a-fA-F0-9]+$/;
  if (!hexPattern.test(trimmedKey)) {
    return { isValid: false, error: 'API key must contain only hexadecimal characters (0-9, a-f, A-F)' };
  }
  
  return { isValid: true };
}

/**
 * Get the current API key configuration
 */
export function getCurrentApiKeyConfig(): ApiKeyConfig | null {
  const userKey = getStoredApiKey();
  
  if (userKey) {
    const validation = validateApiKeyFormat(userKey);
    return {
      apiKey: userKey,
      source: 'user',
      isValid: validation.isValid
    };
  }
  
  // Check if environment key exists (we can't access it directly from client, 
  // but we can indicate that it might be available)
  return {
    apiKey: '',
    source: 'environment',
    isValid: true // Assume environment key is valid if no user key exists
  };
}

/**
 * Check if user has a personal API key configured
 */
export function hasUserApiKey(): boolean {
  const userKey = getStoredApiKey();
  return userKey !== null && userKey.length > 0;
}