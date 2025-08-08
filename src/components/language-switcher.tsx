'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { languages, getCurrentLanguage, setStoredLanguage, isValidLanguage } from '@/i18n';

interface LanguageSwitcherProps {
  className?: string;
}

const languageNames = {
  en: 'English',
  ko: '한국어'
} as const;

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { t, i18n } = useTranslation(['common', 'settings']);
  const [currentLang, setCurrentLang] = useState<string>('en');

  useEffect(() => {
    const lang = getCurrentLanguage();
    setCurrentLang(lang);
  }, []);

  const handleLanguageChange = (newLanguage: string) => {
    if (isValidLanguage(newLanguage)) {
      setCurrentLang(newLanguage);
      setStoredLanguage(newLanguage);
      i18n.changeLanguage(newLanguage);
      
      // Update html lang attribute
      if (typeof document !== 'undefined') {
        document.documentElement.lang = newLanguage;
      }
    }
  };

  return (
    <div className={`space-y-2 ${className || ''}`}>
      <Label htmlFor="language-switcher" className="text-sm font-medium flex items-center gap-2">
        <Globe className="h-4 w-4" />
        {t('settings:interface.language.label')}
      </Label>
      <Select value={currentLang} onValueChange={handleLanguageChange}>
        <SelectTrigger id="language-switcher" className="w-full">
          <SelectValue>
            {languageNames[currentLang as keyof typeof languageNames] || currentLang}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {languageNames[lang as keyof typeof languageNames] || lang}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default LanguageSwitcher;