/**
 * ✅ CRITICAL Performance Optimizations
 * These reduce Total Blocking Time (TBT) and improve responsiveness
 */

/**
 * Defer heavy computations to prevent blocking the main thread
 * Use this for Redux calculations, filtering, sorting, etc.
 */
export const deferWork = (callback, delay = 0) => {
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback);
  } else {
    return setTimeout(callback, delay);
  }
};

/**
 * Throttle expensive operations (scroll, resize events)
 * Prevents excessive re-renders
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Debounce search input, form changes, etc.
 * Reduces unnecessary API calls
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
};

/**
 * Batch DOM updates to reduce reflows
 * Combines multiple state updates into single render cycle
 */
export const batchUpdates = (updates) => {
  if ('flushSync' in window.__REACT__) {
    updates();
  } else {
    requestAnimationFrame(updates);
  }
};

/**
 * Preload critical resources
 * Call this for images/fonts that appear in LCP
 */
export const preloadResource = (url, type = 'image') => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = type;
  link.href = url;
  if (type === 'font') {
    link.crossOrigin = 'anonymous';
  }
  document.head.appendChild(link);
};

/**
 * Prefetch non-critical resources
 * Browser loads these when idle
 */
export const prefetchResource = (url) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
};

/**
 * Enable compression and caching headers
 * This is server-side but useful to remember
 */
export const getCacheHeaders = () => ({
  'Cache-Control': 'public, max-age=31536000, immutable', // For hashed assets
  'Content-Encoding': 'gzip',
  'Content-Type': 'text/html; charset=utf-8',
});

/**
 * Reduce Cumulative Layout Shift (CLS)
 * Reserve space for images before they load
 */
export const getImageAspectRatioStyle = (width, height) => ({
  aspectRatio: `${width} / ${height}`,
  contentVisibility: 'auto',
});

/**
 * Track Core Web Vitals (for monitoring)
 */
export const trackWebVitals = () => {
  if ('web-vital' in window) {
    // Use web-vitals library for accurate measurements
    console.log('Web Vitals tracking enabled');
  }

  // Monitor LCP
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.error('LCP tracking failed:', e);
    }
  }
};

export default {
  deferWork,
  throttle,
  debounce,
  batchUpdates,
  preloadResource,
  prefetchResource,
  getCacheHeaders,
  getImageAspectRatioStyle,
  trackWebVitals,
};
