// "use client"; // Not strictly needed if children are client, but likely kept for Hero/etc context

import Navbar from '@/components/Navbar';
import HeroCarousel from '@/components/HeroCarousel';
import CategorySelection from '@/components/CategorySelection';
import HomeSectionsClient from '@/components/HomeSectionsClient';
import ReviewsCarousel from '@/components/ReviewsCarousel';
import { readStore } from '@/lib/demoStore';
import en from '@/lib/i18n/en';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const store = await readStore();

  return (
    <>
      <Navbar />
      <HeroCarousel />

      <main>
        <div className="container" style={{ marginTop: '20px' }}>
          <CategorySelection />
          <HomeSectionsClient />
        </div>

        {store.homeReviewsEnabled && <ReviewsCarousel />}
      </main>

      <footer style={{ background: '#000', color: 'white', padding: '60px 0 30px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>AuthenticBazar</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '32px', fontSize: '14px', color: '#aaa' }}>
            <span>{en?.footer?.about || "About Us"}</span>
            <span>{en?.footer?.terms || "Terms & Conditions"}</span>
            <span>{en?.footer?.privacy || "Privacy Policy"}</span>
          </div>
          <div style={{ fontSize: '13px', color: '#666' }}>
            &copy; 2026 AuthenticBazar. {en?.footer?.rights || "All rights reserved."}
          </div>
        </div>
      </footer>
    </>
  );
}
