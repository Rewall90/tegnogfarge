import React from 'react';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { SVG_BLUR_PLACEHOLDER } from '@/lib/utils';
import type { FlagDrawing } from '@/types/flags';
import type { Locale } from '@/i18n';
import { getColorDisplayName, normalizeColor } from '@/lib/flag-utils';

interface FlagCardProps {
  flag: FlagDrawing;
  href: string;
  locale: Locale;
  isPriority?: boolean;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

const difficultyLabels: Record<string, Record<Locale, string>> = {
  easy: { no: "Enkel", sv: "Enkel" },
  medium: { no: "Middels", sv: "Medel" },
  hard: { no: "Vanskelig", sv: "Svår" },
};

export function FlagCard({
  flag,
  href,
  locale,
  isPriority = false
}: FlagCardProps) {
  const imageUrl = flag.thumbnail?.url || '';
  const imageAlt = flag.thumbnail?.alt || flag.title;
  const lqip = flag.thumbnail?.lqip || SVG_BLUR_PLACEHOLDER;

  const countryName = flag.flagMetadata?.geography.countryName;
  const continent = flag.flagMetadata?.geography.continent;
  const flagColors = flag.flagMetadata?.flagInfo.flagColors || [];

  // Get first 3 colors for display
  // First normalize from locale-specific (rød/röd) to English (red)
  // Then get the display name in the current locale
  const displayColors = flagColors.slice(0, 3).map(color => {
    const normalized = normalizeColor(color, locale);
    return getColorDisplayName(normalized, locale);
  });

  return (
    <Link
      href={href}
      className="group bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 block"
    >
      {/* Image */}
      <div className="relative w-full bg-gray-100" style={{ paddingTop: '133.33%' }}>
        <OptimizedImage
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-200"
          isPriority={isPriority}
          rootMargin="300px 0px"
          placeholder="blur"
          blurDataURL={lqip}
          quality={isPriority ? 85 : 75}
        />
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-display font-bold text-lg mb-2 text-navy line-clamp-2 group-hover:text-[#2EC4B6] transition-colors">
          {flag.title}
        </h3>

        {/* Country name */}
        {countryName && (
          <p className="text-sm text-gray-600 mb-2">
            {countryName}
          </p>
        )}

        {/* Metadata row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Continent */}
          {continent && (
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
              {continent}
            </span>
          )}

          {/* Difficulty */}
          {flag.difficulty && (
            <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyColors[flag.difficulty]}`}>
              {difficultyLabels[flag.difficulty]?.[locale] || difficultyLabels.medium[locale]}
            </span>
          )}
        </div>

        {/* Colors */}
        {displayColors.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-gray-500">
              {locale === 'no' ? 'Farger:' : 'Färger:'}
            </span>
            {displayColors.map((color, idx) => (
              <span
                key={idx}
                className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded capitalize"
              >
                {color}
              </span>
            ))}
            {flagColors.length > 3 && (
              <span className="text-xs text-gray-500">
                +{flagColors.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
