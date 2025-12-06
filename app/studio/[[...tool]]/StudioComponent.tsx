'use client';

import { NextStudio } from 'next-sanity/studio';
import config from '@/sanity/sanity.config';

/**
 * Sanity Studio Component
 * Separated for dynamic import optimization
 */
export default function StudioComponent() {
  return <NextStudio config={config} />;
}
