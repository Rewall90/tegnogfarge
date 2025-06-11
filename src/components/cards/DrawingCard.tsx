import React from 'react';
import Link from 'next/link';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { SVG_BLUR_PLACEHOLDER } from '@/lib/utils';

interface DrawingCardProps {
  title: string;
  imageUrl: string;
  imageAlt: string;
  lqip: string;
  href: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  isPriority?: boolean;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

const difficultyLabels: Record<string, string> = {
  easy: "Enkel",
  medium: "Middels",
  hard: "Vanskelig",
};

export function DrawingCard({ 
  title,
  imageUrl,
  imageAlt,
  lqip,
  href,
  difficulty,
  isPriority = false
}: DrawingCardProps) {
  const content = (
    <>
      <div className="relative w-full bg-gray-100" style={{ paddingTop: '133.33%' }}>
        <OptimizedImage
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 25vw"
          className="object-cover"
          isPriority={isPriority}
          rootMargin="300px 0px"
          placeholder="blur"
          blurDataURL={lqip}
          quality={isPriority ? 85 : 75}
        />
      </div>
      <div className="p-2">
        <h2 className="font-display font-bold text-lg mb-1 truncate text-navy">{title}</h2>
        <div className="flex items-center justify-between text-xs mb-1">
          {difficulty && (
            <span className={`px-1.5 py-0.5 rounded text-xs ${difficultyColors[difficulty]}`}>
              {difficultyLabels[difficulty]}
            </span>
          )}
          {!difficulty && (
             <span className="px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-800">
               {difficultyLabels.medium}
             </span>
          )}
        </div>
      </div>
    </>
  );

  return (
    <Link href={href} className="bg-white border rounded-md overflow-hidden shadow-xs hover:shadow-sm transition-shadow block">
      {content}
    </Link>
  );
} 