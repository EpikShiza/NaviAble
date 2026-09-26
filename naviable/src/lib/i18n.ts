export type LanguageCode = 'en' | 'hi' | 'es' | 'fr' | 'ar' | 'zh';

export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: 'EN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: 'HI' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: 'ES' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: 'FR' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: 'AR', rtl: true },
  { code: 'zh', name: 'Mandarin Chinese', nativeName: '中文', flag: 'ZH' },
];

const STORAGE_KEY = 'naviable-lang';

export function getStoredLanguage(): LanguageCode {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && LANGUAGES.some((l) => l.code === stored)) {
    return stored as LanguageCode;
  }
  return 'en';
}

type LanguageChangeListener = (code: LanguageCode) => void;
const languageChangeListeners = new Set<LanguageChangeListener>();

export function setStoredLanguage(code: LanguageCode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, code);
  languageChangeListeners.forEach((listener) => listener(code));
}

// Lets any component re-render with the new language the instant it changes,
// even though the language selector that triggered the change lives in a
// different part of the component tree (e.g. the header on LandingPage).
export function subscribeToLanguageChange(listener: LanguageChangeListener): () => void {
  languageChangeListeners.add(listener);
  return () => languageChangeListeners.delete(listener);
}

export function getLanguageByCode(code: LanguageCode): Language {
  return LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
}

// Minimal translation dictionary — structured for future expansion.
// Only key UI strings are translated; content from the database stays in English.
const translations: Record<LanguageCode, Record<string, string>> = {
  en: {},
  hi: {
    'nav.explore': 'एक्सप्लोर',
    'nav.quest': 'रूट क्वेस्ट',
    'nav.helpers': 'हेल्पर्स',
    'nav.lessons': 'पाठ',
    'landing.hero_title': 'आत्मविश्वास के साथ दुनिया को नेविगेट करें',
    'landing.hero_sub': 'NaviAble लोगों को अधिक स्वतंत्र रूप से यात्रा करने में मदद करता है',
    'landing.get_started': 'शुरू करें',
    'landing.explore_now': 'NaviAble एक्सप्लोर करें',
    'auth.signin': 'साइन इन',
    'auth.signup': 'साइन अप',
    'common.back': 'वापस',
    'common.continue': 'जारी रखें',
    'common.skip': 'अभी छोड़ें',
    'common.submit': 'सबमिट',
  },
  es: {
    'nav.explore': 'Explorar',
    'nav.quest': 'Ruta',
    'nav.helpers': 'Ayudantes',
    'nav.lessons': 'Lecciones',
    'landing.hero_title': 'Navega el mundo con confianza',
    'landing.hero_sub': 'NaviAble ayuda a las personas a viajar con más independencia',
    'landing.get_started': 'Comenzar',
    'landing.explore_now': 'Explorar NaviAble',
    'auth.signin': 'Iniciar sesión',
    'auth.signup': 'Registrarse',
    'common.back': 'Volver',
    'common.continue': 'Continuar',
    'common.skip': 'Omitir',
    'common.submit': 'Enviar',
  },
  fr: {
    'nav.explore': 'Explorer',
    'nav.quest': 'Itinéraire',
    'nav.helpers': 'Assistants',
    'nav.lessons': 'Leçons',
    'landing.hero_title': 'Naviguez le monde en confiance',
    'landing.hero_sub': "NaviAble aide les personnes à voyager plus indépendamment",
    'landing.get_started': 'Commencer',
    'landing.explore_now': 'Explorer NaviAble',
    'auth.signin': 'Se connecter',
    'auth.signup': "S'inscrire",
    'common.back': 'Retour',
    'common.continue': 'Continuer',
    'common.skip': 'Passer',
    'common.submit': 'Envoyer',
  },
  ar: {
    'nav.explore': 'استكشاف',
    'nav.quest': 'المسار',
    'nav.helpers': 'المساعدون',
    'nav.lessons': 'الدروس',
    'landing.hero_title': 'تنقل في العالم بثقة',
    'landing.hero_sub': 'NaviAble يساعد الناس على السفر بمزيد من الاستقلالية',
    'landing.get_started': 'ابدأ',
    'landing.explore_now': 'استكشف NaviAble',
    'auth.signin': 'تسجيل الدخول',
    'auth.signup': 'إنشاء حساب',
    'common.back': 'رجوع',
    'common.continue': 'متابعة',
    'common.skip': 'تخطٍ',
    'common.submit': 'إرسال',
  },
  zh: {
    'nav.explore': '探索',
    'nav.quest': '路线',
    'nav.helpers': '助手',
    'nav.lessons': '课程',
    'landing.hero_title': '自信地导航世界',
    'landing.hero_sub': 'NaviAble 帮助人们更独立地出行',
    'landing.get_started': '开始使用',
    'landing.explore_now': '探索 NaviAble',
    'auth.signin': '登录',
    'auth.signup': '注册',
    'common.back': '返回',
    'common.continue': '继续',
    'common.skip': '跳过',
    'common.submit': '提交',
  },
};

export function t(key: string, lang: LanguageCode = 'en'): string {
  const dict = translations[lang] || translations.en;
  return dict[key] || translations.en[key] || key;
}
