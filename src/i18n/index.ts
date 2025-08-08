'use client';

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

import { getOptions, languages, cookieName } from './settings';

const runsOnServerSide = typeof window === 'undefined';

// Initialize i18next for client-side
i18next
  .use(initReactI18next)
  .use(resourcesToBackend((language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`)))
  .init({
    ...getOptions(),
    // Start with stored language or fallback to 'en'
    lng: getStoredLanguage() || 'en',
  });

export default i18next;

// Export utility functions for language management
export { languages, cookieName };

export function getStoredLanguage(): string | null {
  if (runsOnServerSide) return null;
  
  // Try to get from localStorage first
  try {
    const stored = localStorage.getItem('preferred-language');
    if (stored && isValidLanguage(stored)) {
      return stored;
    }
  } catch {
    // localStorage might not be available
  }
  
  // Try to get from cookie
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === cookieName) {
      return value;
    }
  }
  
  return null;
}

export function setStoredLanguage(language: string): void {
  if (runsOnServerSide) return;
  
  // Store in localStorage
  try {
    localStorage.setItem('preferred-language', language);
  } catch {
    // localStorage might not be available
  }
  
  // Store in cookie
  document.cookie = `${cookieName}=${language}; path=/; max-age=${365 * 24 * 60 * 60}; samesite=lax`;
  
  // Change i18next language
  i18next.changeLanguage(language);
}

export function getCurrentLanguage(): string {
  return i18next.language || 'en';
}

export function isValidLanguage(lang: string): boolean {
  return languages.includes(lang);
}