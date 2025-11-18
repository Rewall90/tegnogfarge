'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { Locale } from '@/i18n';
import type { FlagSortOption } from '@/types/flags';
import { flagsTranslations } from '@/i18n/translations/flags';

interface FlagSortMenuProps {
  currentSort: FlagSortOption;
  onSortChange: (sort: FlagSortOption) => void;
  locale: Locale;
}

// Map sort options to translation keys
const SORT_OPTION_KEYS: Record<FlagSortOption, string> = {
  'name-asc': 'nameAsc',
  'population-desc': 'populationDesc',
  'population-asc': 'populationAsc',
  'continent-asc': 'continentAsc',
  'difficulty-asc': 'difficultyAsc',
};

export function FlagSortMenu({ currentSort, onSortChange, locale }: FlagSortMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const t = flagsTranslations[locale as 'no' | 'sv'];

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSortSelect = (sortOption: FlagSortOption) => {
    onSortChange(sortOption);
    setIsOpen(false);
  };

  const sortOptions: FlagSortOption[] = [
    'name-asc',
    'population-desc',
    'population-asc',
    'continent-asc',
    'difficulty-asc',
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Sort button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#2EC4B6] focus:border-transparent transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="text-sm font-medium text-gray-700">{t.sort.title}</span>

        {/* Hamburger icon */}
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>

        {/* Dropdown arrow */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-10 animate-in fade-in slide-in-from-top-2 duration-200"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="py-1">
            {sortOptions.map((option) => {
              const isActive = currentSort === option;
              const translationKey = SORT_OPTION_KEYS[option] as keyof typeof t.sort.options;
              const label = t.sort.options[translationKey];

              return (
                <button
                  key={option}
                  onClick={() => handleSortSelect(option)}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 transition-colors ${
                    isActive ? 'bg-[#2EC4B6]/5 text-[#2EC4B6] font-medium' : 'text-gray-700'
                  }`}
                  role="menuitem"
                >
                  <span>{label}</span>
                  {isActive && (
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
