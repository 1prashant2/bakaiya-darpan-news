export { ne, type TranslationKeys } from './ne';
export { en } from './en';

export type Language = 'ne' | 'en';

export const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली' },
  { code: 'en', name: 'English', nativeName: 'English' },
];
