import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { i18n } from './i18n.js';
import { readStorage, writeStorage } from './storage.js';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => (readStorage('lang') === 'en' ? 'en' : 'pt'));

  useEffect(() => {
    writeStorage('lang', lang);
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  }, [lang]);

  const t = useCallback((key) => i18n[lang][key] ?? i18n.pt[key] ?? key, [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang precisa estar dentro de <LangProvider>');
  return ctx;
}

/** Renderiza um texto traduzido que pode conter HTML estático (strong, em, br). */
export function T({ k, as: Tag = 'span', ...props }) {
  const { t } = useLang();
  return <Tag {...props} dangerouslySetInnerHTML={{ __html: t(k) }} />;
}
