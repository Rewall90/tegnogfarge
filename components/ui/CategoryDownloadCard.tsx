import React from 'react';
import Button from './Button';

interface CategoryDownloadCardProps {
  title: string;
  imageUrl: string;
  description?: string;
  downloadUrl: string;
  className?: string;
}

export default function CategoryDownloadCard({ 
  title, 
  imageUrl, 
  description, 
  downloadUrl,
  className = '' 
}: CategoryDownloadCardProps) {
  return (
    <div className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div 
        className="h-64 bg-cover bg-center" 
        style={{ backgroundImage: `url(${imageUrl})` }}
        aria-hidden="true"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        {description && (
          <p className="text-gray-600 text-sm mb-4">{description}</p>
        )}
        <Button 
          href={downloadUrl}
          variant="primary"
          ariaLabel={`Last ned ${title}`}
        >
          Last ned PDF
        </Button>
      </div>
    </div>
  );
} 