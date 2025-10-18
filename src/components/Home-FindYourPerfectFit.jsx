// sweetyintimate/src/components/Home-FindYourPerfectFit.jsx
import React, { useEffect, useRef, useState, forwardRef } from "react";
import { useNavigate } from "react-router-dom";

// Cloudinary Image Optimization Component
const CloudinaryImage = forwardRef(({ 
  src, 
  alt, 
  className, 
  priority = false, 
  thumbnail = false, 
  sizes = '100vw',
  ...props 
}, ref) => {
  const [isMobile] = useState(window.innerWidth < 768);

  // Determine optimal width for src fallback
  const getOptimalWidth = () => {
    if (thumbnail) return 150;
    if (priority) return isMobile ? 800 : 1200;
    return isMobile ? 300 : 500;
  };

  const getQuality = () => {
    if (thumbnail) return 'auto:low';
    return priority ? 'auto:best' : 'auto:eco';
  };

  const optimizeUrl = (url) => {
    if (!url?.includes('cloudinary.com')) return url;
   
    const parts = url.match(/(https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)([^\/]*)\/v(\d+)\/([^?]+)(\?.*)?/);
    if (!parts) return url;
   
    const [, base, , ver, path, query] = parts;
    const width = getOptimalWidth();
    const quality = getQuality();
    const newTransforms = `f_auto,q_${quality},w_${width},c_limit`;
   
    return `${base}${newTransforms}/v${ver}/${path}${query || ''}`;
  };

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    if (thumbnail || !src?.includes('cloudinary.com')) return undefined;
   
    const parts = src.match(/(https?:\/\/res\.cloudinary\.com\/[^\/]+\/image\/upload\/)([^\/]*)\/v(\d+)\/([^?]+)(\?.*)?/);
    if (!parts) return undefined;
   
    const [, base, , ver, path, query] = parts;
    const q = 'auto:eco';
   
    let srcSetWidths;
    if (priority) {
      srcSetWidths = isMobile ? [400, 800, 1200] : [600, 1200, 1920];
    } else {
      srcSetWidths = isMobile ? [150, 300, 500] : [300, 500, 800];
    }
   
    return srcSetWidths
      .map(w => `${base}f_auto,q_${q},w_${w},c_limit/v${ver}/${path}${query || ''} ${w}w`)
      .join(', ');
  };

  return (
    <img
      ref={ref}
      src={optimizeUrl(src)}
      srcSet={generateSrcSet()}
      sizes={sizes}
      alt={alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchpriority={priority ? 'high' : undefined}
      {...props}
    />
  );
});

