// src/components/LazyImage.jsx
import React, { useState, useEffect, useRef } from 'react';

/**
 * Lazy load images to improve LCP and reduce network payload
 * Only loads images when they enter viewport
 */
export const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  width = 'auto',
  height = 'auto',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"%3E%3C/svg%3E'
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [imageRef, setImageRef] = useState(null);

  useEffect(() => {
    let observer;

    if ('IntersectionObserver' in window && imageRef) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              observer.unobserve(entry.target);
            }
          });
        },
        { 
          rootMargin: '50px' // Start loading 50px before entering viewport
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
  }, [src, imageRef]);

  return (
    <img
      ref={setImageRef}
      src={imageSrc}
      alt={alt}
      className={`${className} transition-opacity duration-300`}
      width={width}
      height={height}
      loading="lazy"
      style={{
        opacity: imageSrc === placeholder ? 0.5 : 1,
      }}
    />
  );
};

export default LazyImage;
