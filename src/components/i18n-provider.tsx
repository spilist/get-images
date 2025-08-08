'use client';

import { useEffect, useState } from 'react';
import i18next from '@/i18n';
import '@/i18n'; // Import to initialize i18n

interface I18nProviderProps {
  children: React.ReactNode;
}

export default function I18nProvider({ children }: I18nProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeI18n = async () => {
      // Wait for i18next to be initialized
      if (!i18next.isInitialized) {
        await new Promise((resolve) => {
          const checkInitialized = () => {
            if (i18next.isInitialized) {
              resolve(void 0);
            } else {
              setTimeout(checkInitialized, 10);
            }
          };
          checkInitialized();
        });
      }

      // On client side, ensure we use the stored language
      if (typeof window !== 'undefined') {
        const storedLang = localStorage.getItem('preferred-language');
        if (storedLang && ['en', 'ko'].includes(storedLang)) {
          await i18next.changeLanguage(storedLang);
        }
      }
      
      setIsInitialized(true);
    };

    initializeI18n();
  }, []);

  // Don't render children until i18next is initialized
  if (!isInitialized) {
    return null;
  }

  return <>{children}</>;
}