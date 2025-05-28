import React from "react";

interface SubcategoryHeaderProps {
  title: string;
  description?: string;
  difficulty: "easy" | "medium" | "hard";
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

export function SubcategoryHeader({ title, description, difficulty }: SubcategoryHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold mb-2 flex items-center">{title}</h1>
      {description && <p className="text-gray-600 mb-2">{description}</p>}
      <div className={`inline-block px-3 py-1 rounded text-xs font-medium ${difficultyColors[difficulty]}`}>
        {difficultyLabels[difficulty]}
      </div>
    </div>
  );
} 