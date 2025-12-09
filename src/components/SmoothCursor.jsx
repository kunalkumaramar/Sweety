"use client"
import React from "react";
import { useEffect, useRef, useState } from "react";

const DefaultCursorSVG = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={24}
      height={24}
      viewBox="0 0 24 24"
      fill="none"
      style={{ scale: 1 }}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M12.001 20.727c-.316 0-.63-.098-.892-.293-1.93-1.435-3.54-2.84-4.854-4.2-.134-.139-.298-.268-.482-.387C2.257 10.063 2 9.111 2 8.145 2 5.76 3.85 4 6.09 4c1.148 0 2.183.45 2.96 1.268l.944.985.944-.985A4.214 4.214 0 0 1 13.897 4c2.241 0 4.103 1.76 4.103 4.145 0 .966-.257 1.918-.373 2.215-.584 1.186-1.542 2.487-2.882 3.874-1.313 1.36-2.924 2.765-4.854 4.2-.262.195-.576.293-.892.293Z"
        fill="#ff4d8d"
      />
      <path
        d="M12 19.9c-1.83-1.36-3.348-2.694-4.595-3.998-1.202-1.258-2.053-2.418-2.57-3.47-.24-.488-.502-1.355-.502-2.287C4.333 7.12 5.64 5.833 7.35 5.833c.84 0 1.6.33 2.18.93L12 9.333l2.47-2.57c.58-.6 1.34-.93 2.18-.93 1.71 0 3.017 1.286 3.017 3.313 0 .932-.262 1.799-.502 2.287-.517 1.052-1.368 2.212-2.57 3.47C15.348 17.206 13.83 18.54 12 19.9Z"
        fill="white"
        opacity="0.15"
      />
    </svg>
  );
};

export function SmoothCursor({
  cursor = <DefaultCursorSVG />,
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const cursorRef = useRef(null);

  // Detect mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ⭐ OPTIMIZATION: Delay cursor activation until after page load
  useEffect(() => {
    if (isMobile) return;

    // Wait for page to be fully loaded and idle
    if (document.readyState === 'complete') {
      // Delay by 2 seconds to not interfere with FCP/LCP
      const timer = setTimeout(() => setIsEnabled(true), 2000);
      return () => clearTimeout(timer);
    } else {
      const handleLoad = () => {
        const timer = setTimeout(() => setIsEnabled(true), 2000);
        return () => clearTimeout(timer);
      };
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [isMobile]);

  useEffect(() => {
    if (isMobile || !isEnabled) {
      document.body.style.cursor = "auto";
      return;
    }

    const handleMouseMove = (e) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    document.body.style.cursor = "none";
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.style.cursor = "auto";
    };
  }, [isMobile, isEnabled]);

  if (isMobile || !isEnabled) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      style={{
        position: "fixed",
        left: cursorPos.x,
        top: cursorPos.y,
        transform: "translate(-50%, -50%)",
        zIndex: 100,
        pointerEvents: "none",
      }}
    >
      {cursor}
    </div>
  );
}
