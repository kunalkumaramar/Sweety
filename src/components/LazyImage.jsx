// src/components/LazyImage.jsx
import React, { useState, useEffect, useRef } from 'react';

/**
 * ✅ OPTIMIZED: Lazy load images with Low-Quality Image Placeholder (LQIP)
 * - Loads low-quality blurred image first while full image loads
 * - Only loads when image enters viewport
 * - Reduces LCP and improves perceived performance
 */
export const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  width = 'auto',
  height = 'auto',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3C/svg%3E',
  lowQualityPlaceholder = null,
  onLoad = () => {},
  priority = false,
  sizes = '100vw',
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageRef, setImageRef] = useState(null);
  const imageElementRef = useRef(null);

  // ✅ Load high-quality image when it enters viewport
  useEffect(() => {
    let observer;

    // If priority is true, load immediately
    if (priority) {
      setImageSrc(src);
      return;
    }

    if ('IntersectionObserver' in window && imageRef) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // First set to low-quality if available, then upgrade to high-quality
              if (lowQualityPlaceholder && imageSrc === placeholder) {
                setImageSrc(lowQualityPlaceholder);
              } else {
                setImageSrc(src);
              }
              observer.unobserve(entry.target);
            }
          });
        },
        { 
          rootMargin: '100px' // Start loading 100px before entering viewport
        }
      );

      observer.observe(imageRef);
    } else {
      // Fallback for browsers without IntersectionObserver
      setImageSrc(src);
    }

    return () => {
      if (observer && imageRef) {
        observer.unobserve(imageRef);
      }
    };
  }, [src, imageRef, priority, lowQualityPlaceholder, imageSrc, placeholder]);

  // ✅ Upgrade from LQIP to full quality when LQIP is loaded
  useEffect(() => {
    if (lowQualityPlaceholder && imageSrc === lowQualityPlaceholder && imageElementRef.current) {
      // Preload high-quality image
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
      };
      img.src = src;
    }
  }, [imageSrc, lowQualityPlaceholder, src]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad();
  };

  return (
    <img
      ref={(el) => {
        setImageRef(el);
        imageElementRef.current = el;
      }}
      src={imageSrc}
      alt={alt}
      className={`${className} transition-opacity duration-500 ease-in-out ${
        isLoaded ? 'opacity-100' : 'opacity-70'
      }`}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      onLoad={handleImageLoad}
      sizes={sizes}
      decoding="async"
    />
  );
};

export default LazyImage;
