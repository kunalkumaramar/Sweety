import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

const Banner = () => {
  const bannerRef = useRef(null);
  const bannerText = "Introductory flat 10% OFF on all items! Use code ' NEW10 '";

  useEffect(() => {
    const ctx = gsap.context(() => {
      const el = bannerRef.current;
      const totalWidth = el.scrollWidth / 2; // Half since we duplicate tracks

      gsap.to(el, {
        x: -totalWidth,
        duration: 60, // speed (lower = faster)
        ease: "linear",
        repeat: -1,
      });
    }, bannerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="bg-[#f06292] text-white py-1 my-2 overflow-hidden relative">
      <div ref={bannerRef} className="flex whitespace-nowrap">
        {/* Track 1 */}
        {Array(20)
          .fill(bannerText)
          .map((text, index) => (
            <span
              key={`track1-${index}`}
              className="px-8 text-sm font-medium tracking-wider"
            >
              {text}
            </span>
          ))}
        {/* Track 2 */}
        {Array(20)
          .fill(bannerText)
          .map((text, index) => (
            <span
              key={`track2-${index}`}
              className="px-8 text-sm font-medium tracking-wider"
            >
              {text}
            </span>
          ))}
      </div>
    </div>
  );
};

export default Banner;
