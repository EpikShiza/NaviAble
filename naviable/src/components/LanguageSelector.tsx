import { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { LANGUAGES, getStoredLanguage, setStoredLanguage, getLanguageByCode, type LanguageCode } from '@/lib/i18n';

interface Props {
  onLanguageChange?: (code: LanguageCode) => void;
  compact?: boolean;
}

export default function LanguageSelector({ onLanguageChange, compact = false }: Props) {
  const [current, setCurrent] = useState<LanguageCode>(getStoredLanguage());
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function selectLanguage(code: LanguageCode) {
    setCurrent(code);
    setStoredLanguage(code);
    setOpen(false);
    onLanguageChange?.(code);
  }

  const currentLang = getLanguageByCode(current);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-lg transition-colors ${
          compact
            ? 'px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            : 'px-3 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300 hover:bg-slate-50'
        }`}
        aria-label={`Language: ${currentLang.name}`}
        aria-expanded={open}
      >
        <Globe className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
        <span>{currentLang.nativeName}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[180px] overflow-hidden rounded-xl bg-white py-1.5 shadow-lg ring-1 ring-slate-200/60 animate-fade-in-up">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => selectLanguage(lang.code)}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-slate-50 ${
                current === lang.code ? 'text-blue-600 font-semibold' : 'text-slate-600'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-7 items-center justify-center rounded bg-slate-100 text-[10px] font-bold text-slate-500">
                  {lang.flag}
                </span>
                <div>
                  <p className="leading-tight">{lang.nativeName}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">{lang.name}</p>
                </div>
              </div>
              {current === lang.code && <Check className="h-4 w-4 shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
