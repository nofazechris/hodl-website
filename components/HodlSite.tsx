'use client';

import { useEffect, useRef } from 'react';
import type { EngineHandle } from '@/lib/engine/types';
import Intro from './sections/Intro';
import Overlays from './sections/Overlays';
import Nav from './sections/Nav';
import Menu from './sections/Menu';
import Hero from './sections/Hero';
import Statement from './sections/Statement';
import Vault from './sections/Vault';
import VaultStats from './sections/VaultStats';
import Mechanics from './sections/Mechanics';
import Reinvest from './sections/Reinvest';
import Collection from './sections/Collection';
import DiamondHands from './sections/DiamondHands';
import Community from './sections/Community';
import Verify from './sections/Verify';
import Finale from './sections/Finale';
import Footer from './sections/Footer';

/**
 * The whole page. Sections are static markup; the engine (client-only, code-split)
 * finds its hooks via data-k / data-* attributes inside this root and animates them.
 */
export default function HodlSite() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let engine: EngineHandle | null = null;
    let cancelled = false;
    import('@/lib/engine/engine').then(({ initEngine }) => {
      if (cancelled) return;
      root.classList.add('hodl-js');
      engine = initEngine(root);
    });
    return () => {
      cancelled = true;
      engine?.destroy();
    };
  }, []);

  return (
    <div id="hodl-root" ref={rootRef} style={{ position: 'relative', background: 'var(--bg)' }}>
      <Intro />
      <Overlays />
      <Nav />
      <Menu />
      <Hero />
      <Statement />
      <Vault />
      <VaultStats />
      <Mechanics />
      <Reinvest />
      <Collection />
      <DiamondHands />
      <Community />
      <Verify />
      <Finale />
      <Footer />
    </div>
  );
}
