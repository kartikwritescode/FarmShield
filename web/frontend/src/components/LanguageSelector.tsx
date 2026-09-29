'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../providers/LanguageProvider';
import { languagesList, SupportedLanguage } from '../translations';
import { Globe, ChevronDown, Check } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const currentLangObj = languagesList.find((l) => l.code === language) || languagesList[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl px-3 py-1.5 text-xs font-bold text-teal-800 shadow-2xs transition-all"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4 text-teal-700" />
        <span>{currentLangObj.flag} {currentLangObj.nativeName}</span>
        <ChevronDown className={`w-3.5 h-3.5 opacity-70 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl z-[120] py-2 max-h-80 overflow-y-auto animate-in fade-in">
          <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
            Select Language (12 Indian Languages)
          </div>
          {languagesList.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-bold transition-colors ${
                language === lang.code
                  ? 'bg-teal-50 text-teal-800 font-bold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{lang.flag}</span>
                <span>{lang.nativeName}</span>
                <span className="text-[10px] text-slate-400 font-normal">({lang.name})</span>
              </div>
              {language === lang.code && <Check className="w-4 h-4 text-teal-700" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
