"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../../../components/shared/Header';
import Footer from '../../../components/shared/Footer';
import { getPosts } from '@/lib/sanity';
import Image from 'next/image';
import { urlForImage } from '@/lib/sanityImageUrl';

export default function BlogPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Blog</h1>
      <p className="mb-4">Du har publisert kategorien "Superhelter" og innlegget "Mario" i Sanity Studio.</p>
      <p>For å se og administrere innholdet, besøk Sanity Studio på:</p>
      <a 
        href="http://localhost:3333" 
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        http://localhost:3333
      </a>
    </div>
  );
} 