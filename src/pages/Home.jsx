import React from "react";
import HeroSlider from "../components/Home-HeroSlider";
import DailyDeals from "../components/Home-FeaturedProducts";
import Brand from "../components/Home-BrandSection";
import CollectionShowcase from "../components/Home-There'sMoreToExplore";
import Explore from "../components/Home-ExploreSection";
import PerfectFit from "../components/Home-FindYourPerfectFit";
import ProductDetails from "../components/Home-NewProductDetail";
import ReviewsSection from "../components/Home-ReviewsSection";


const Home = () => {
  return (
    <div>
      <HeroSlider />
      <DailyDeals />
      <Brand />
      <CollectionShowcase />
      <PerfectFit />
      <ProductDetails />
      <ReviewsSection />
    </div>
  );
};

export default Home;