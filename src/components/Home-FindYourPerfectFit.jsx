// sweetyintimate/src/components/Home-FindYourPerfectFit.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PerfectFitSection = () => {
  const navigate = useNavigate();
  const imageRefs = useRef([]);
  const textRefs = useRef([]);

  // Sample image URLs - replace with your actual images
  const images = [
    "https://res.cloudinary.com/dihmaledw/image/upload/v1759486594/DSC04399_1_1_uqeu3r.jpg",
    "https://res.cloudinary.com/dihmaledw/image/upload/v1759486587/_T7A4987_1_ltmbiq.jpg",
    "https://res.cloudinary.com/dihmaledw/image/upload/v1759485594/_T7A4667_kycdfp.jpg",
    "https://res.cloudinary.com/dihmaledw/image/upload/v1759485605/_T7A4854_oqkv8d.jpg",
    "https://res.cloudinary.com/dihmaledw/image/upload/v1759485594/_T7A4560_qeeabx.jpg",
    "https://res.cloudinary.com/dihmaledw/image/upload/v1759485590/_T7A4951_cdbzyj.jpg",
    "https://res.cloudinary.com/dihmaledw/image/upload/v1759486767/_T7A4629_1_mvuj7v.jpg"
  ];

  const [loadedImages, setLoadedImages] = useState(new Array(images.length).fill(false));

  useEffect(() => {
    // Add hover animations using CSS transitions
    imageRefs.current.forEach((img, index) => {
      if (img) {
        img.addEventListener('mouseenter', () => {
          img.style.transform = 'scale(1.05)';
          img.style.filter = 'brightness(1.1)';
        });
        
        img.addEventListener('mouseleave', () => {
          img.style.transform = 'scale(1)';
          img.style.filter = 'brightness(1)';
        });
      }
    });

    // Text reveal animation on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    });

    textRefs.current.forEach((ref) => {
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Handle Shop Now button click - navigate to Bras category
  const handleShopNow = () => {
    navigate('/products/bras');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full flex flex-col my-4">
      {/* Google Fonts Link */}
      <link 
        href="https://fonts.googleapis.com/css2?family=Bungee+Shade&family=ABeeZee:ital,wght@0,400;1,400&family=Abhaya+Libre:wght@800&display=swap" 
        rel="stylesheet" 
      />

      {/* Images Section - Maintains aspect ratio across devices */}
      <div className="w-full">
        {/* Desktop: 7 images in a row */}
        <div className="hidden lg:flex w-full">
          {images.map((src, index) => (
            <div 
              key={index} 
              className="flex-1 relative"
              style={{ aspectRatio: '4/5' }}
            >
              {!loadedImages[index] && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
              <img
                ref={(el) => imageRefs.current[index] = el}
                src={src}
                alt={`Bra fit ${index + 1}`}
                className={`w-full h-full object-cover transition-all duration-300 ease-out ${loadedImages[index] ? "opacity-100" : "opacity-0"}`}
                loading="lazy"
                onLoad={() => {
                  setLoadedImages(prev => {
                    const newLoaded = [...prev];
                    newLoaded[index] = true;
                    return newLoaded;
                  });
                }}
              />
            </div>
          ))}
        </div>

        {/* Tablet: 4 images on top, 3 on bottom */}
        <div className="hidden md:block lg:hidden w-full">
          <div className="flex w-full">
            {images.slice(0, 4).map((src, index) => (
              <div 
                key={index} 
                className="flex-1 relative"
                style={{ aspectRatio: '4/5' }}
              >
                {!loadedImages[index] && (
                  <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                )}
                <img
                  ref={(el) => imageRefs.current[index] = el}
                  src={src}
                  alt={`Bra fit ${index + 1}`}
                  className={`w-full h-full object-cover transition-all duration-300 ease-out ${loadedImages[index] ? "opacity-100" : "opacity-0"}`}
                  loading="lazy"
                  onLoad={() => {
                    setLoadedImages(prev => {
                      const newLoaded = [...prev];
                      newLoaded[index] = true;
                      return newLoaded;
                    });
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex w-full">
            {images.slice(4, 7).map((src, idx) => {
              const index = idx + 4;
              return (
                <div 
                  key={index}
                  className="flex-1 relative"
                  style={{ aspectRatio: '4/5' }}
                >
                  {!loadedImages[index] && (
                    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  )}
                  <img
                    ref={(el) => imageRefs.current[index] = el}
                    src={src}
                    alt={`Bra fit ${index + 1}`}
                    className={`w-full h-full object-cover transition-all duration-300 ease-out ${loadedImages[index] ? "opacity-100" : "opacity-0"}`}
                    loading="lazy"
                    onLoad={() => {
                      setLoadedImages(prev => {
                        const newLoaded = [...prev];
                        newLoaded[index] = true;
                        return newLoaded;
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: 2 columns, multiple rows */}
        <div className="grid grid-cols-2 gap-0 md:hidden w-full">
          {images.slice(0, 6).map((src, index) => (
            <div 
              key={index}
              className="relative"
              style={{ aspectRatio: '4/5' }}
            >
              {!loadedImages[index] && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
              <img
                ref={(el) => imageRefs.current[index] = el}
                src={src}
                alt={`Bra fit ${index + 1}`}
                className={`w-full h-full object-cover transition-all duration-300 ease-out ${loadedImages[index] ? "opacity-100" : "opacity-0"}`}
                loading="lazy"
                onLoad={() => {
                  setLoadedImages(prev => {
                    const newLoaded = [...prev];
                    newLoaded[index] = true;
                    return newLoaded;
                  });
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Text Section - Scales proportionally */}
      <div 
        className="flex-1 flex flex-col justify-center items-center text-center px-4 py-8 sm:py-12 lg:py-5"
        style={{ 
          backgroundColor: 'rgba(249, 231, 237, 1)',
          minHeight: 'clamp(300px, 30vh, 500px)'
        }}
      >
        {/* FIND YOUR - Bungee Shade Font */}
        <div 
          ref={(el) => textRefs.current[0] = el}
          className="mb-2 sm:mb-4 opacity-0 transition-all duration-800"
          style={{ 
            fontFamily: '"Bungee Shade", cursive',
            fontSize: 'clamp(1.5rem, 4vw, 4rem)',
            transform: 'translateY(30px)',
            lineHeight: '1.1'
          }}
        >
          FIND YOUR
        </div>

        {/* PERFECT FIT */}
        <div 
          ref={(el) => textRefs.current[1] = el}
          className="mb-4 sm:mb-6 font-bold tracking-widest opacity-0 transition-all duration-800 delay-200"
          style={{ 
            fontFamily: '"Abhaya Libre", serif',
            fontWeight: '800',
            fontSize: 'clamp(1.25rem, 3.5vw, 3rem)',
            letterSpacing: 'clamp(0.1em, 0.3em, 0.5em)',
            transform: 'translateY(30px)',
            lineHeight: '1.1'
          }}
        >
          PERFECT FIT
        </div>

        {/* Your Comfiest Bra Awaits */}
        <div 
          ref={(el) => textRefs.current[2] = el}
          className="mb-6 sm:mb-8 opacity-0 transition-all duration-800 delay-400 text-center max-w-md"
          style={{ 
            fontFamily: '"ABeeZee", sans-serif',
            fontWeight: 400,
            fontSize: 'clamp(1.1rem, 2.5vw, 1.8rem)',
            lineHeight: '1.2',
            letterSpacing: '-0.01em',
            transform: 'translateY(30px)'
          }}
        >
          Your Comfiest Bra Awaits
        </div>

        {/* SHOP NOW Button */}
        <div 
          ref={(el) => textRefs.current[3] = el}
          className="opacity-0 transition-all duration-800 delay-600"
          style={{ transform: 'translateY(30px)' }}
        >
          <button 
            onClick={handleShopNow}
            className="border-2 border-black font-semibold tracking-wider hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-105 cursor-pointer"
            style={{
              padding: 'clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)',
              fontSize: 'clamp(0.9rem, 1.8vw, 1.125rem)'
            }}
          >
            SHOP NOW
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerfectFitSection;