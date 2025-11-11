/**
 * Sanity Studio
 * Accesible en /studio
 */
'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity/sanity.config';

export default function StudioPage() {
  return <NextStudio config={config} />;
}
