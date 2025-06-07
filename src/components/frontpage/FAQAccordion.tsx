'use client';

import React, { useState } from 'react';

interface FAQAccordionProps {
  id: string;
  question: string;
  answer: string;
}

export default function FAQAccordion({ id, question, answer }: FAQAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };
  
  return (
    <article className="border-b border-gray-200 pb-4">
      <div className="flex justify-between items-center">
        <h3 id={id} className="text-lg font-semibold">{question}</h3>
        <button 
          className="text-gray-500" 
          aria-expanded={isOpen}
          aria-controls={`${id}-content`}
          aria-label={`${isOpen ? 'Skjul' : 'Vis'} svaret på ${question.toLowerCase()}`}
          onClick={toggleAccordion}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
            viewBox="0 0 20 20" 
            fill="currentColor" 
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </button>
      </div>
      <div 
        id={`${id}-content`} 
        className={`mt-2 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-gray-600">
          {answer}
        </p>
      </div>
    </article>
  );
} 