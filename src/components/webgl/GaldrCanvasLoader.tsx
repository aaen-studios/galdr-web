'use client';

/* Thin client wrapper so page.tsx (a Server Component) can include
   the WebGL canvas without violating the ssr: false restriction. */

import dynamic from 'next/dynamic';

const GaldrCanvas = dynamic(() => import('@/components/webgl/GaldrCanvas'), {
  ssr: false,
});

export default function GaldrCanvasLoader() {
  return <GaldrCanvas />;
}