const PerfectFitSection = () => {
  const navigate = useNavigate();
  const imageRefs = useRef([]);
  const textRefs = useRef([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Your original image URLs
  const images = [
    "https://res.cloudinary.com/dihmaledw/image/upload/f_auto,q_auto:eco,w_800/v1759486594/DSC04399_1_1_uqeu3r.jpg",
    "https://res.cloudinary.com/dihmaledw/image/upload/f_auto,q_auto:eco,w_800/v1759486587/_T7A4987_1_ltmbiq.jpg",
    "https://res.cloudinary.com/dihmaledw/image/upload/f_auto,q_auto:eco,w_800/v1759485594/_T7A4667_kycdfp.jpg",
    "https://res.cloudinary.com/dihmaledw/image/upload/f_auto,q_auto:eco,w_800/v1759485605/_T7A4854_oqkv8d.jpg",
    "https://res.cloudinary.com/dihmaledw/image/upload/f_auto,q_auto:eco,w_800/v1759485594/_T7A4560_qeeabx.jpg",
    "https://res.cloudinary.com/dihmaledw/image/upload/f_auto,q_auto:eco,w_800/v1759485590/_T7A4951_cdbzyj.jpg",
    "https://res.cloudinary.com/dihmaledw/image/upload/f_auto,q_auto:eco,w_800/v1759486767/_T7A4629_1_mvuj7v.jpg",
  ];

  const [loadedImages, setLoadedImages] = useState(
    new Array(images.length).fill(false)
  );

  // Handle window resize to update isMobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Preload the first image if mobile (for LCP optimization)
  useEffect(() => {
    if (isMobile && images.length > 0) {
      let firstUrl = images[0];
      // Simple optimization for preload
      firstUrl = firstUrl.replace(/\/upload\/[^\/]+/, '/upload/f_auto,q_auto:eco,w_300,c_limit/');
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.fetchpriority = 'high';
      link.href = firstUrl;
      document.head.appendChild(link);
     
      return () => document.head.removeChild(link);
    }
  }, [isMobile]);

  useEffect(() => {
    // Hover animations
    imageRefs.current.forEach((img) => {
      if (img) {
        img.addEventListener("mouseenter", () => {
          img.style.transform = "scale(1.05)";
          img.style.filter = "brightness(1.1)";
        });
        img.addEventListener("mouseleave", () => {
          img.style.transform = "scale(1)";
          img.style.filter = "brightness(1)";
        });
      }
    });

    // Text reveal animation
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    });

    textRefs.current.forEach((ref) => ref && observer.observe(ref));

    return () => observer.disconnect();
  }, []);

  const handleShopNow = () => {
    navigate("/products/bras");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const gallerySizes = "(min-width: 1024px) 14.28vw, (min-width: 768px) 25vw, 33.33vw";

  const renderImage = (src, index) => (
    <div
      key={index}
      className="relative overflow-hidden"
      style={{ aspectRatio: "4/5" }}
    >
      {!loadedImages[index] && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
      <CloudinaryImage
        ref={(el) => (imageRefs.current[index] = el)}
        src={src}
        alt={`Bra fit ${index + 1}`}
        className={`w-full h-full object-cover transition-all duration-300 ease-out ${
          loadedImages[index] ? "opacity-100" : "opacity-0"
        }`}
        priority={index === 0}
        sizes={gallerySizes}
        onLoad={() =>
          setLoadedImages((prev) => {
            const updated = [...prev];
            updated[index] = true;
            return updated;
          })
        }
      />
    </div>
  );

  return (
    <div className="w-full flex flex-col my-4">
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Bungee+Shade&family=ABeeZee:ital,wght@0,400;1,400&family=Abhaya+Libre:wght@800&display=swap"
        rel="stylesheet"
      />

      {/* ------------------ Image Section ------------------ */}
      <div className="w-full">
        {/* Desktop: 7 images */}
        <div className="hidden lg:flex w-full">
          {images.map((src, index) => (
            <div
              key={index}
              className="flex-1 border-[4px] border-[#F9D6E2] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
            >
              {renderImage(src, index)}
            </div>
          ))}
        </div>

        {/* Tablet: 4 top, 3 bottom */}
        <div className="hidden md:block lg:hidden w-full">
          <div className="flex w-full">
            {images.slice(0, 4).map((src, index) => (
              <div
                key={index}
                className="flex-1 border-[4px] border-[#F9D6E2] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
              >
                {renderImage(src, index)}
              </div>
            ))}
          </div>
          <div className="flex w-full">
            {images.slice(4, 7).map((src, idx) => {
              const index = idx + 4;
              return (
                <div
                  key={index}
                  className="flex-1 border-[4px] border-[#F9D6E2] rounded-xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
                >
                  {renderImage(src, index)}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: 3x2 grid with baby pink border + soft shadow */}
        <div className="grid grid-cols-3 gap-2 md:hidden w-full p-2 bg-white">
          {images.slice(0, 6).map((src, index) => (
            <div
              key={index}
              className="border-[4px] border-[#F9D6E2] rounded-xl overflow-hidden shadow-[0_4px_18px_rgba(0,0,0,0.08)] transition-shadow duration-300 hover:shadow-[0_8px_26px_rgba(0,0,0,0.12)]"
            >
              {renderImage(src, index)}
            </div>
          ))}
        </div>
      </div>

      {/* ------------------ Text Section ------------------ */}
      <div
        className="flex-1 flex flex-col justify-center items-center text-center px-4 py-8 sm:py-12 lg:py-5"
        style={{
          backgroundColor: "rgba(249, 231, 237, 1)",
          minHeight: "clamp(300px, 30vh, 500px)",
        }}
      >
        <div
          ref={(el) => (textRefs.current[0] = el)}
          className="mb-2 sm:mb-4 opacity-0 transition-all duration-800"
          style={{
            fontFamily: '"Bungee Shade", cursive',
            fontSize: "clamp(1.5rem, 4vw, 4rem)",
            transform: "translateY(30px)",
            lineHeight: "1.1",
          }}
        >
          FIND YOUR
        </div>

        <div
          ref={(el) => (textRefs.current[1] = el)}
          className="mb-4 sm:mb-6 font-bold tracking-widest opacity-0 transition-all duration-800 delay-200"
          style={{
            fontFamily: '"Abhaya Libre", serif',
            fontWeight: "800",
            fontSize: "clamp(1.25rem, 3.5vw, 3rem)",
            letterSpacing: "clamp(0.1em, 0.3em, 0.5em)",
            transform: "translateY(30px)",
            lineHeight: "1.1",
          }}
        >
          PERFECT FIT
        </div>

        <div
          ref={(el) => (textRefs.current[2] = el)}
          className="mb-6 sm:mb-8 opacity-0 transition-all duration-800 delay-400 text-center max-w-md"
          style={{
            fontFamily: '"ABeeZee", sans-serif',
            fontWeight: 400,
            fontSize: "clamp(1.1rem, 2.5vw, 1.8rem)",
            lineHeight: "1.2",
            transform: "translateY(30px)",
          }}
        >
          Your Comfiest Bra Awaits
        </div>

        <div
          ref={(el) => (textRefs.current[3] = el)}
          className="opacity-0 transition-all duration-800 delay-600"
          style={{ transform: "translateY(30px)" }}
        >
          <button
            onClick={handleShopNow}
            className="border-2 border-black font-semibold tracking-wider hover:bg-black hover:text-white transition-all duration-300 transform hover:scale-105 cursor-pointer"
            style={{
              padding: "clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem)",
              fontSize: "clamp(0.9rem, 1.8vw, 1.125rem)",
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