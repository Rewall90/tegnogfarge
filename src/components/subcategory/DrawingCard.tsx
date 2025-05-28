import React from "react";
import Image from "next/image";

interface DrawingCardProps {
  drawing: {
    _id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    difficulty: "easy" | "medium" | "hard";
    hasDigitalColoring?: boolean;
    downloadUrl?: string;
  };
}

const difficultyColors = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  hard: "bg-red-100 text-red-800",
};

const difficultyLabels = {
  easy: "Enkel",
  medium: "Middels",
  hard: "Vanskelig",
};

export function DrawingCard({ drawing }: DrawingCardProps) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {drawing.imageUrl && (
        <div className="relative h-48 w-full bg-gray-100">
          <Image
            src={drawing.imageUrl}
            alt={drawing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h2 className="font-bold text-lg mb-2">{drawing.title}</h2>
        {drawing.description && <p className="text-gray-600 text-sm mb-3">{drawing.description}</p>}
        <div className="flex items-center justify-between text-sm mb-2">
          <span className={`px-2 py-1 rounded text-xs ${difficultyColors[drawing.difficulty]}`}>
            {difficultyLabels[drawing.difficulty]}
          </span>
          {drawing.hasDigitalColoring && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs ml-2">Digital</span>
          )}
        </div>
        <div className="flex gap-2">
          {drawing.downloadUrl && (
            <a
              href={drawing.downloadUrl}
              download
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
            >
              Last ned PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
} 