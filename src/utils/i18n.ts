import en from '../../locales/en.json';
import tr from '../../locales/tr.json';
import de from '../../locales/de.json';
import it from '../../locales/it.json';
import es from '../../locales/es.json';
import fr from '../../locales/fr.json';
import { useSettingsStore } from '../features/settings/store';

const translations: Record<string, any> = {
  en,
  tr,
  de,
  it,
  es,
  fr,
};

export const useTranslations = () => {
  const language = useSettingsStore((state) => state.language);
  return translations[language] || translations['en'];
};
