export const fallbackLng = 'en';
export const languages = [fallbackLng, 'ko'];
export const defaultNS = 'common';
export const cookieName = 'i18next';

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
    // Note: detection config is set in index.ts to avoid duplication
  };
}