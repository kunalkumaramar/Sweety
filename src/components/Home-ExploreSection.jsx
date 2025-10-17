import React, { useEffect, useRef } from 'react';

import logo from "/favicon.png"

const SweetyIntimatesLanding = () => {
  const heroRef = useRef(null);
  const productsRef = useRef(null);
  const offersRef = useRef(null);

  useEffect(() => {
    // GSAP animations for hover effects and page load
    const handleMouseEnter = (element) => {
      if (window.gsap) {
        window.gsap.to(element, {
          scale: 1.02,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    };

    const handleMouseLeave = (element) => {
      if (window.gsap) {
        window.gsap.to(element, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      }
    };

    // Add hover animations to interactive elements
    const animatedElements = document.querySelectorAll('.hover-animate');
    animatedElements.forEach(element => {
      element.addEventListener('mouseenter', () => handleMouseEnter(element));
      element.addEventListener('mouseleave', () => handleMouseLeave(element));
    });

    // Load GSAP from CDN if not available
    if (!window.gsap) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
      document.head.appendChild(script);
    }

    return () => {
      animatedElements.forEach(element => {
        element.removeEventListener('mouseenter', () => handleMouseEnter(element));
        element.removeEventListener('mouseleave', () => handleMouseLeave(element));
      });
    };
  }, []);

  return (
    <div className="w-full">
      {/* Section 1: Hero Section */}
      <section ref={heroRef} className="min-h-screen flex flex-col lg:flex-row">
        {/* Image Section */}
        <div className="w-full lg:w-[30%] h-64 sm:h-80 lg:h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-rose-50">
          <div className="h-full flex items-center justify-center">
            <img 
              src={prd5} 
              alt="Sweety Intimates Model" 
              className="w-full h-full object-cover hover-animate cursor-pointer"
            />
          </div>
        </div>
        
        {/* Content Section */}
        <div className="w-full lg:w-[70%] min-h-screen lg:h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center px-6 sm:px-8 lg:px-12  lg:py-0">
          <div className="text-center w-full max-w-4xl">
            {/* Logo */}
            <div className="mb-6 sm:mb-8 lg:mb-12">
              <img 
                src={logo} 
                alt="Sweety Intimates Logo" 
                className="mx-auto h-16 sm:h-20 lg:h-32 xl:h-40 w-auto"
              />
            </div>

            {/* Main Content */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              <h1 className="text-lg sm:text-xl lg:text-3xl xl:text-4xl font-light text-gray-800 leading-relaxed px-2 sm:px-4">
                More than lingerie — Sweety Intimates is about celebrating your curves, your comfort, and your confidence, one intimate piece at a time.
              </h1>
              
              <div className="space-y-2 sm:space-y-3 lg:space-y-4">
                <p className="text-base sm:text-lg lg:text-xl font-medium text-gray-700">Confidence starts underneath</p>
                <p className="text-sm sm:text-base lg:text-lg text-gray-600">Intimates that embrace you</p>
              </div>

              {/* CTA Button */}
              <button className="mt-6 sm:mt-8 lg:mt-12 px-8 sm:px-10 lg:px-12 py-3 lg:py-4 bg-transparent border border-gray-600 text-gray-700 font-medium text-sm sm:text-base lg:text-lg tracking-wide hover-animate cursor-pointer transition-all duration-300 hover:bg-gray-600 hover:text-white rounded-sm">
                KNOW MORE ABOUT US
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Product Showcase */}
      <section ref={productsRef} className="min-h-screen bg-white py-12 sm:py-16 lg:py-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-center min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 w-full max-w-6xl">
              
              {/* Product 1 */}
              <div className="text-center hover-animate cursor-pointer">
                <div className="mb-6 sm:mb-8 overflow-hidden"
                style={{
                  fontFamily:"Adamina",
                }}>
                  <img 
                    src={prd7}
                    alt="Sweety's Secret Dream" 
                    className="w-full h-64 sm:h-80 lg:h-96 xl:h-[500px] object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="space-y-3 sm:space-y-4 text-left">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-gray-800" style={{fontFamily:"Adamina"}}>Sweety's Secret Dream</h3>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-widest">BEAUTY & COMFORT: A MATCH MADE IN HEAVEN</p>
                  <p className="text-sm sm:text-base text-gray-600">Featuring Feminine, ethereal colors.</p>
                  <div className="pt-2">
                    <button className="text-base sm:text-lg font-medium text-gray-800 border-b-4 border-gray-800 hover:text-gray-600 hover:border-b-pink-700 transition-colors duration-300 pb-1">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Product 2 */}
              <div className="text-center hover-animate cursor-pointer">
                <div className="mb-6 sm:mb-8 overflow-hidden">
                  <img 
                    src={prd6}
                    alt="The VSX Elevate Collection" 
                    className="w-full h-64 sm:h-80 lg:h-96 xl:h-[500px] object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="space-y-3 sm:space-y-4 text-left">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-gray-800" style={{fontFamily:"Adamina"}}>The VSX Elevate Collection</h3>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 uppercase tracking-widest">Discover our customer-favorite collection</p>
                  <p className="text-sm sm:text-base text-gray-600">Featuring Feminine, ethereal colors.</p>
                  <div className="pt-2">
                    <button className="text-base sm:text-lg font-medium text-gray-800 border-b-4 border-gray-800 hover:text-gray-600 hover:border-b-pink-700 transition-colors duration-300 pb-1">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Offers with Background Images */}
      <section ref={offersRef} className="py-12 sm:py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            
            {/* Offer 1 - Packs of 2 Bra */}
            <div className="flex flex-col">
              <div className="relative overflow-hidden rounded-3xl hover-animate cursor-pointer group h-64 sm:h-72 lg:h-80 mb-4">
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: {prd8},
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-br from-pink-200/60 via-pink-100/70 to-rose-200/60"></div>
                <div className="relative h-full flex flex-col justify-center items-center text-center p-6 sm:p-8 z-10">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pink-600 mb-2 uppercase tracking-tight">PACKS OF 2 BRA</h3>
                  <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-pink-600">₹499 ONWARDS</p>
                </div>
              </div>
              <button className="text-base sm:text-lg font-medium text-gray-800 hover:text-gray-600 transition-colors duration-300 text-center">
                Shop now
              </button>
            </div>

            {/* Offer 2 - Steal This Deal */}
            <div className="flex flex-col">
              <div className="relative overflow-hidden rounded-3xl hover-animate cursor-pointer group h-64 sm:h-72 lg:h-80 mb-4">
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: {prd9},
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-br from-pink-200/60 via-rose-100/70 to-pink-200/60"></div>
                <div className="relative h-full flex flex-col justify-center items-center text-center p-6 sm:p-8 z-10">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pink-600 mb-2 uppercase tracking-tight">STEAL THIS DEAL</h3>
                  <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-pink-600 uppercase">ONLY FOR A FEW HOURS!</p>
                </div>
              </div>
              <button className="text-base sm:text-lg font-medium text-gray-800 hover:text-gray-600 transition-colors duration-300 text-center">
                Shop now
              </button>
            </div>

            {/* Offer 3 - Packs of 3 Panties */}
            <div className="flex flex-col sm:col-span-2 lg:col-span-1">
              <div className="relative overflow-hidden rounded-3xl hover-animate cursor-pointer group h-64 sm:h-72 lg:h-80 mb-4">
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage:{prd10},
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-br from-pink-200/60 via-rose-100/70 to-pink-200/60"></div>
                <div className="relative h-full flex flex-col justify-center items-center text-center p-6 sm:p-8 z-10">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-pink-600 mb-2 uppercase tracking-tight">PACKS OF 3 PANTIES</h3>
                  <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-pink-600">₹325 ONWARDS</p>
                </div>
              </div>
              <button className="text-base sm:text-lg font-medium text-gray-800 hover:text-gray-600 transition-colors duration-300 text-center">
                Shop now
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SweetyIntimatesLanding;