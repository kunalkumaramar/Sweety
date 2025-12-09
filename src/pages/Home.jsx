import React, { Suspense } from "react";
import HeroSlider from "../components/Home-HeroSlider";

// Lazy load non-critical components to improve LCP
const DailyDeals = React.lazy(() => import("../components/Home-FeaturedProducts"));
const Brand = React.lazy(() => import("../components/Home-BrandSection"));
const CollectionShowcase = React.lazy(() => import("../components/Home-There'sMoreToExplore"));
const PerfectFit = React.lazy(() => import("../components/Home-FindYourPerfectFit"));
const ProductDetails = React.lazy(() => import("../components/Home-NewProductDetail"));
const ReviewsSection = React.lazy(() => import("../components/Home-ReviewsSection"));

// Loading placeholder for lazy components
const LazyComponentFallback = () => (
  <div className="w-full py-12 flex justify-center">
    <div className="animate-pulse text-gray-400">Loading...</div>
  </div>
);

const Home = () => {
  return (
    <div>
      {/* Critical above-the-fold component - loads immediately */}
      <HeroSlider />
      
      {/* Below-the-fold components - lazy loaded */}
      <Suspense fallback={<LazyComponentFallback />}>
        <DailyDeals />
      </Suspense>
      
      <Suspense fallback={<LazyComponentFallback />}>
        <Brand />
      </Suspense>
      
      <Suspense fallback={<LazyComponentFallback />}>
        <CollectionShowcase />
      </Suspense>
      
      <Suspense fallback={<LazyComponentFallback />}>
        <PerfectFit />
      </Suspense>
      
      <Suspense fallback={<LazyComponentFallback />}>
        <ProductDetails />
      </Suspense>
      
      <Suspense fallback={<LazyComponentFallback />}>
        <ReviewsSection />
      </Suspense>
    </div>
  );
};

export default Home;